# Workflow System Guide

**Audience:** Software engineer familiar with Elixir but new to this platform's workflow system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [The Workflow Lifecycle](#the-workflow-lifecycle)
4. [Blocks: Capturing Task Outcomes](#blocks-capturing-task-outcomes)
5. [Summaries: Aggregating Workflow State](#summaries-aggregating-workflow-state)
6. [Statuses and Transitions](#statuses-and-transitions)
7. [Tasks: Units of Work](#tasks-units-of-work)
8. [Queues: Role-Based Work Distribution](#queues-role-based-work-distribution)
9. [Lookup Tables (LKU): Config Data](#lookup-tables-lku-config-data)
10. [Frontend Architecture](#frontend-architecture)
11. [Walkthrough: Benefits Support Workflow](#walkthrough-benefits-support-workflow)
12. [Walkthrough: Engagement Workflow](#walkthrough-engagement-workflow)
13. [Building a New Workflow: Medical Records](#building-a-new-workflow-medical-records)

---

## Architecture Overview

The workflow system is split across two layers:

- **Core** (`apps/core`): Generic workflow engine. Owns the `workflows`, `workflow_tasks`, `workflow_status_periods`, and queue infrastructure. Knows nothing about specific business processes.
- **Tenant/FH** (`apps/fh`): Business-specific workflow implementations. Defines what statuses exist, what tasks to create, what data to capture in blocks, and how to transition between states.

The key insight: **Core provides the skeleton (workflow, tasks, status periods, queues), while FH provides the muscles (statuses, transition logic, blocks, summaries).**

### Key Files by Layer

| Layer | Purpose | Path Pattern |
|-------|---------|-------------|
| Core schema | Workflow, WorkflowTask, WorkflowStatusPeriod | `apps/core/lib/core/workflows/*.ex` |
| Core context | CRUD + state machine helpers | `apps/core/lib/core/workflows/workflows.ex` |
| Core queues | Queue management | `apps/core/lib/core/workflow_queues.ex` |
| FH statuses | Status definitions per workflow type | `apps/fh/lib/fh/<domain>/<domain>_statuses.ex` |
| FH tasks | Task type definitions per workflow type | `apps/fh/lib/fh/<domain>/<domain>_tasks.ex` |
| FH workflows | Creation + transition logic | `apps/fh/lib/fh/<domain>/<domain>_workflows.ex` |
| FH block | Per-task outcome data schema | `apps/fh/lib/fh/<domain>/wf_<domain>_block.ex` |
| FH summary | Aggregated workflow-level state | `apps/fh/lib/fh/<domain>/wf_<domain>_summary.ex` |
| FH LKU values | Seed data for lookup tables | `apps/fh/lib/fh/workflows/*_values.ex` |

---

## Core Concepts

### Concept Map

```
Workflow (1)
├── type_key ──────────────► WorkflowLkuType (e.g., "bensup", "engagement")
├── status_key ────────────► WorkflowLkuStatus (e.g., "bensup_nme_needed")
├── current_status_period ─► WorkflowStatusPeriod (temporal: start_at / end_at)
├── tasks ─────────────────► WorkflowTask[] (units of work)
│   ├── type_key ──────────► WorkflowTaskLkuType (e.g., "bensup_nme")
│   ├── status_key ────────► WorkflowTaskLkuStatus (new/in_progress/completed/closed/cancelled)
│   ├── assignment ────────► User | Team+Role | Queue
│   └── queue_status_key ──► WorkflowTaskQueueLkuStatus (queue-specific statuses)
└── [FH-specific]
    ├── WfXxxSummary ──────► Aggregated state across the workflow's lifetime
    └── WfXxxBlock[] ──────► Per-task outcome snapshots
```

### How the Pieces Relate

1. A **Workflow** represents a long-running business process for a patient (e.g., "get this patient benefits support").
2. The workflow moves through **Statuses** over time. Each status transition creates a new **WorkflowStatusPeriod** record (temporal — has `start_at` and `end_at`).
3. Each status has one or more **Tasks** — concrete work items assigned to a role, user, or queue.
4. When a user completes a task, they submit a **Block** — a snapshot of the outcome data captured during that task.
5. The block data is merged into the **Summary** — the running aggregate of all outcomes across the workflow.
6. A transition function examines the updated summary and decides the **next status**.
7. If the status changes, the current status period is closed, a new one opens, old tasks are closed, and new tasks are created.

---

## The Workflow Lifecycle

### Creation

All workflow creation goes through `Core.Workflows.create_workflow_multi/1`, which returns an `Ecto.Multi` struct (not yet executed). The FH layer appends additional steps and then calls `Repo.transact()`.

```elixir
# Core creates the workflow + first status period
Core.Workflows.create_workflow_multi(%{
  org_id: org_id,
  patient_id: patient_id,
  type_key: "bensup",
  status_key: "bensup_nme_needed",
  start_why: "Bensup workflow created"
})
# Returns a Multi with :create_wf and :create_wf_status_period steps

# FH appends domain steps
|> Multi.insert(:bensup_wf_summary, &create_summary/1)
|> Multi.run(:first_task, &create_first_task/2)
|> Repo.transact()
```

The Multi pattern is critical — every workflow creation is a single database transaction that creates the workflow, its initial status period, the domain summary, and the first task(s).

### The save_workflow_block Pipeline

This is the heart of the system. Both benefits support and engagement use an identical pipeline structure in their `save_workflow_block/1` function:

```
Multi.new()
│
├── 1. put(:params, ...)           ─ Stash the incoming block data
├── 2. one(:current_task, ...)     ─ Fetch the task being completed
├── 3. one(:xxx_wf_summary, ...)   ─ Fetch the current workflow summary
├── 4. insert(:block, ...)         ─ Insert a new block record (outcome snapshot)
├── 5. update(:update_xxx_wf, ...) ─ Merge block data into the summary
├── 6. run(:new_status, ...)       ─ Compute next status from updated summary
├── 7. run(:move_to_new_status, ..)─ If status changed: close old period, open new
├── 8. run(:close_current_task, ..)─ Complete the current task
├── 9. run(:close_other_tasks, ..) ─ Close any remaining active tasks (on status change)
└── 10. run(:create_next_tasks, ..)─ Create tasks for the new status
```

All 10 steps run in a single database transaction. If any step fails, everything rolls back.

---

## Blocks: Capturing Task Outcomes

A **Block** is a point-in-time record of what happened when a task was completed. Think of it as a "form submission receipt."

### Schema Pattern

Every block has these standard associations:
- `belongs_to :workflow` — which workflow this belongs to
- `belongs_to :workflow_task` — which task was being completed
- `belongs_to :workflow_status_period` — the status period when it was submitted
- `belongs_to :wf_xxx_summary` — the parent summary
- `belongs_to :completed_by` — who submitted it

Plus domain-specific fields. For example, an engagement block captures:

```elixir
field :reached_patient, :boolean
field :met_patient, :boolean
field :wpa_facilitated, :boolean
belongs_to :consent_for_treatment, PatientConsent
```

A bensup block captures whichever fields are relevant to the current task type: NME eligibility flags, medical evaluation results, sobriety visit data, application submission flags, etc.

### Block vs. Form

"Block" is not a UI concept — it's a data model. On the frontend, users fill out a **form** that is specific to the current task type. When they submit, the frontend calls a mutation (e.g., `useSaveWfBensupBlockMutation`), which hits the backend `save_workflow_block/1` function. The block is just the Ecto schema that persists what they entered.

Multiple blocks can exist per workflow — one is created each time a task is completed. This gives you a full audit trail.

---

## Summaries: Aggregating Workflow State

A **Summary** is a single row per workflow that accumulates state over time. When a new block is saved, its fields are merged into the summary.

### Why Summaries Exist

The transition logic needs to know "what has happened so far across the entire workflow?" — not just "what did the user just submit." For example, in bensup, the `new_status_ms/2` function checks `wf.nme_is_eligible`, `wf.medical_evaluation_is_med_evaluation_complete`, etc. These are summary fields, not block fields.

### Summary Fields Mirror Block Fields

The summary schema typically has the same fields as the block (or a superset). When `update_wf_summary_ms/1` runs, it merges the block's params into the summary:

```elixir
defp update_wf_summary_ms(%{xxx_wf_summary: wf, block: block, params: params}) do
  params = Map.put(params, :last_updated_by_block_id, block.id)
  WfXxxSummary.changeset(wf, params)
end
```

For most cases, this is a straightforward merge. The sobriety status in bensup is an exception — it has custom logic to count consecutive sober visits.

---

## Statuses and Transitions

### Status Definitions

Each workflow type defines its statuses in a dedicated module (e.g., `FH.Bensup.BensupStatuses`). Each status is a function that returns a map:

```elixir
def nme_needed(reason \\ nil) do
  %{
    key: "bensup_nme_needed",       # Unique key (prefixed with workflow type)
    reason: reason,                  # Why we entered this status
    name: "NME Needed",             # Human-readable label
    tasks: [BensupTasks.nme()],     # Tasks to create when entering this status
    display_order: 1                 # UI ordering
  }
end
```

Key conventions:
- Status keys are prefixed with the workflow type: `bensup_nme_needed`, `engagement_fail_fast`
- The key is derived from the function name: `function_name_as_status(__ENV__.function)`
- Terminal statuses include `is_terminal_status: true`
- Each status declares which tasks should be created when a workflow enters it

### Transition Logic

There is **no formal state machine library**. Transitions are coded as a `case` statement in `new_status_ms/2` that dispatches on the current status:

```elixir
def new_status_ms(_repo, %{bensup_wf_summary: prev_wf, update_bensup_wf: wf}) do
  result = case prev_wf.workflow.status_key do
    "bensup_nme_needed" -> handle_status_from_bensup_nme(prev_wf, wf)
    "bensup_medical_evaluation_needed" -> handle_status_from_medical_evaluation(prev_wf, wf)
    # ... one clause per status
  end
  {:ok, result}
end
```

Each handler examines the **updated summary** (`wf`) and uses `cond` to decide the next status:

```elixir
defp handle_status_from_bensup_nme(_prev_wf, wf) do
  cond do
    wf.nme_is_currently_receiving_benefits ->
      BensupStatuses.successful("Currently receiving benefits")
    wf.nme_is_eligible ->
      BensupStatuses.medical_evaluation_needed("NME is eligible")
    true ->
      BensupStatuses.not_eligible(build_nme_ineligible_reason(wf))
  end
end
```

The returned status map includes a `:tasks` list. If the status changes, `create_next_tasks_ms/2` iterates over that list and creates the tasks via `Core.Workflows.create_workflow_patient_task/1`.

### Status Change Mechanics

When `new_status_ms/2` returns a different status key than the current one:

1. `move_to_new_status_ms/2` calls `Core.Workflows.move_to_new_status/2`
2. Core updates `workflow.status_key`
3. Core closes the current `WorkflowStatusPeriod` (sets `end_at`)
4. Core inserts a new `WorkflowStatusPeriod` with the new status key
5. `close_other_tasks_ms/2` sets all active tasks to `status_key: "closed"`
6. `create_next_tasks_ms/2` creates the tasks declared by the new status

If the status doesn't change (e.g., user submitted partial data), the workflow stays in the same status, tasks remain open, and no new tasks are created.

---

## Tasks: Units of Work

### Task Schema

`Core.Workflows.WorkflowTask` is the workhorse entity:

| Field | Purpose |
|-------|---------|
| `type_key` | What kind of task (e.g., `bensup_nme`, `engagement_try_all_contact_info`) |
| `status_key` | Lifecycle state: `new`, `in_progress`, `completed`, `closed`, `cancelled` |
| `queue_status_key` | Queue-specific status (used when task is on a queue) |
| `instructions` | Human-readable description of what to do |
| `assigned_to_id` | Direct user assignment |
| `assigned_to_team_id` + `assigned_to_business_role_key` | Team + role assignment |
| `assigned_to_queue_id` | Queue assignment |
| `workflow_status_period_id` | Which status period this task belongs to |
| `start_at`, `due_at`, `end_at` | Timing |
| `calculated_weight`, `calculated_priority_weight` | Derived from tags for queue ordering |

### Task Type Definitions

Like statuses, task types are defined in FH modules as functions returning maps:

```elixir
def nme do
  %{
    key: "bensup_nme",
    name: "NME",
    role: "firsthand_guide",
    instructions: "Complete the NME form",
    weight: 1.0,
    priority_weight: 1.0
  }
end
```

The `role` field determines the default `assigned_to_business_role_key` when the task is created.

### Task Assignment

Tasks support three mutually exclusive assignment models:

1. **User** (`assigned_to_id`) — assigned directly to a person
2. **Team + Role** (`assigned_to_team_id` + `assigned_to_business_role_key`) — assigned to whoever holds that role on the team
3. **Queue** (`assigned_to_queue_id`) — placed in a queue for any worker to grab

In the current workflow implementations, tasks are typically assigned to a team + role (the patient's care team + the appropriate business role for the task type).

### Task History

Every update to a task creates a `WorkflowTaskHistory` record — a temporal snapshot with `valid_from` and `valid_to`. The current record has `is_current: true`.

### Task Statuses

Task statuses are generic across all workflow types:
- `new` — just created, not started
- `in_progress` — someone is working on it
- `completed` — done successfully
- `closed` — closed by the system (e.g., when workflow moves to a new status)
- `cancelled` — manually cancelled

Each status has boolean flags: `is_active_status`, `is_wip_status`, `is_completed_status`, `is_cancelled_human_status`, `is_cancelled_system_status`.

---

## Queues: Role-Based Work Distribution

Queues allow tasks to be distributed to a pool of workers rather than a specific person.

### Queue Structure

- `WorkflowTaskQueue` — a named queue instance (e.g., "Escalation Triage Queue")
- `WorkflowTaskQueueLkuType` — queue type with `lock_time_seconds` (e.g., 1800 = 30 min)
- `WorkflowTaskQueueLkuStatus` — queue-specific statuses per queue type
- `WorkflowTaskQueueWorkerPeriod` — tracks which users are members of a queue

### Queue Workflow

1. A task is created with `assigned_to_queue_id` set (and optionally `queue_status_key`)
2. Workers see tasks in their queue list
3. A worker **grabs** a task — this acquires a time-limited lock (`get_lock/3`)
4. While locked, the task appears as "mine" to the worker
5. The worker either **completes** the task (marks `status_key: "completed"`) or **releases** it back to the queue
6. Locks expire automatically after `lock_time_seconds`

### Queue Statuses

Unlike task statuses (which are generic), **queue statuses** are specific to each queue type. These allow tracking a task's position within a queue-based workflow. For example, a medical records queue might have statuses like "needs_fax", "awaiting_response", "needs_followup".

Queue status changes are tracked via `WorkflowTaskQueueStatusPeriod` (temporal records).

---

## Lookup Tables (LKU): Config Data

The LKU system provides a way to define valid values for workflow types, statuses, task types, etc. It uses a core/tenant extension pattern:

1. **Core** defines the schema (e.g., `WorkflowLkuType`, `WorkflowTaskLkuType`)
2. **Core** defines a `Core.ConfigData.Schema` module that declares which seed data Core provides
3. **FH** defines a `Core.ConfigData.Extension` module that adds tenant-specific values

For example:

```elixir
# apps/fh/lib/fh/workflows/workflow_lku_type_values.ex
defmodule FH.Workflows.WorkflowLkuTypeValues do
  use Core.ConfigData.Extension, schema: Core.Workflows.WorkflowLkuType

  def values do
    [
      %{key: "bensup", name: "Benefits Support", org_id: 1},
      %{key: "engagement", name: "Engagement", org_id: 1},
      %{key: "isj", name: "Individual Status Journey", org_id: 1}
    ]
  end
end
```

These values are seeded into the database and used as foreign key targets.

### Adding a New Workflow Type

To register a new workflow type, you need to add values to:

1. `WorkflowLkuTypeValues` — the workflow type itself
2. `WorkflowLkuStatusValues` — all statuses for the new type
3. `WorkflowTaskLkuTypeValues` — all task types for the new type
4. Optionally: queue types, queue statuses, event types

---

## Frontend Architecture

### Rendering Hierarchy

```
WorkflowDetailPage
└── WorkflowJourneyView
    ├── InfoCards (patient name, current owner)
    ├── WorkflowJourneyRail (SVG timeline visualization)
    └── Right Panel (tabs: Summary / Comments / Tasks)
        ├── JourneyPeriodDetail (tasks + events for selected status period)
        ├── WorkflowCommentsSection
        ├── WorkflowTasksSection
        └── [Slot] workflowSummaryCardSlot (e.g., BensupSummaryCard)
```

### Slot System

The frontend uses a **slot registry** pattern to inject workflow-type-specific components without Core knowing about them:

- `workflowSummaryCardSlot` — shows a summary card on the workflow detail page (only bensup currently uses this)
- `taskFormSlot` — renders the task-type-specific form inside the generic `TaskForm` component

Registration happens in FH's frontend code:

```typescript
// Register task form components per task type
taskFormSlot.registerLazy(() => ({
  'bensup_nme': SomeComponent,
  'bensup_determine_sobriety': AnotherComponent,
  'engagement_try_all_contact_info': EngagementContactForm,
  // ...
}));
```

### Task Form Flow

1. User clicks a task → `WorkflowTaskDetailView` opens
2. `TaskForm` renders generic fields (due date, notes, assignment)
3. `TaskForm` checks `taskFormSlot` for a component registered under the task's `type_key`
4. If found, the slot component renders (e.g., `SobrietyTaskForm`)
5. The slot component uses a domain hook (e.g., `useBensupTaskForm`) to load/save block data
6. On submit, `useTaskForm` coordinates: runs the slot's save (block mutation) and the generic task update in parallel via `Promise.allSettled`
7. On success, `invalidateWorkflowQueries` refetches the workflow — the backend may have changed its status

### State Transitions from Frontend

The frontend **does not explicitly trigger workflow status transitions**. Instead:
1. The user completes a task form (saves a block + updates task status)
2. The backend's `save_workflow_block` pipeline handles everything transactionally
3. The frontend refetches the workflow data and observes the new status

For queue-based tasks, the frontend uses:
- `useAcquireTaskLockMutation` — grab a task
- `useUpdateWorkflowTaskMutation` — complete/update a task
- `useReleaseTaskLockMutation` — release a task back to the queue

---

## Walkthrough: Benefits Support Workflow

**Type key:** `bensup`

### Statuses (in order)

| # | Status Key | Tasks Created | Terminal? |
|---|-----------|---------------|-----------|
| 1 | `bensup_nme_needed` | `bensup_nme` (fG) | |
| 2 | `bensup_medical_evaluation_needed` | `bensup_schedule_medical_evaluation` (fG) + `bensup_medical_evaluation_needed` (PNP) | |
| 3 | `bensup_sobriety_needed` | `bensup_determine_sobriety` (PNP, starts +30 days) | |
| 4 | `bensup_documentation_review_needed` | `bensup_review_documentation` (SOAR) | |
| 5 | `bensup_documentation_build_needed` | 3 tasks: schedule handoff (fG), filing date (SOAR), complete app (SOAR) | |
| 6 | `bensup_specialist_referral_needed` | `bensup_specialist_referral_needed` (PNP) | |
| 7 | `bensup_medical_records_needed` | `bensup_retrieve_medical_records` (MR specialist) | |
| 8 | `bensup_application_submission_needed` | `bensup_print_sign_submit_application` (fG) | |
| 9 | `bensup_outcome_needed` | `bensup_record_outcome` (SOAR) | |
| 10 | `bensup_documentation_needed_for_first_rejection` | `bensup_revise_documentation` (SOAR) | |
| 11 | `bensup_attorney_referral` | `bensup_refer_and_schedule_attorney` (SOAR) | Yes |
| 12 | `bensup_not_eligible` | (none) | Yes |
| 13 | `bensup_successful` | (none) | Yes |

### Flow Pattern

This is a mostly-sequential workflow with conditional branching:
- After NME: eligible → medical eval, already receiving → successful, not eligible → not_eligible
- After medical eval: needs specialist → specialist referral branch, sober → doc review, not sober → sobriety monitoring
- Sobriety: loops (3 consecutive sober months needed), can exit to not_eligible
- After doc review: can go back to medical eval or medical records if more info needed
- Application outcome: accepted → successful, first rejection → revise + resubmit, second rejection → attorney referral

### Data Model

- **Block** (`wf_bensup_blocks`): ~30 fields covering all task types (NME flags, sobriety data, application status, etc.)
- **Summary** (`wf_bensup_summaries`): Same fields, accumulated over the workflow's lifetime
- **NMEAssessment** (`nme_assessments`): Separate schema for the NME questionnaire (feeds into block via `pull_bensup_block_fields_from_nme`)

---

## Walkthrough: Engagement Workflow

**Type key:** `engagement`

### Statuses (in order)

| # | Status Key | Tasks Created | Terminal? |
|---|-----------|---------------|-----------|
| 1 | `engagement_fail_fast` | `engagement_try_all_contact_info` (fG) | |
| 2 | `engagement_exhaust` | `engagement_try_all_contact_info` (fG) | |
| 3 | `engagement_reached` | `engagement_get_consent_signed` (fG) | |
| 4 | `engagement_met` | `engagement_get_consent_signed` (fG) | |
| 5 | `engagement_wpa_needed` | `engagement_facilitate_wpa` (fG) | |
| 6 | `engagement_successful` | (none) | Yes |
| 7 | `engagement_unable_to_reach` | (none) | Yes |

### Flow Pattern

This workflow progresses based on contact attempts rather than blocks per se:
- Start in `fail_fast` — try all phones once, try all addresses once
- If all tried once but not reached → `exhaust` (more intense outreach: 3 calls, 2 visits, 1 pharmacy)
- If reached → `reached` → get consent signed
- If met in person → `met` → get consent signed
- If consent signed → `wpa_needed` → facilitate WPA
- If WPA facilitated → `successful`
- If all exhausted without contact → `unable_to_reach`

### Key Difference from Bensup

The engagement workflow's transition logic checks **external state** (contact attempt counts from `comms_calls` and `visits` tables) in addition to block/summary fields. The `contact_info_attempts_summary/1` function queries phones, addresses, and pharmacies to count successful/unsuccessful attempts.

### Data Model

- **Block** (`wf_engagement_blocks`): reached_patient, met_patient, consent IDs, wpa_facilitated
- **Summary** (`wf_engagement_summaries`): Same fields, aggregated

---

## Applying These Concepts: Medical Records as a "Super Task"

Not every care process needs its own workflow type. Medical records retrieval is a good example of a process that fits better as **tasks on the ISJ workflow** rather than a separate workflow with its own statuses, blocks, summaries, and transition logic.

### Why Not a Separate Workflow?

The block/summary/transition pipeline (covered in sections 3-6) is designed for workflows that progress through **distinct phases with branching logic**:
- Bensup: NME → medical eval → sobriety → doc review → application → outcome (with conditional branches)
- Engagement: fail fast → exhaust → reached → met → WPA needed → successful

Medical records doesn't have that shape. It has **N independent facilities**, each going through the **same repetitive lifecycle** (fax → wait → follow-up → receive/close). There's no branching, no summary accumulation, no "what phase is the workflow in?" question. The per-facility state is mutable (attempt dates get filled in over time) rather than append-only (like blocks).

### The "Super Task" Pattern

Instead, medical records uses a pattern we call a **super task** — a task that carries richer state than a standard `WorkflowTask` can hold, via a dedicated backing table:

```
ISJ Workflow (type: "isj", status: "isj_activate")
├── ... other ISJ tasks ...
├── WorkflowTask (type: "medical_records_request", queue: medical_records)
│   └── medical_records_requests row (facility state, attempt dates, response file)
├── WorkflowTask (type: "medical_records_request", queue: medical_records)
│   └── medical_records_requests row (different facility)
└── WorkflowTask (type: "medical_records_request", queue: medical_records)
    └── medical_records_requests row (different facility)
```

### What You Build

| Piece | What | Where |
|-------|------|-------|
| Task type LKU | `medical_records_request` | Extension for `WorkflowTaskLkuType` in `apps/fh` |
| Queue type LKU | `medical_records` with `lock_time_seconds` | Extension for `WorkflowTaskQueueLkuType` in `apps/fh` |
| Queue statuses | `needs_first_fax`, `awaiting_first_response`, `needs_second_fax`, `awaiting_second_response`, `needs_third_fax`, `awaiting_third_response`, `received`, `no_response`, `declined` | Extension for `WorkflowTaskQueueLkuStatus` in `apps/fh` |
| Queue instance | Actual queue row | Seed data in `workflow_task_queues` |
| Backing table | `medical_records_requests` | Migration + schema in `apps/fh` |
| Context module | `FH.MedicalRecords` — CRUD for the backing table | `apps/fh/lib/fh/medical_records/medical_records.ex` |
| Controller/API | Endpoint to update a medical records request | `apps/fh_web` |
| Frontend form | Task form slot for `medical_records_request` | `taskFormSlot` registration |

### What You Don't Build

- No new workflow type or workflow LKU values
- No statuses module or status LKU values
- No blocks or summary schemas
- No `save_workflow_block` pipeline
- No `MedicalRecordsWorkflows` module with transition logic

### Backing Table Schema

```elixir
defmodule FH.MedicalRecords.MedicalRecordsRequest do
  schema "medical_records_requests" do
    belongs_to :workflow_task, WorkflowTask
    belongs_to :patient, Patient
    belongs_to :contact, Contact          # the facility
    belongs_to :org, Org

    # Attempts (updated in place as each attempt is made)
    field :attempt_1_sent_at, :utc_datetime_usec
    belongs_to :attempt_1_sent_by, User
    field :attempt_2_sent_at, :utc_datetime_usec
    belongs_to :attempt_2_sent_by, User
    field :attempt_3_sent_at, :utc_datetime_usec
    belongs_to :attempt_3_sent_by, User

    # Response
    field :response_received_at, :utc_datetime_usec
    belongs_to :response_file, CoreFile

    # Resolution
    field :resolution, :string  # received, no_response, declined

    timestamps()
  end
end
```

This table is **updated in place** — not appended to like blocks. When the specialist sends the first fax, they set `attempt_1_sent_at` and `attempt_1_sent_by_id`. When the second fax goes out, `attempt_2_sent_at` and `attempt_2_sent_by_id`. When the PDF comes back, `response_received_at` and `response_file_id`.

### Interaction Model

1. Consents uploaded → system identifies facilities from claims → creates one ISJ task per facility, each assigned to the medical records queue, with a corresponding `medical_records_requests` row
2. Specialist opens the queue workspace, grabs a task (acquires lock)
3. Task form (via `taskFormSlot`) loads the backing table row and shows facility info + current attempt state
4. Specialist performs the action (send fax, upload received PDF)
5. Frontend saves: updates the `medical_records_requests` row + advances the task's `queue_status_key`
6. Task stays open and moves through queue statuses until the facility is resolved
7. On resolution, task is completed

### When to Use This Pattern vs. a Full Workflow

Use a **full workflow** (like bensup/engagement) when:
- The process has distinct, named phases with different work to do in each
- There's branching logic that depends on accumulated state
- You need a summary view that aggregates outcomes across the lifecycle
- The UI needs a journey visualization

Use a **super task** (like medical records) when:
- The work is repetitive across N entities (facilities, documents, etc.)
- Each entity follows the same lifecycle independently
- State is mutable rather than append-only
- The work is queue-driven (grab from pool, work, release/complete)
- There's no meaningful "what phase is the process in?" question — just "is each item done?"
