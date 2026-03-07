# Workspaces — Where Staff Do Their Daily Work

A **workspace** is the primary screen a staff member opens each day to see, prioritize, and complete their work. It brings together their [queue](./queues.md), patient context, and task actions into a single interface tailored to their role.

---

## Why This Matters

When staff must switch between separate screens to find tasks, look up patient details, and record outcomes, context is lost, efficiency drops, and errors increase. Workspaces eliminate that friction by presenting work, context, and actions in a single role-tailored view.

---

## What a Workspace Provides

A workspace combines three things:

1. **A queue of work** — The filtered, prioritized list of [tasks](./tasks.md) relevant to the staff member's role. This is what they need to do.
2. **Patient context** — For each task, the relevant patient information needed to perform the work — demographics, care history, current care status, and associated records.
3. **Task actions** — The forms, documentation tools, and completion controls needed to actually do the work and record the outcome.

Staff do not need to navigate between separate screens to find their work, look up patient details, and then complete a task. The workspace presents all three in a unified view.

---

## Role-Specific Workspaces

Different roles see different workspaces because they do different work:

| Role                       | Work Displayed                                                                   | Context Emphasized                                                          |
| -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Care guide                 | Outreach tasks, health check visits, assessment follow-ups for assigned patients | Patient contact information, recent interaction history, care plan status   |
| Medical records specialist | Shared queue of records retrieval requests                                       | Facility information, fax status, attempt history, document upload controls |
| CDI specialist             | Patients with upcoming visits needing diagnosis review preparation               | Prior-year diagnoses, suspected conditions, coding gaps                     |
| Triage nurse               | Urgent escalations sorted by severity                                            | Escalation reason, patient risk factors, response options                   |

The platform configures each workspace to show the task types, patient attributes, and action tools relevant to that role.

---

## How Staff Use Workspaces

A typical daily workflow:

1. **Open the workspace.** The staff member sees their queue — today's work, sorted by priority.
2. **Select a task.** Patient context loads alongside the task details.
3. **Perform the work.** Complete the required action — fill out a form, document a visit, make a call, send a fax.
4. **Record the outcome.** Submit the completed work. The platform records what was done and, if the task belongs to a [workflow](./workflows.md), evaluates whether the care process should advance.
5. **Move to the next task.** The queue updates. The next highest-priority item is ready.

For shared queues, the staff member claims a task before working it. The platform locks the task for a defined period to prevent duplicate work. When finished, they complete or release it and move on.

---

## Priority and Surfacing

Workspaces surface the most important work first. The ordering is driven by configurable priority rules that can account for:

| Factor                     | Effect                                            |
| -------------------------- | ------------------------------------------------- |
| Task urgency and due dates | Time-sensitive and overdue work rises to the top  |
| Patient risk level         | Higher-risk patients are prioritized              |
| Time waiting               | Tasks that have been sitting longer are elevated  |
| Task type priority         | Certain work types are inherently higher priority |

Overdue tasks and high-risk patients are visually distinguished so staff can quickly identify where their attention is needed most.

---

## Team Visibility

Workspaces also provide managers with visibility into team workload and capacity. A manager's workspace shows:

- How many tasks each team member has
- Which tasks are overdue or approaching deadlines
- Queue depth across shared queues
- Assignment balance across the team

This enables real-time workload management — reassigning tasks, balancing capacity, and identifying areas that need additional staffing.

---

## Relationship to Other Platform Concepts

| Concept                           | Relationship                                                                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [Queues](./queues.md)             | Provide the filtered task lists that workspaces display. A workspace is essentially a queue with added patient context and action capabilities. |
| [Tasks](./tasks.md)               | The individual work items staff interact with inside the workspace.                                                                             |
| [Workflows](./workflows.md)       | Generate the tasks that appear in workspaces and advance when tasks are completed.                                                              |
| [Appointments](./appointments.md) | May be created from within a workspace when a task requires scheduling a visit.                                                                 |
