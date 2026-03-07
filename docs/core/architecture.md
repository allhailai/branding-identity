# Platform Architecture

**Core/Tenant Separation & Extension Mechanisms**

## Architectural Principles

### 1. Clean Separation
Core and tenant code must remain **loosely coupled** to enable:
- **Core updates** pushed to all tenants without breaking changes
- **Tenant customizations** without modifying core
- **Core extraction** of tenant innovations back to shared platform

### 2. Directory Structure

```
Backend (Elixir/Phoenix Umbrella App):
├── apps/
│   ├── core/           # Core platform (AHA-owned)
│   │   ├── lib/core/
│   │   │   ├── workflows/
│   │   │   ├── patients/
│   │   │   ├── scheduling/
│   │   │   └── ...
│   │   └── priv/repo/
│   │       └── migrations/  # Core schema migrations
│   │
│   ├── fh/             # Tenant: Firsthand
│   │   ├── lib/fh/
│   │   │   ├── individuals/
│   │   │   ├── engagement/
│   │   │   └── ...
│   │   └── priv/repo/
│   │       └── migrations/  # Tenant schema extensions
│   │
│   └── core_web/       # Core API layer
│       └── lib/core_web/
│           ├── controllers/
│           └── views/

Frontend (React/TypeScript):
├── src/
│   ├── apps/
│   │   ├── core/       # Core UI (AHA-owned)
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   └── config/
│   │   │
│   │   └── fh/         # Tenant UI (Firsthand)
│   │       ├── components/
│   │       ├── features/
│   │       └── config/
```

### 3. Dependency Rules

**Allowed:**
- ✅ Tenant code can `import`/`alias` core modules
- ✅ Tenant can extend core schemas via associations
- ✅ Tenant can override lookup table values

**Forbidden:**
- ❌ Core code cannot reference tenant code
- ❌ Tenant cannot modify core files
- ❌ Tenant cannot override core behavior via monkey-patching

## Extension Mechanisms

### 1. Lookup Table Overrides (ConfigData)

Core defines generic lookup tables. Tenant provides specific values.

**Core defines structure:**
```elixir
# apps/core/lib/core/workflows/workflow_lku_status.ex
schema "workflow_lku_statuses" do
  field :key, :string, primary_key: true
  field :name, :string
  belongs_to :org, Core.Orgs.Org, primary_key: true
  belongs_to :workflow_type, WorkflowLkuType
end
```

**Tenant provides values:**
```elixir
# apps/fh/lib/fh/individuals/individual_journey_statuses.ex
defmodule FH.Individuals.IndividualJourneyStatuses do
  def engage, do: %{key: "isj_engage", name: "Engage", display_order: 1}
  def activate, do: %{key: "isj_activate", name: "Activate", display_order: 2}
  # ... more statuses
end
```

### 2. UI Slots

Core provides slot placeholders. Tenant fills them with custom components.

**Example:** Tenant can inject custom sections into patient detail view, workflow task panels, etc.

### 3. Schema Extensions

Tenant can add fields to core entities via separate tables with foreign keys.

**Core schema:**
```elixir
# apps/core/lib/core/patients/patient.ex
schema "patients" do
  field :first_name, :string
  field :last_name, :string
  # ... core fields
end
```

**Tenant extension:**
```elixir
# apps/fh/lib/fh/individuals/individual_extension.ex
schema "fh_individual_extensions" do
  belongs_to :patient, Core.Patients.Patient
  field :preferred_name, :string
  field :risk_score, :float
  # ... tenant-specific fields
end
```

### 4. Workflow Implementations

Core provides workflow engine. Tenant defines workflow types, statuses, tasks, and transitions.

**See:** [Workflows documentation](./workflows.md) for details.

### 5. Event Handlers (Sentinel Events)

Core publishes events. Tenant subscribes with custom handlers.

**Core publishes:**
```elixir
Core.SentinelEvents.publish_event(%{
  type: "consent_signed",
  patient_id: patient.id,
  metadata: %{...}
})
```

**Tenant handles:**
```elixir
# apps/fh/lib/fh/sentinel_events/consent_signed_handler.ex
defmodule FH.SentinelEvents.ConsentSignedHandler do
  use Oban.Worker
  
  def perform(%{args: %{"event_id" => event_id}}) do
    # Tenant-specific logic when consent signed
    # e.g., trigger medical records request workflow
  end
end
```

## Multi-Tenancy via Org

Nearly every table has an `org_id` column to scope data to an organization.

**Lookup tables use composite primary key:**
```elixir
@primary_key false
schema "team_lku_roles" do
  field :key, :string, primary_key: true
  belongs_to :org, Core.Orgs.Org, primary_key: true
  field :label, :string
end
```

This allows different tenants to have different lookup values for the same keys.

## Database Migrations

**Core migrations:**
- Location: `apps/core/priv/repo/migrations/`
- Managed by AHA
- Define foundational schemas

**Tenant migrations:**
- Location: `apps/<tenant>/priv/repo/migrations/`
- Can add tenant-specific tables
- Can add columns to core tables (use with caution)

**Staging migrations (tenant):**
- Location: `apps/<tenant>/priv/repo/staging_migrations/`
- Separate schema for ETL/data import staging tables

## Frontend Architecture

**Core UI:**
- Reusable components in design system
- Generic feature implementations
- Theme configuration

**Tenant UI:**
- Overrides terminology (e.g., "Patient" → "Individual")
- Customizes layouts and information display
- Adds tenant-specific features

**Configuration cascade:**
```typescript
// src/apps/fh/config/fh.theme.config.ts
export const fhTheme = {
  ...coreTheme,  // Inherit core
  terminology: {
    patient: 'Individual',
    // ... more overrides
  }
}
```

## Code Sharing Patterns

**When to promote to core:**
- Feature will benefit multiple tenants
- No tenant-specific business logic
- Well-tested and production-proven

**When to keep in tenant:**
- Unique to this business model
- Rapid iteration needed
- Uncertain if other tenants need it

## Testing Strategy

**Core tests:**
- Test abstractions work generically
- Mock tenant-specific values

**Tenant tests:**
- Test business logic and workflows
- Use tenant-specific factories and fixtures

---

**Key Takeaway**: The architecture enables AHA to maintain one core platform while allowing each tenant to customize their deployment without forking the codebase.
