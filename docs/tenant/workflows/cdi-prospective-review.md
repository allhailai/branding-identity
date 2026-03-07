# CDI Prospective Review Workflow

**Clinical Documentation Improvement and HCC Coding**

## Overview

The **CDI (Clinical Documentation Improvement) Prospective Review workflow** prepares for upcoming patient visits by identifying suspected diagnoses from claims data and facilitating their validation by clinicians, supporting accurate HCC (risk adjustment) coding.

**Primary owners:** CDI Specialists, Health Guides, Psych NPs

**Integration:** [See core platform ACD/HCC Coding documentation](../../core/acd-hcc-coding.md) for conceptual foundation

## Prospective Review Process

### Step 1: Identify Individuals for Review

**Queue:** "List of Individuals Requiring CDI Review"

**Filters:**
- CDI Name = Blank (not yet assigned to CDI specialist)
- Review Complete = False
- Visit Reason (Initial WPA, Annual, Follow-up)
- Next Visit Date (prioritize upcoming visits)
- Office/pod

**Source:** Individuals with upcoming visits who have suspected ICD-10 codes from claims

### Step 2: ICD-10 and Category Data Pre-Loaded

**System:** Claims data imported, creates `acd_patient_icd10s` records

**Status:** "Suspected" (from previous year or current year claims)

**Not yet visible to clinician:** CDI must publish review before codes appear in "Sidecar"

**Owner:** Data Operations or automated import

**Category rollups:** `acd_patient_categories` are derived from mapped ICD-10s and carry evidence flags:
- `has_suspect_evidence = true` -> category has suspect evidence
- `has_recapture_evidence = true` -> category has recapture evidence from coded ICD-10 history
- `has_suspect_evidence = false` and `has_recapture_evidence = false` -> category is functionally "new"
- Domination is capture-gated: a category dominates peers only when the dominator category is captured (same patient/year/coding model scope)

### Step 3: CDI Specialist Reviews

**Owner:** CDI Specialist

**Activities:**
1. **Assign self to individual:** Claims CDI assignment for that review
2. **Review suspected diagnoses:**
   - ICD-10 codes from claims
   - Associated HCC categories
   - Category state context (suspect / recapture / new)
   - High-value HCCs (prioritize)
3. **Review medical records:** If available in Elation
4. **Determine which to surface:**
   - Likely still present (chronic conditions)
   - High-value gaps
   - Remove codes that are clearly resolved or not applicable
5. **Publish review:** Makes codes visible to clinician in "Sidecar"

**Sidecar:** Clinician-facing view showing suspected codes to validate during visit

### Step 4: Clinician Validates During Visit

**Owner:** Health Guide or Psych NP

**During patient visit:**
- **Sidecar displays suspected diagnoses** (published by CDI)
- For each suspected diagnosis, clinician:
  - **Present:** Ask about condition, assess current status, document in visit note, mark as "Addressed"
  - **Not present:** Mark as "Not applicable" or delete
  - **Unable to assess:** Mark for follow-up (may need specialist evaluation, labs, imaging, or more records)

**Documentation standards:**
- Specificity (Type 2 diabetes, not just "diabetes")
- Severity (with complications, controlled/uncontrolled)
- Current assessment (not just "history of")
- Meets SSA/CMS criteria

**System updates:** ICD-10 status changes based on clinician input
- Category capture flags roll up from ICD-10 capture attempts; domination is recalculated from captured categories (not from evidence-only imports)

### Step 5: CDI Retrospective Review

**Owner:** CDI Specialist

**After visit completed:**
1. Review clinician's visit note
2. **Assign ICD-10 codes** based on documented evidence:
   - Match documentation to specific ICD-10 codes
   - Ensure codes supported by medical record
   - Follow coding guidelines and compliance standards
3. **Update coding in system:**
   - Mark codes as "Addressed" or "Recaptured"
   - Assign to appropriate HCC categories
4. **Flag documentation issues:**
   - If documentation insufficient, provide feedback to clinician
   - May request addendum to visit note
5. **Mark review complete**

### Step 6: Gap Tracking and Closure

**Throughout year:**
- **Gap dashboard** shows which HCCs not yet addressed
- **High-value gaps prioritized** for follow-up visits
- **Visit scheduling** may be driven by gap closure needs
- **End of year push** to address remaining gaps before calendar year end
- **State-aware targeting** can prioritize:
  - Suspect-only categories for validation
  - Recapture categories for annual re-documentation
  - New categories for confirmation and coding hygiene

**Activities:**
- CDI and care team identify individuals with high-value gaps
- Schedule visits focused on gap closure
- Repeat prospective review process

## Key Metrics

- **HCC capture rate:** % of suspected HCCs validated and coded
- **High-value HCC capture rate:** $ value of HCCs captured vs total potential
- **Documentation quality score:** % of visits with compliant documentation
- **Prospective review completion rate:** % of individuals reviewed before visit
- **Gap closure rate:** % of gaps closed by end of year

## Platform Implementation

**CDI queue:** Filterable list of individuals needing review

**Sidecar:** Clinician view of suspected diagnoses during visit

**Integration:**
- **Claims data import:** Retrospective ICD-10s loaded
- **EMR:** Visit documentation, code assignment
- **Scheduling:** Gap-driven visit scheduling

**Code location:** Related to `Core.Acd` context and `apps/fh/` CDI modules

---

**Key Takeaway**: CDI prospective review systematically ensures every suspected diagnosis is validated and documented, maximizing risk adjustment revenue while improving clinical understanding of patient complexity.
