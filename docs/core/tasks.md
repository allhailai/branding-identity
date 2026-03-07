# Tasks

**Actionable Work Items with Assignments and Status Tracking**

## What is a Task?

A **Task** is an actionable work item that needs to be completed by someone. Tasks are the atomic units of work within workflows, but can also exist independently.

## Core Attributes

**Identity:**
- `id`: Unique identifier
- `type_key`: What kind of task (e.g., "engagement_visit", "medical_records_request", "soar_application")
- `workflow_id`: Parent workflow (nullable - tasks can exist without workflow)

**Status & Assignment:**
- `status_key`: Current state ("pending", "in_progress", "completed", "cancelled")
- `assigned_to_id`: User ID of assignee (nullable - unassigned tasks go in general queues)
- `assigned_to_role_key`: Role assignment instead of specific user (nullable)

**Timing:**
- `due_at`: When task should be completed (nullable)
- `completed_at`: When task was actually completed (nullable)
- `created_at`: When task was created

**Context:**
- `patient_id`: Who this task is for (nullable for non-patient tasks)
- `org_id`: Organization scope
- `metadata`: JSONB field for task-specific data

**Audit:**
- `created_by_id`: Who created the task
- `updated_by_id`: Who last updated the task

**Schema:** `Core.Workflows.WorkflowTask`

## Task Types (Tenant-Configurable)

Core provides the task engine. Tenant defines specific task types relevant to their business.

**Firsthand examples:**
- `engagement_visit`: Initial home visit with consent signing
- `wpa_completion`: Whole Person Assessment by Health Guide
- `soar_visit`: Psychiatric assessment for benefits eligibility
- `medical_records_request`: Request records from facility
- `cdi_prospective_review`: CDI specialist reviews ICD-10 codes
- `toc_followup`: Post-hospital discharge follow-up
- `escalation_response`: Triage nurse handles urgent need

## Task Status Lifecycle

```
pending → in_progress → completed
            ↓
         cancelled
```

**pending**: Task created, awaiting work
**in_progress**: Someone actively working on it
**completed**: Work finished successfully
**cancelled**: Task no longer needed/relevant

## Task Assignment Patterns

### 1. Assigned to Specific User
```elixir
task = %{
  type_key: "engagement_visit",
  assigned_to_id: fg_user.id,
  status_key: "pending"
}
```

Use when: You know exactly who should do it.

### 2. Assigned to Role (Queue-based)
```elixir
task = %{
  type_key: "cdi_prospective_review",
  assigned_to_role_key: "cdi_specialist",
  status_key: "pending"
}
```

Use when: Any member of a role can claim it from queue.

### 3. Unassigned (General Queue)
```elixir
task = %{
  type_key: "medical_records_request",
  assigned_to_id: nil,
  status_key: "pending"
}
```

Use when: Supervisor will assign or team member will claim.

## Assignment History

Every assignment change is tracked in `workflow_task_assignment_periods`.

**When task assigned:**
```elixir
%AssignmentPeriod{
  task_id: task.id,
  assigned_to_id: user.id,
  start_at: DateTime.utc_now(),
  end_at: nil
}
```

**When task reassigned:**
1. End current period (set `end_at`)
2. Create new period for new assignee

This provides complete audit trail of who was responsible when.

## Task History (Audit Log)

Every task change is logged in `workflow_task_history`.

**Captures:**
- What changed (status, assignment, due date, etc.)
- Who changed it (`changed_by_id`)
- When it changed (`changed_at`)
- Previous and new values

**Example:**
```elixir
%TaskHistory{
  task_id: task.id,
  field_changed: "status_key",
  old_value: "pending",
  new_value: "in_progress",
  changed_by_id: user.id,
  changed_at: DateTime.utc_now()
}
```

## Task Queues

Tasks are grouped into **queues** for role-based work management.

**Queue = Filtered task list** based on:
- Task type
- Task status
- Assignment (role, specific user, or unassigned)
- Patient attributes
- Organization/office

**See:** [Queues documentation](./queues.md) for details

## Common Task Operations

### Create Task
```elixir
Core.Workflows.create_user_generated_workflow_task(%{
  workflow_id: workflow.id,
  type_key: "engagement_visit",
  patient_id: patient.id,
  org_id: org.id,
  assigned_to_id: fg.id,
  due_at: ~U[2026-02-20 10:00:00Z],
  created_by_id: mco.id
})
```

### Assign Task
```elixir
Core.Workflows.assign_task(task, user.id, assigned_by_user.id)
```

### Start Task (Move to In Progress)
```elixir
Core.Workflows.update_workflow_task(task, %{
  status_key: "in_progress",
  updated_by_id: user.id
})
```

### Complete Task
```elixir
Core.Workflows.complete_task(task)
# Sets status_key: "completed", completed_at: now()
```

### Cancel Task
```elixir
Core.Workflows.update_workflow_task(task, %{
  status_key: "cancelled",
  updated_by_id: user.id
})
```

## Tasks with Backing Tables ("Super Tasks")

Some task types represent work items with richer state than a simple task can hold. Rather than cramming data into a JSONB metadata field, these task types have a **dedicated backing table** — a separate schema linked via `workflow_task_id` that stores the domain-specific state and is updated in place as the task progresses.

**When to use a backing table vs. metadata:**
- **Backing table**: The task has structured, mutable state that evolves over time (e.g., tracking multiple fax attempts per facility, recording dates and file references). The state needs to be queried and filtered.
- **Metadata JSONB**: Truly ad-hoc, unstructured context that doesn't need to be queried (e.g., free-text notes from escalation triage).

**Example: Medical Records Request**

Medical records retrieval is implemented as ISJ tasks (one per facility) assigned to a medical records queue. Each task has a backing row in `medical_records_requests`:

```elixir
schema "medical_records_requests" do
  belongs_to :workflow_task, WorkflowTask
  belongs_to :patient, Patient
  belongs_to :org, Org

  field :facility_name, :string
  field :facility_npi, :string
  field :facility_fax_number, :string

  field :attempt_1_sent_at, :utc_datetime_usec
  field :attempt_2_sent_at, :utc_datetime_usec
  field :attempt_3_sent_at, :utc_datetime_usec

  belongs_to :response_file, CoreFile
  field :response_received_at, :utc_datetime_usec
  field :resolution, :string  # received, no_response, declined, closed
end
```

The task's `queue_status_key` tracks the facility's lifecycle position (`needs_first_fax` → `awaiting_response` → `needs_second_fax` → etc.), while the backing table holds the actual data.

This pattern keeps the core task schema generic while allowing domain-specific state to be modeled properly with typed columns, associations, and queryability.

## Task Dependencies

Tasks can have implicit dependencies via workflow logic:

**Sequential:** Task B created only after Task A completes
**Parallel:** Multiple tasks created simultaneously
**Conditional:** Task C created only if condition met

Dependencies are enforced via business logic, not database constraints.

## Task Weights

Tasks carry **calculated weights** that drive queue sorting and prioritization. There are two weight dimensions:

- **`calculated_weight`**: Standard weight for normal prioritization
- **`calculated_priority_weight`**: Elevated weight used when a task is urgent

### Weight Sources

Weights can come from two sources:

1. **Task Type (LKU)**: Each task type can define a `weight` and `priority_weight`. See [`WorkflowTaskLkuType`](../../apps/core/lib/core/workflows/workflow_task_lku_type.ex).
2. **Task Tags**: Tags associated to a task each carry their own `weight` and `priority_weight`. See [`WorkflowTaskTagValue`](../../apps/core/lib/core/workflows/workflow_task_tag_value.ex).

### Resolution Strategy

- If the task type has a **non-zero weight**, that weight is used (type weight takes precedence).
- If the task type weight is **zero** (e.g., ad-hoc tasks), the **max tag weight** across all associated tags is used.
- Each dimension (weight, priority_weight) is resolved independently — so the max weight may come from one tag and the max priority_weight from another.

This logic lives in [`WorkflowTaskTags.calculate_weights/3`](../../apps/core/lib/core/workflows/workflow_task_tags.ex).

### Pre-computation

Weights are **pre-computed and stored on the task** (`calculated_weight`, `calculated_priority_weight`) rather than computed at query time. This is a performance optimization for queue queries that sort by weight across large task volumes.

Recalculation is triggered:
- **On task creation**: Weights computed from type + initial tags
- **On task update**: When tags or type change
- **On tag value weight change**: An async Oban worker ([`RecalculateTaskWeightsWorker`](../../apps/core/lib/core/workflows/recalculate_task_weights_worker.ex)) sweeps all active tasks with that tag

## Task Tags

Tasks can be tagged with **workflow task tags** — a flexible labeling system that serves both categorization and weight contribution purposes.

- **Tag Values** are org-scoped definitions managed by system administrators. Each tag value has a `display_text`, `weight`, and `priority_weight`. See [`WorkflowTaskTagValue`](../../apps/core/lib/core/workflows/workflow_task_tag_value.ex).
- **Task Tags** are the join records associating tag values to tasks. See [`WorkflowTaskTag`](../../apps/core/lib/core/workflows/workflow_task_tag.ex).

Tag value management (CRUD) is gated behind the `system_config:module` permission.

The context module for all tag operations is [`Core.Workflows.WorkflowTaskTags`](../../apps/core/lib/core/workflows/workflow_task_tags.ex).

## Integration with Other Systems

**Workflows:** Tasks typically belong to workflow, drive progression
**Scheduling:** Many tasks result in scheduled appointments
**EMR:** Task completion often requires EMR documentation
**Queues:** Tasks appear in filtered queues for role-based work
**Authorization:** Task access controlled by asset-based permissions

## Context Module

Primary context: `Core.Workflows`

**Key functions:**
- `create_user_generated_workflow_task/1`
- `assign_task/3`
- `update_workflow_task/2`
- `complete_task/1`
- `get_task_with_history/1`

## Schema Reference

Schema files live in [`apps/core/lib/core/workflows/`](../../apps/core/lib/core/workflows/):

- [`WorkflowTask`](../../apps/core/lib/core/workflows/workflow_task.ex) — The task entity
- [`WorkflowTaskLkuType`](../../apps/core/lib/core/workflows/workflow_task_lku_type.ex) — Task type lookup (tenant-configurable, includes weight fields)
- [`WorkflowTaskLkuStatus`](../../apps/core/lib/core/workflows/workflow_task_lku_status.ex) — Task status lookup
- [`WorkflowTaskTagValue`](../../apps/core/lib/core/workflows/workflow_task_tag_value.ex) — Tag definitions (with weights)
- [`WorkflowTaskTag`](../../apps/core/lib/core/workflows/workflow_task_tag.ex) — Task ↔ tag value join table

---

**Key Takeaway**: Tasks are the atomic work units that drive care coordination. They can exist independently or within workflows, have rich assignment and status tracking, carry pre-computed weights for prioritization, and feed into role-based queues for work management.
