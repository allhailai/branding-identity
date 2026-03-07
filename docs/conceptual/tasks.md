# Tasks — Work Items and Staff Assignments

A **task** is a discrete unit of work assigned to a specific person, a role, or a shared pool. Tasks are how the platform translates care process requirements into actionable work for individual staff members.

---

## Why This Matters

Care processes involve dozens of steps spread across multiple roles. Without a structured task system, work falls through the cracks — follow-ups are forgotten, assignments are unclear, and there is no record of what was done or when. Tasks make every unit of work explicit, trackable, and auditable.

---

## What a Task Represents

Every task answers four questions:

1. **What needs to be done?** Each task has a type that describes the work — complete an eligibility assessment, schedule a medical evaluation, retrieve medical records from a facility, follow up after a hospital discharge.
2. **Who should do it?** Tasks are assigned to a specific person, a role on the patient's care team, or a shared queue where any qualified worker can claim it.
3. **When is it due?** Tasks carry due dates that drive prioritization and SLA tracking.
4. **What is its status?** Tasks move through a lifecycle: created, in progress, completed — or cancelled if no longer needed.

---

## How Tasks Are Created

Tasks arrive through three channels:

### System-Generated

Most tasks are created automatically as [workflows](./workflows.md) progress. When a workflow enters a new phase, the platform generates the tasks that phase requires and routes them to the appropriate staff. A benefits eligibility phase might generate one task for a care guide and a separate task for a nurse practitioner. An outreach phase might generate a single contact attempt task for the assigned care guide.

This is the primary mechanism. The right task appears for the right person at the right time, based on where the patient is in their care process.

### Manually Created

Staff can create tasks directly — for ad-hoc work that falls outside a structured workflow, or to assign follow-up actions to themselves or colleagues.

### Event-Triggered

External events can generate tasks automatically. A hospital discharge notification might create a follow-up task for the patient's care team. A signed consent form might trigger the next step in an engagement process. These events flow into the platform and produce work items without manual intervention.

---

## Assignment Models

Tasks support three assignment approaches:

| Model                    | How It Works                                                                                                                                                                                                                  | When to Use                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Direct assignment        | The task is assigned to a specific person. It appears in their personal task list.                                                                                                                                            | You know exactly who should do the work.                                                          |
| Team and role assignment | The task is assigned to a role on the patient's care team (such as "care guide" or "nurse practitioner"). Whoever holds that role sees the task. If the role holder changes, the task automatically routes to the new person. | The work belongs to a role, not a specific individual.                                            |
| Queue assignment         | The task is placed in a shared pool where any qualified worker can claim it. The platform prevents two people from working the same task simultaneously through a time-limited lock mechanism.                                | High-volume, interchangeable work — medical records retrieval, escalation triage, coding reviews. |

---

## Task Lifecycle

Every task follows a standard progression:

```
Created → In Progress → Completed
```

Tasks can also be **closed** by the platform (when a workflow advances to a new phase and the remaining tasks from the previous phase are no longer needed) or **cancelled** manually by staff.

### Connection to Workflows

When a task belongs to a workflow, completing it can trigger the workflow to evaluate whether it should advance to the next phase. The platform examines the information captured during task completion alongside everything accumulated so far, and determines the appropriate next step.

This means staff do not need to manually advance workflows. They complete their tasks, and the platform handles progression automatically.

---

## What Gets Tracked

The platform records a complete history for every task:

| Record             | Description                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Assignment history | Every assignment and reassignment is tracked with timestamps. If a task moves from one person to another, both the original and new assignments are recorded, along with when the change occurred. |
| Status changes     | Every transition (created to in progress, in progress to completed) is logged with who made the change and when.                                                                                   |
| Time tracking      | When the task was created, when someone started working on it, when it was completed. These timestamps enable SLA monitoring and workload analysis.                                                |
| Data captured      | For workflow tasks, the information staff enter during completion (assessment results, evaluation findings, documentation) is preserved as part of the workflow's audit trail.                     |

---

## Prioritization

Tasks carry calculated priority scores that determine their ordering in [queues](./queues.md) and task lists. Priority can be derived from:

- **Task type** — Some types of work are inherently higher priority than others (escalation responses rank above routine follow-ups).
- **Patient attributes** — Tags associated with the task can carry priority weights, allowing the organization to surface work for higher-risk patients or time-sensitive situations.

Priority scores are calculated when tasks are created and updated when relevant attributes change. Queue displays use these scores to present the most important work first.

---

## Tasks with Extended State

Some task types represent work with richer state than a standard task can hold. Medical records retrieval, for example, requires tracking multiple fax attempts per facility, response dates, and received documents. Rather than cramming this into a generic task, the platform supports tasks with dedicated backing data — additional structured information that is updated as the work progresses.

The task itself remains in the standard queue system with standard assignment and status tracking. The extended data provides the domain-specific context workers need to perform the work. This pattern keeps the task engine generic while allowing specialized work to be modeled properly.

---

## Relationship to Other Platform Concepts

| Concept                           | Relationship                                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Workflows](./workflows.md)       | Generate tasks as they progress through phases. Task completion can trigger workflow advancement.                                                   |
| [Queues](./queues.md)             | Filtered views of tasks organized by role. Queues are how staff discover and interact with their assigned work.                                     |
| [Workspaces](./workspaces.md)     | Combine queues with patient context to create the daily working interface.                                                                          |
| [Appointments](./appointments.md) | Frequently the result of a task (a "schedule visit" task produces an appointment) and may themselves generate documentation tasks after completion. |
