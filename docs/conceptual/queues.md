# Queues — Work Distribution and Daily Operations

A **queue** is a filtered, prioritized list of tasks organized by role or function. Queues are how the platform distributes work across teams and how individual staff members see what they need to do each day.

---

## Why This Matters

Without queues, staff must hunt through unorganized task lists to find their work, and managers have no visibility into whether the right people are working on the right things. Queues ensure every role sees exactly the work that applies to them, in priority order, with safeguards against duplicate effort.

---

## What a Queue Does

A queue takes the full set of active [tasks](./tasks.md) in the system and filters it down to what is relevant for a specific role, team, or function. Each role sees only the work that applies to them:

| Role                       | What They See                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Care guide                 | Outreach tasks, health check visits, and assessment follow-ups for their assigned patients |
| Medical records specialist | Records retrieval requests across all patients, organized by facility status and urgency   |
| CDI specialist             | Upcoming patient visits that need diagnosis review preparation                             |
| Triage nurse               | Urgent escalations sorted by severity                                                      |

Queues are not static lists. They are live, filtered views that update as tasks are created, completed, reassigned, or reprioritized.

---

## How Queues Are Organized

### Role-Specific Queues

The most common pattern. A queue is defined for a specific role and shows tasks filtered by type, assignment, and status. A care guide's queue shows engagement visits, health checks, and follow-up tasks assigned to them or to their role on a patient's care team. A benefits specialist's queue shows application-related tasks. Each role has a queue tailored to the work they perform.

### Shared Queues

Some work is not assigned to a specific person but to a pool. Medical records retrieval, escalation triage, and coding reviews are examples. In a shared queue, any qualified worker can claim a task. The platform uses a locking mechanism to prevent two people from working the same task simultaneously — when a worker claims a task, it is temporarily reserved for them. If they do not complete it within the lock period, it returns to the pool for someone else to pick up.

### Manager Queues

Managers see queues designed for oversight rather than direct task execution. An assignment queue shows new patients who need to be assigned to care team members. A workload queue shows task counts and completion rates across team members. These views enable managers to balance work, identify bottlenecks, and ensure nothing falls through the cracks.

---

## Sorting and Prioritization

Queues present tasks in priority order. The platform supports multiple sorting dimensions:

| Dimension          | Effect                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Priority score     | Calculated from the task type and associated attributes. Higher-priority work appears first. |
| Due date           | Tasks approaching or past their due date are surfaced.                                       |
| Patient risk level | Higher-risk patients can be prioritized through task tagging.                                |
| Creation date      | Older tasks that have been waiting longer can be elevated.                                   |

Organizations configure how their queues are sorted. A triage queue might sort strictly by severity and creation time. A care guide's queue might sort by patient risk level first, then by due date.

---

## Queue Actions

**Staff actions:**

| Action               | Description                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Claim a task         | In shared queues, lock a task so they can work on it without conflict.                               |
| View patient context | See relevant patient information alongside the task, so they have the context needed to do the work. |
| Complete a task      | Mark work as done, which may trigger the associated [workflow](./workflows.md) to advance.           |
| Release a task       | In shared queues, return a claimed task to the pool if they cannot complete it.                      |

**Manager actions (in addition to the above):**

| Action              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| Assign tasks        | Route unassigned work to specific team members.                              |
| Bulk assign         | Distribute multiple tasks at once.                                           |
| Monitor queue depth | See how many tasks are waiting and how they are distributed across the team. |

---

## Queue Configuration

Queue definitions are configured per organization. The configuration determines:

- What roles exist in the organization
- What task types each role handles
- How work is prioritized within each queue
- Whether a queue uses direct assignment or shared claiming

This means the same platform can support different organizational structures. One organization might have dedicated medical records specialists with their own shared queue. Another might have care guides who handle records retrieval as part of their broader role. The queue configuration adapts to the care model.

---

## Operational Visibility

Queues provide natural operational metrics:

| Metric             | What It Reveals                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Queue depth        | How many tasks are waiting? Is the queue growing or shrinking over time?                           |
| Time in queue      | How long do tasks sit before someone picks them up?                                                |
| Completion rate    | How many tasks are being completed per day or week?                                                |
| Overdue count      | How many tasks have passed their due date?                                                         |
| Assignment balance | Is work evenly distributed across team members, or are some overloaded while others have capacity? |

These metrics require no additional instrumentation — they emerge naturally from the task and assignment data the platform already tracks.

---

## Relationship to Other Platform Concepts

| Concept                       | Relationship                                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Tasks](./tasks.md)           | The items that appear in queues. A queue is a filtered view of tasks, not a separate data structure.                                                        |
| [Workflows](./workflows.md)   | Generate the tasks that populate queues. As workflows progress through phases, new tasks appear in the appropriate queues.                                  |
| [Workspaces](./workspaces.md) | The staff-facing interface built on top of queues. A workspace combines a queue with patient context and task actions into a unified daily work experience. |
