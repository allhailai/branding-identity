# ACD / HCC Coding

**Risk Adjustment and Diagnosis Coding for Value-Based Care**

## What is ACD?

**ACD** (Ambulatory Condition Documentation, also called **HCC coding**) is the process of documenting and coding patient diagnoses to accurately reflect their medical complexity for risk adjustment in Medicare Advantage and Medicaid managed care programs.

## Why It Matters

**Financial:** Health plans receive higher capitation payments for higher-risk patients.
**Clinical:** Accurate diagnosis documentation drives appropriate care planning.
**Compliance:** CMS audits require medical record evidence supporting all coded diagnoses.

## Key Concepts

### HCC (Hierarchical Condition Category)
A grouping of ICD-10 diagnosis codes representing similar disease severity.

**Example:** HCC 18 = Diabetes with Chronic Complications
- Includes ICD-10s like E11.21 (Type 2 diabetes with diabetic nephropathy)

**Risk Score Calculation:**
- Each HCC has a coefficient (weight)
- Patient's total risk score = sum of their HCC coefficients
- Higher score = higher reimbursement to health plan

### Coding Models
Different models apply to different populations:

**CMS-HCC (V24, V28):** Medicare Advantage
**RxHCC:** Medicare Part D
**Medicaid HCC:** Medicaid managed care (state-specific)

**Schema:** `Core.Acd.RefCodingModel`

### ICD-10 Code
Specific diagnosis code from International Classification of Diseases.

**Format:** Letter + 2-6 alphanumeric characters
**Example:** E11.65 = Type 2 diabetes mellitus with hyperglycemia

**Schema:** `Core.Acd.RefIcd10` (reference data, thousands of codes)

### Coding Category
A grouping of related ICD-10 codes within a model.

**Example:** "Diabetes" category contains all diabetes ICD-10s for a given model.

**Schema:** `Core.Acd.RefCodingCategory`

## Patient-Level ACD Data

### ACD Patient Category
Links a patient to an HCC category for a specific year.

**Attributes:**
- `patient_id`, `yr`, `org_id`
- `ref_coding_category_id` (which HCC)
- `has_suspect_evidence`: True if category has suspecting evidence
- `has_recapture_evidence`: True if category has coded ICD-10 evidence from prior two years
- `is_captured_tenant`, `is_captured_community`: Capture state rolled up from ICD-10 capture attempts
- `is_dominated`: True when a captured peer category dominates this category
- `is_deleted`: Soft delete if category no longer applies

**Schema:** `Core.Acd.AcdPatientCategory`

**Category Evidence States (functional):**
1. **Suspect:** `has_suspect_evidence = true`
   - Prior-year data suggests the condition may still exist this year.
2. **Recapture:** `has_recapture_evidence = true`
   - There is coded ICD-10 evidence for that category in the prior two years.
3. **New:** `has_suspect_evidence = false` and `has_recapture_evidence = false`
   - Newly coded by community or tenant in the current year without prior evidence in system history.

These states are not mutually exclusive for suspect/recapture flags; both can be true for the same category. "New" is specifically the neither-flag case.

**Domination rule:**
- Domination is capture-gated, not evidence-gated.
- A category can dominate another category only when the dominator category is captured.
- Domination comparisons are scoped to the same patient, year, and coding model.

### ACD Patient ICD-10
Links a patient to a specific ICD-10 code for a year.

**Attributes:**
- `patient_id`, `yr`, `org_id`
- `ref_icd10_id` (which specific diagnosis code)
- `has_suspect_evidence`
- `has_recapture_evidence`
- `is_captured_tenant`, `is_captured_community`
- `is_deleted`

**Schema:** `Core.Acd.AcdPatientIcd10`

### ICD-10 Evidence
Medical record evidence supporting a diagnosis code.

**Evidence types:**
- Clinical note excerpt
- Lab result
- Imaging report
- Medication list

**Schema:** `Core.Acd.AcdPatientIcd10Evidence`

**Purpose:** Prepare for CMS audits by documenting evidence trail.

### Capture Attempts
Tracks attempts by clinicians to document a diagnosis.

**Schema:** `Core.Acd.AcdPatientIcd10CaptureAttempt`

**Captures:**
- When clinician attempted to validate
- Outcome (validated, not present, unable to assess)
- Visit ID where attempted

## ACD Workflow (Prospective Review)

**Goal:** Identify and document all relevant diagnoses in current calendar year.

### Step 1: Data Import (Retrospective)
- Import previous year's diagnoses from claims
- Upsert patient ICD-10 rows and map into patient categories
- Recompute category evidence flags from linked ICD-10 evidence
- Categories may enter the year as suspect, recapture, both, or new (no suspect/recapture evidence flags)
- Domination is not recalculated at this step.

### Step 2: Clinical Review (CDI Specialist)
- CDI specialist reviews upcoming patient visit
- Identifies which suspected diagnoses to validate
- Publishes review to clinician (makes visible in "Sidecar")

### Step 3: Clinical Validation (Clinician)
- During patient visit, clinician reviews suspected diagnoses
- For each:
  - **Present:** Document in visit note, code as addressed
  - **Not present:** Mark as deleted/not applicable
  - **Unable to assess:** Defer to future visit or order tests
- Document evidence in medical record

### Step 4: Coding (CDI Specialist)
- Review clinician documentation
- Assign ICD-10 codes based on documented evidence
- Submit codes for billing
- Capture outcomes roll up from ICD-10 records to category-level tracking
- Category domination is recalculated from capture state (captured dominators only).

### Step 5: Gap Closure
- Throughout year, track which categories still need documentation
- Prioritize high-value HCCs
- Schedule visits focused on gap closure

## Common ACD Operations

### Get Patient Categories for Year
```elixir
Core.Acds.get_patient_category_codes(patient_id, 2026, org_id)
# Returns categories with ICD-10 mappings, evidence, capture attempts
```

### Update ICD-10 CDI Review Fields
```elixir
Core.Acds.update_acd_patient_icd10(patient_icd10, %{
  is_cdi_approved: true,
  cdi_at: DateTime.utc_now(),
  cdi_note: "Reviewed against current visit documentation",
  updated_by_id: cdi_specialist.id
})
```

### Search ICD-10 Codes
```elixir
Core.Acds.search_icd10(%{
  term: "diabetes",
  category_id: diabetes_category.id,
  limit: 100
})
# Fuzzy search on code and description
```

## CDI Specialist Role

**Responsibilities:**
1. **Prospective review:** Prepare for upcoming visits by identifying suspected diagnoses
2. **Retrospective review:** Review past visit notes for documentation quality
3. **Code assignment:** Translate clinical documentation into ICD-10 codes
4. **Gap analysis:** Track which HCCs need documentation, prioritize outreach
5. **Education:** Train clinicians on documentation best practices

## UI Components

**Sidecar:** Clinician-facing view during visit showing:
- Suspected diagnoses to validate
- Previous year's diagnoses
- Evidence from prior records
- Quick-code interface

**CDI Queue:** List of patients with:
- Upcoming visits
- Outstanding suspected diagnoses
- Last review date
- Assigned CDI specialist

**Gap Dashboard:** Showing:
- Categories not yet addressed this year
- High-value gaps (HCCs with highest coefficients)
- Time remaining in calendar year
- Progress toward capture rate goal

## Compliance Considerations

**CMS Audits:**
- Requires medical record evidence for every HCC claimed
- Evidence must be from face-to-face encounter
- Must be documented by qualified provider
- Must show assessment and management of condition

**Documentation standards:**
- Specificity (Type 2 diabetes, not just "diabetes")
- Severity (with complications, controlled/uncontrolled)
- Current assessment (not just "history of")

## Integration Points

**Workflows:** ACD review tasks drive clinician visit preparation
**Scheduling:** Visits scheduled specifically for gap closure
**EMR:** Diagnosis codes synced to Elation for billing
**Claims Data:** Retrospective diagnoses imported from payer feeds

## Context Module

Primary context: `Core.Acds`

**Key functions:**
- `get_patient_category_codes/3`
- `update_acd_patient_icd10/2`
- `update_acd_patient_category/2`
- `search_icd10/1`

## Database Schema

**Reference tables:**
- `ref_coding_models`
- `ref_icd10`
- `ref_coding_categories`
- `ref_coding_category_icd10` (join table)

**Patient tables:**
- `acd_patient_categories`
- `acd_patient_icd10s`
- `acd_patient_icd10_evidence`
- `acd_patient_icd10_capture_attempts`

---

**Key Takeaway**: ACD/HCC coding is critical for value-based care economics. The platform supports the full workflow from retrospective data import through clinical validation to gap closure, with evidence tracking for audit compliance.
