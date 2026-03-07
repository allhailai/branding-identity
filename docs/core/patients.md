# Patients

**Core Entity Representing Individuals Receiving Care**

## What is a Patient?

A **Patient** is the central entity representing an individual receiving healthcare services. In tenant implementations, this may be called "Individual", "Member", "Client" or other terminology, but the underlying data model is the same.

## Core Attributes

**Demographics:**
- `first_name`, `last_name`
- `date_of_birth`
- `gender`
- `preferred_language`

**Contact:**
- `phone_numbers` (JSONB array - mobile, home, work)
- `email`
- `addresses` (JSONB array - current, previous)

**Identity:**
- `mrn` (Medical Record Number)
- `medicaid_id`, `medicare_id`
- `ssn` (encrypted)

**Administrative:**
- `org_id`: Organization scope
- `is_deleted`: Soft delete flag

**Audit:**
- `created_by_id`, `updated_by_id`
- `created_at`, `updated_at`

**Schema:** `Core.Patients.Patient`

## Related Entities

### Patient Contacts
One-to-many relationship linking patients to their support network.

**Contact types:**
- Family members
- Emergency contacts
- Care providers (PCP, specialists)
- Pharmacies
- Social services

**See:** [Contacts documentation](./contacts.md)

### Patient Consent
Tracks signed consent forms required for care coordination.

**Common consent types:**
- Release of Information (ROI)
- Treatment consent
- HIPAA authorization
- Photography/recording (optional)

**Schema:** `Core.Patients.PatientConsent`

**Workflow:** Typically obtained during engagement visit, uploaded to EMR.

### Patient Documents
Files associated with patient (PDFs, images, etc.).

**Document types:**
- Signed consents
- Medical records
- Assessments
- Care plans
- ID verification

**Schema:** Managed via `Core.Patients.PatientDocuments` context
**Storage:** S3 with references in database

## Patient-Centric Relationships

Many entities reference patient:

**Workflows:** `workflow.patient_id` - Care coordination workflows
**Tasks:** `workflow_task.patient_id` - Work items for this patient
**Appointments:** `appointment.patient_id` - Scheduled visits
**ACD/ICD-10:** `acd_patient_icd10s.patient_id` - Diagnosis codes for risk adjustment
**ACD Categories:** `acd_patient_categories.patient_id` - HCC category rollups and evidence states
**EMR User:** `emr_user.patient_id` - Link to external EMR system

## Line of Business (LOB)

Patients may be enrolled in different insurance programs:

**Common LOBs (tenant-configurable):**
- Medicare Advantage (MA)
- Medicaid
- Dual Eligible (both MA and Medicaid)
- Specific programs: ABD, SMI, etc.

**Implementation:** Typically via lookup table `payer_lku_lob` with patient associations.

**Why it matters:** 
- Drives eligibility for certain interventions
- Affects billing and documentation requirements
- Influences risk adjustment model (HCC coding)

## Risk Stratification

Patients often stratified by risk level to prioritize care:

**Common levels:**
- High Risk: Complex medical/behavioral health needs, frequent hospitalizations
- Low Risk: Stable, fewer interventions needed

**Storage:** May be in patient record directly or calculated via algorithm
**Usage:** Drives task prioritization, visit cadence, queue sorting

## Multi-Tenancy

Patient records are scoped to organization via `org_id`.

In multi-org scenarios (e.g., regional offices under parent org):
- Each patient belongs to one org
- Org hierarchy (via `OrgParent`) allows rollup reporting
- Authorization ensures users only see patients in their org/office

## EMR Integration

Patients often linked to external EMR (Elation):

**Schema:** `Core.Emr.EmrUser` (patient is a type of EMR user)

**Sync pattern:**
- EMR user created when patient enrolled
- Bidirectional sync of demographics
- Consent forms uploaded to EMR
- Visit notes documented in EMR
- Prescriptions and records pulled from EMR

**See:** [EMR Integration documentation](./emr-integration.md)

## Common Operations

### Create Patient
```elixir
Core.Patients.create_patient(%{
  first_name: "John",
  last_name: "Doe",
  date_of_birth: ~D[1980-05-15],
  medicaid_id: "MCD123456",
  org_id: 1,
  created_by_id: user.id
})
```

### Search Patients
```elixir
Core.Patients.search_patients(%{
  name: "John",
  office_id: 42,
  is_deleted: false
})
```

Common search criteria: name, DOB, MRN, Medicaid ID, office, status

### Get Patient with Associations
```elixir
Core.Patients.get_patient_with_full_context(patient_id)
# Preloads: contacts, workflows, upcoming appointments, recent tasks
```

### Update Patient
```elixir
Core.Patients.update_patient(patient, %{
  phone_numbers: [%{type: "mobile", number: "555-1234"}],
  updated_by_id: user.id
})
```

## Patient Profile View

Typical patient profile UI sections:
1. **Demographics**: Name, DOB, contact info
2. **Timeline**: Chronological activity feed (visits, tasks, notes, events)
3. **Care Team**: Assigned fG, HG, other clinicians
4. **Workflows**: Active journeys and status
5. **Tasks**: Pending and recent completed
6. **Appointments**: Upcoming and past visits
7. **Diagnoses**: ICD-10 codes, HCC categories
8. **Documents**: Consents, records, assessments
9. **Contacts**: Family, providers, pharmacy

## Authorization

Patient access controlled by asset-based permissions:

**Common permission patterns:**
- View: Can see patient details
- Edit: Can update demographics and notes
- Assign: Can assign to care team members
- Document: Can upload documents and consents

Permissions typically scoped by:
- User's role
- User's office/org
- Patient's office/org

**See:** [Authorization documentation](./authorization.md)

## Context Module

Primary context: `Core.Patients`

**Key functions:**
- `list_patients/1` - With filters
- `get_patient/1` - By ID
- `create_patient/1`
- `update_patient/2`
- `search_patients/1`
- `get_patient_with_full_context/1`

## Database Schema

**Tables:**
- `patients`
- `patient_contacts` (join table)
- `patient_consents`
- `patient_consent_lku_type` (lookup)

**Related tables:**
- `workflows` (patient_id FK)
- `workflow_tasks` (patient_id FK)
- `appointments` (patient_id FK)
- `acd_patient_icd10` (patient_id FK)

---

**Key Takeaway**: Patient is the central entity in the platform, representing the individual receiving care. Most workflows, tasks, appointments, and clinical data reference patient. The data model is flexible to support different terminology (Individual, Member, etc.) via tenant configuration.
