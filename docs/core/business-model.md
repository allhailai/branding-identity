# AHA Business Model

**How AllHail AI Partners with Healthcare Companies**

## The Model

AllHail AI (AHA) partners with private equity firms as **technology experts** to build healthcare technology platforms for their portfolio companies.

### What We Provide

**Core Platform:**
- Robust codebase with healthcare-specific abstractions
- Pre-built functionality:
  - Clinical documentation systems
  - HCC (Hierarchical Condition Category) coding for risk adjustment
  - Appointment scheduling and care coordination
  - Patient/contact management
  - EMR integration (Elation)
  - Authorization and permissions
- Modern tech stack (Elixir/Phoenix, React/TypeScript)
- Production-ready infrastructure and deployment

**Customization Services:**
- Map tenant business processes to platform abstractions
- Build tenant-specific workflows and care pathways
- Customize UI terminology and layout
- Extend data models and business logic
- Configure lookup values and business rules

### How It Works

1. **Partner Selection**: PE firm brings us a portfolio healthcare company
2. **Platform Deployment**: Core codebase deployed to tenant environment
3. **Discovery & Mapping**: Understand tenant's business and workflows
4. **Customization**: Build tenant-specific features on core abstractions
5. **Ongoing Support**: Push core improvements, support tenant customizations

## Core vs Tenant Code

### Core Code (AHA-Owned)
**Location**: `apps/core/` (backend), `src/apps/core/` (frontend)

**What's in core:**
- Foundational abstractions (Workflow, Task, Queue, Patient, etc.)
- Shared data models and schemas
- Reusable business logic
- UI component library and design system
- Standard integrations (Elation, Auth0, S3)

**Who maintains it:** AHA team exclusively

**How it evolves:** Features built for one tenant may be generalized and promoted to core for all tenants to benefit

### Tenant Code (Client-Specific)
**Location**: `apps/<tenant>/` (backend), `src/apps/<tenant>/` (frontend)
Example: `apps/fh/` for Firsthand

**What's in tenant:**
- Workflow implementations (status types, task types, queue configs)
- Care pathway logic specific to business model
- UI terminology overrides ("Patient" → "Individual")
- Business-specific calculations and rules
- Custom integrations and data imports

**Who maintains it:** AHA initially builds it; tenant can customize within guardrails

**How it evolves:** Tenant can modify their code; changes that would benefit all clients may be promoted to core

## The Repository Model

**One Repository Per Client:**
- Each tenant gets their own Git repository
- Repository contains both core + tenant code
- Clean separation enables bidirectional sync

**Why this matters:**
1. **Core Updates**: AHA can push improvements to core and tenant pulls them
2. **Core Extraction**: Innovations in tenant code can be generalized and extracted back to core
3. **Tenant Autonomy**: Within boundaries, tenant can customize their platform
4. **Isolation**: Tenant A's customizations don't affect Tenant B

## Economic Model

- Upfront build + ongoing platform subscription
- Shared innovation: improvements benefit all clients
- Reduced time-to-market: 70%+ of functionality pre-built
- PE value creation: operational excellence through technology

## Technical Guardrails

To maintain clean separation and enable sync:

1. **Never modify core code from tenant**: All customization in tenant directories
2. **Use extension points**: Slots, ConfigData, LKU overrides, not core edits
3. **Loose coupling**: Tenant code can reference core, but core cannot reference tenant
4. **Clear boundaries**: If you're working in `apps/fh/`, it's tenant; in `apps/core/`, it's core

## Example: Workflow Customization

**Core provides:**
```elixir
# apps/core/lib/core/workflows/workflow.ex
# Generic workflow engine with statuses, tasks, queues
```

**Tenant customizes:**
```elixir
# apps/fh/lib/fh/individuals/individual_journey_statuses.ex
# FH-specific: Engage → Activate → Stabilize → Promote → Inactive
```

The workflow *engine* is core. The *implementation* (what statuses exist, what they mean, what tasks they trigger) is tenant-specific.

---

**Key Takeaway**: AHA builds the platform once, deploys it many times, with each deployment customized for a specific healthcare company's business model and workflows.
