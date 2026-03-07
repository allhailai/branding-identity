# Queues

**Role-Based Filtered Task Lists for Work Management**

## What is a Queue?

A **Queue** is a filtered view of tasks organized for role-based work management. Queues enable team members to see only the tasks relevant to their role, office, or assignment, and managers to monitor workload and capacity.

## Key Concept

**Queues are not database entities.** They are dynamic filtered queries over the `workflow_tasks` table, often cached or materialized for performance.

## Queue Characteristics

**Filtered by:**

- **Task type**: Only tasks of specific types (e.g., "medical_records_request")
- **Task status**: Usually "pending" or "in_progress"
- **Assignment**:
  - Assigned to me specifically
  - Assigned to my role (any team member can claim)
  - Unassigned (manager assigns)
- **Patient attributes**: Risk level, office/pod, program enrollment
- **Organization**: Scoped to user's org or office

**Sorted by:**

- Task weight (`calculated_weight` / `calculated_priority_weight`) — see [Task Weights](./tasks.md#task-weights)
- Due date
- Created date
- Patient risk level
- Patient name

**Actions available:**

- Claim task (if role-assigned)
- Bulk assign (if manager)
- Filter and search
- View patient context

## Common Queue Types

### Role-Specific Queues

**firsthand Guide Queue:**

```
Tasks where:
- type_key IN ['engagement_visit', 'wpa_followup', 'health_check']
- assigned_to_id = current_user.id OR assigned_to_role = 'firsthand_guide'
- status_key IN ['pending', 'in_progress']
- patient.office_id = user.office_id
```

**Medical Records Queue:**

```
Tasks where:
- type_key = 'isj_medical_records_request'
- assigned_to_queue_id = <medical_records_queue>
- task status is active (new or in_progress)

Queue statuses track per-facility lifecycle:
- needs_first_fax → awaiting_response → needs_second_fax →
  awaiting_response → needs_third_fax → received / no_response
```

Each task represents one facility for one patient. Tasks will have a backing table (`medical_records_requests`) with attempt dates, facility info, and response file references. The queue status drives what action the specialist needs to take next.

**CDI Specialist Queue:**

```
Tasks where:
- type_key IN ['cdi_prospective_review', 'dx_gap_closure']
- assigned_to_role = 'cdi_specialist'
- status_key = 'pending'
- patient.next_visit_date IS NOT NULL (prioritize active patients)
```

### Manager Queues

**Assignment Queue (MCO):**

```
Patients/Workflows where:
- workflow.status_key = 'engage'
- workflow.assigned_fg_id IS NULL
- patient.office_id IN (manager.managed_offices)
```

Purpose: Assign new individuals to firsthand Guides based on capacity.

**Escalation Queue:**

```
Tasks where:
- type_key = 'escalation_response'
- status_key IN ['pending', 'in_progress']
- order by urgency_level DESC, created_at ASC
```

Purpose: Triage RNs pick up urgent escalations first.

### Event-Driven Queues

**Transitions of Care (TOC) Queue:**

```
Tasks where:
- type_key = 'toc_followup'
- created_by = 'adt_feed' (sentinel event)
- status_key = 'pending'
- due_at < NOW() + 7 days
- order by patient.risk_level DESC
```

Purpose: Ensure high-risk discharges get follow-up within 7 days.

## Queue Locking (Preventing Duplicate Work)

For queues where multiple workers might process same task concurrently:

**Schema:** `workflow_task_queue_lock_periods`

**Pattern:**

1. Worker queries queue
2. Before processing, attempts to acquire lock:
   ```elixir
   Multi.insert(:lock, %QueueLockPeriod{
     task_id: task.id,
     locked_by_id: worker.id,
     locked_at: DateTime.utc_now()
   })
   ```
3. If lock acquired (no conflict), process task
4. If lock fails (another worker has it), skip to next task
5. Lock released when task completed or after timeout

## Queue Status Tracking

For monitoring queue health and SLAs:

**Schema:** `workflow_task_queue_status_periods`

**Captures:**

- When task entered queue
- When task exited queue (claimed, completed)
- Time in queue (for SLA tracking)

## Queue Configuration (Tenant-Specific)

**Core provides queue engine.** Tenant defines specific queues.

**Configuration location:** Typically in tenant codebase or database config.

**Example:**

```elixir
# apps/fh/lib/fh/workflows/queue_config.ex
def fg_action_list do
  %QueueConfig{
    name: "firsthand Guide Action List",
    role: "firsthand_guide",
    filters: %{
      task_types: ["engagement_visit", "health_check", "wpa_followup"],
      statuses: ["pending", "in_progress"],
      assigned_to: :me_or_my_role
    },
    sort: [
      {:patient_risk_level, :desc},
      {:due_at, :asc}
    ]
  }
end
```

## UI Representations

**Queue Views typically show:**

- Patient name (clickable to profile)
- Task type
- Status (pending/in progress)
- Assigned to
- Due date
- Priority indicators (high risk, overdue)
- Actions (claim, complete, reassign)

**Bulk operations:**

- Multi-select tasks
- Bulk assign to user
- Bulk update status

## Performance Considerations

**Queues can be expensive queries.** Optimizations:

1. **Pre-computed weights**: Task weights are calculated and stored on the task record rather than computed at query time. See [Task Weights](./tasks.md#task-weights).

2. **Database indexes** on common filter columns:
   - `(task_type_key, status_key, assigned_to_id)`
   - `(patient_id, status_key)`
   - `(org_id, status_key, due_at)`

3. **Materialized views** for complex queues refreshed periodically

4. **Caching** queue counts and summaries

5. **Pagination** for large result sets

6. **Denormalization** of frequently-filtered patient attributes onto task record

## Queue Metrics

Common metrics tracked:

- **Queue depth**: Number of tasks in queue
- **Average time in queue**: SLA tracking
- **Completion rate**: Tasks completed per day/week
- **Overdue count**: Tasks past due date
- **Assignment balance**: Even distribution across team members

## Integration Points

**Tasks:** Queues are views over tasks
**Workflows:** Queue filters often include workflow status
**Patients:** Queues filtered by patient attributes (risk, office, etc.)
**Authorization:** Queue visibility respects user permissions
**Scheduling:** Many queued tasks result in scheduled appointments

## Context Module

Queue queries typically in: `Core.WorkflowQueues` or tenant-specific modules

**Example functions:**

- `get_fg_action_list/2` - For specific user/role
- `get_assignment_queue/1` - For manager
- `get_escalation_queue/0` - System-wide urgent queue

## Schema Reference

Queue queries run over task schemas. See [`apps/core/lib/core/workflows/`](../../apps/core/lib/core/workflows/) for all task and queue-related schemas.

---

**Key Takeaway**: Queues are dynamic filtered views of tasks that enable role-based work management, prevent duplicate work via locking, and provide visibility into workload and capacity. They are the primary UI for care team members to see "what do I need to do today?"
