# Platform Documentation

**Quick Start Guide for Understanding the AllHail AI Healthcare Platform**

This documentation provides contextual understanding of both the AHA core platform and tenant-specific implementations. It's designed for LLM context and human developers to quickly grasp business concepts and technical architecture.

## Documentation Structure

### 🏢 [Core Platform Documentation](./core/README.md)
Complete index of platform abstractions and systems:

**Business & Architecture:**
- [Business Model](./core/business-model.md) - AHA's platform approach
- [Platform Architecture](./core/architecture.md) - Core/tenant separation

**Platform Abstractions:**
- [Workflows](./core/workflows.md) - Task orchestration engine
- [Tasks](./core/tasks.md) - Work items and assignment
- [Queues](./core/queues.md) - Role-based work management
- [Patients](./core/patients.md) - Core entity

**Key Systems:**
- [ACD/HCC Coding](./core/acd-hcc-coding.md) - Risk adjustment

**Start here if**: Understanding platform capabilities, technical architecture, or working on core system code.

### 🏥 [Tenant: Firsthand Documentation](./tenant/README.md)
Complete index of Firsthand's business and workflows:

**Business Context:**
- [Organizational Structure](./tenant/organizational-structure.md) - Teams and roles
- [Individual Journey (ISJ)](./tenant/individual-journey.md) - Care model progression
- [Care Pathways](./tenant/care-pathways.md) - Tailored interventions

**Workflows:**
- [Assignment](./tenant/workflows/assignment.md) - Panel management
- [Engagement](./tenant/workflows/engagement.md) - Initial outreach
- [Benefits Support (SOAR)](./tenant/workflows/benefits-support.md) - SSI/SSDI
- [Medical Records](./tenant/workflows/medical-records.md) - Record retrieval
- [CDI/HCC Coding](./tenant/workflows/cdi-prospective-review.md) - Documentation
- [Transitions of Care](./tenant/workflows/transitions-of-care.md) - Hospital follow-up
- [Escalations](./tenant/workflows/escalations.md) - Triage line
- [Stabilization](./tenant/workflows/stabilization.md) - Ongoing care
- [STRIVE](./tenant/workflows/strive.md) - Self-management

**Start here if**: Understanding Firsthand's business, care model, or building tenant features.

## Key Concepts at a Glance

| Concept | Core Platform | Firsthand Tenant |
|---------|---------------|------------------|
| **Workflow** | Task orchestration system with statuses, assignments, queues | Individual journey tracking (ISJ), care pathway workflows |
| **Patient** | Core entity representing care recipients | Called "Individual" in FH UI/terminology |
| **Task** | Actionable work item assigned to users/teams | fG outreach, HG visits, SOAR applications, medical record requests |
| **Queue** | Filtered task lists for role-based work management | MCO assignment queues, CDI review queues, triage queues |
| **Contact** | Shared contact entity (family, pharmacy, providers) | Individual's support network and care team |

## Documentation Philosophy

- **Brevity without loss**: Concise but complete to avoid LLM context bloat
- **Hierarchical discovery**: Index → overview → deep dive
- **Clear separation**: Platform concepts vs business domain vs implementation
- **Living docs**: Maintained as code evolves

## Usage Patterns

**For LLMs:**
1. Read relevant index (core or tenant) for high-level context
2. Follow links to specific concept docs for deeper understanding
3. Reference technical code alongside conceptual docs

**For Developers:**
1. Start with business overview (core + tenant)
2. Understand the abstractions you'll work with
3. Deep dive into specific systems as needed
4. Query this documentation through an LLM for guided learning

---

Last Updated: 2026-02-15
