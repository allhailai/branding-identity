# Core Platform Documentation

**AllHail AI Healthcare Technology Platform**

## Overview

AllHail AI (AHA) builds customizable healthcare technology platforms. We provide a core set of code abstractions, data models, and pre-built functionality that can be rapidly deployed and customized for healthcare companies backed by private equity partners.

## Documentation Index

### Business & Architecture
- **[Business Model](./business-model.md)**: How AHA partners with PE firms and healthcare companies
- **[Platform Architecture](./architecture.md)**: Core/tenant separation, slots, extension points

### Platform Abstractions
- **[Workflows](./workflows.md)**: Task orchestration engine for care coordination
- **[Tasks](./tasks.md)**: Actionable work items with assignments, statuses, and history
- **[Queues](./queues.md)**: Filtered task lists for role-based work management
- **[Patients](./patients.md)**: Core entity representing individuals receiving care

### Key Systems
- **[ACD/HCC Coding](./acd-hcc-coding.md)**: Risk adjustment and diagnosis coding

### Not Yet Documented
These concepts are referenced in existing docs but don't have dedicated pages:
- Contacts: Shared contacts (family, pharmacies, providers)
- Scheduling: Appointment management with series, participants, recurrence
- Authorization: Asset-based permission system
- EMR Integration: Elation API sync for users, physicians, consents
- Sentinel Events: Event-driven cross-context reactions

## Technical Organization

```
Backend:
  apps/core/          # Core platform code (AHA-owned)
  apps/<tenant>/      # Tenant-specific code (e.g., apps/fh/)

Frontend:
  src/apps/core/      # Core UI components and logic
  src/apps/<tenant>/  # Tenant-specific UI customizations
```

### Core/Tenant Boundaries

**Core provides:**
- Data models (schemas, migrations)
- Business logic contexts (Workflows, Patients, Scheduling, etc.)
- API endpoints (controllers, JSON views)
- UI components and design system
- Pre-built functionality (clinical documentation, HCC coding, etc.)

**Tenant customizes:**
- Workflow implementations (status sequences, task types)
- UI terminology (e.g., "Patient" → "Individual")
- Lookup table values (ConfigData extensions)
- Business-specific logic (handlers, calculations)
- Care pathways and interventions

## Key Principles

1. **Clean Separation**: Core and tenant code must remain loosely coupled
2. **Bidirectional Sync**: Core improvements can be pushed to all tenants; tenant innovations can be extracted back to core
3. **Extension Points**: Slots, ConfigData, and LKU (lookup) overrides enable customization
4. **Multi-tenancy**: One org_id scopes nearly all data to an organization
5. **One Repo Per Client**: Each tenant has its own repository containing both core + tenant code

## Navigation Guide

**Understanding the platform?** Start with:
1. [Business Model](./business-model.md) - Learn about AHA's platform approach
2. [Platform Architecture](./architecture.md) - Understand core/tenant separation

**Working on workflows?** Read in order:
1. [Workflows](./workflows.md) - Orchestration engine
2. [Tasks](./tasks.md) - Work items and assignment
3. [Queues](./queues.md) - Role-based work management

**Building care coordination?** Review:
1. [Patients](./patients.md) - Core entity
2. [Workflows](./workflows.md) - How care progresses

**Implementing HCC coding?** See:
1. [ACD/HCC Coding](./acd-hcc-coding.md) - Risk adjustment system

**Customizing for a tenant?** 
1. Read [Architecture](./architecture.md) - Extension mechanisms
2. Then check [tenant docs](../tenant/README.md) - See tenant implementation

---

Last Updated: 2026-02-15
