# Benefits Support (SOAR) Workflow

**SSI/SSDI Application Process**

## Overview

The **Benefits Support workflow** (also called **SOAR** - SSI/SSDI Outreach, Access, and Recovery) is a Care Pathway focused on securing federal disability benefits (SSI - Supplemental Security Income, SSDI - Social Security Disability Insurance) for eligible individuals.

**Strategic rationale (rate-cell migration):** This workflow is a core driver of Firsthand's business model, not solely a member service. Many individuals Firsthand serves are enrolled in a **TANF or Medicaid expansion** rate cell, which carries lower capitation relative to their actual cost burden. When a member qualifies for SSI/SSDI, they transition to **ABD (Aged, Blind, Disabled) Medicaid** status — a higher-capitation rate cell that better matches their clinical complexity. This migration improves the health plan's Medical Loss Ratio (MLR), increasing the shared savings that Firsthand captures. In short: securing benefits for the individual also unlocks direct revenue value for Firsthand.

**Member value:** SSI/SSDI approval also provides the individual with stable income and access to Medicare (SSDI) or enhanced Medicaid (SSI), meaningfully improving their financial security and healthcare access.

**Duration:** Typically 3-6 months from eligibility screening to application submission; 3-9 months for SSA decision

**Primary owners:** firsthand Guide, SOAR Specialist, Psych NP

## Eligibility & Screening

### New Member Eligibility (NME) Assessment

**When:** During Welcome Session (Engagement workflow)

**Owner:** firsthand Guide

**Questions assess:**
- Current income and benefits status
- Disability status (physical, mental, or both)
- Previous SSI/SSDI applications (approved, denied, never applied)
- Work history (required for SSDI eligibility)
- Living situation and financial need

**Eligibility criteria:**
- Not currently receiving SSI/SSDI
- Has qualifying disability (SMI qualifies)
- Meets financial limits (asset and income tests)
- Has sufficient work credits (for SSDI) or financial need (for SSI)

**Outcome:** `nme_eligible` or `nme_ineligible` flag

### Medical Eligibility Pre-Check

**If NME-eligible:** SOAR Specialist does preliminary review:
- Do they have SMI diagnosis from claims?
- Do they meet duration requirement (disability expected to last 12+ months)?
- Any past denials and why?
- Likely to meet SSA's disability criteria?

**Outcome:** "Likely eligible", "Not determined" (need more info), or "Ineligible"

## Workflow Steps (If Eligible)

### Step 1: Schedule SOAR Visit

**Task:** "Schedule SOAR Visit with Psych NP"

**Owner:** firsthand Guide

**Activities:**
- Explain purpose of SOAR visit to individual: psychiatric evaluation to document disability
- Psych NP assigned to individual's care team
- Schedule SOAR visit (typically 60-90 min appointment)
- Can be in-person or telehealth depending on state licensure

**Task closure:** Psych NP assigned and SOAR visit scheduled

### Step 2: SOAR Visit (Psychiatric Evaluation)

**Task:** "Complete SOAR Visit"

**Owner:** Psychiatric Nurse Practitioner

**Purpose:** Comprehensive psychiatric evaluation documented to SSA standards

**Assessment includes:**
- **Psychiatric history:** Diagnoses, treatment history, hospitalizations
- **Current symptoms:** Detailed symptom inventory aligned with SSA criteria
- **Functional impairments:** How symptoms impact ability to work and function
  - Concentration, persistence, pace
  - Social interaction
  - Adaptation to change
  - Self-care and safety
- **Medication history:** Trials, effectiveness, side effects, adherence
- **Substance use:** Current and historical
- **Mental status exam:** Formal MSE documentation
- **Prognosis:** Likelihood of improvement, duration of disability

**Documentation:** Psych NP completes detailed SOAR evaluation report in format required by SSA

**If unresponsive/cancels:** fG reattempts scheduling [X] times

**Task closure:** SOAR visit note completed in EMR and SOAR report generated

### Step 3: Medical Determination

**Task:** "Confirm Medical Eligibility & Complete Medical Determination"

**Owner:** SOAR Specialist

**Activities:**

**Review SOAR visit documentation:**
- Does it support disability claim?
- Are functional impairments clearly documented?
- Any gaps in documentation?

**If Eligible:**
- Individual meets SSA disability criteria based on documentation
- Proceed to application preparation

**If Not Determined:**
- Need more medical evidence
- Create tasks:
  - Request additional medical records from treating providers
  - Schedule evaluation with specialist (if physical disability also)
  - Individual needs to attend follow-up appointments
- SOAR Specialist tracks outstanding items

**If Ineligible:**
- Does not meet SSA criteria (e.g., working substantial gainful activity, not severe enough)
- fG notifies individual
- Individual continues with regular care coordination (may revisit later if condition worsens)

**Task closure:** Medical determination documented as eligible or ineligible

### Step 4: Warm Handoff to SOAR Specialist

**Task:** "Schedule Warm Handoff to SOAR Specialist"

**Owner:** firsthand Guide

**Purpose:** Introduce individual to SOAR Specialist who will guide application

**Activities:**
- fG, individual, and SOAR Specialist on call together
- SOAR Specialist explains application process and timeline
- Sets expectations (will take months, need individual's cooperation)
- Schedules first application prep call

**Task closure:** Warm handoff call completed

### Step 5: Application Preparation Call #1

**Task:** "Schedule & Complete Warm Handoff to SOAR Specialist - Application Prep Call #1"

**Owner:** SOAR Specialist (with fG support)

**Activities:**

**Gather information for application:**
- Personal information (name, DOB, SSN, address, contact)
- Work history (past 15 years, detailed job duties and dates)
- Medical treatment history (all providers, hospitals, clinics)
- Medications (current and past)
- Daily activities and limitations
- Education history
- Criminal justice involvement if any

**Explain application:**
- What SSA will review
- Timeline for decision (3-9 months average)
- Possible outcomes (approved, denied, need more info)
- Appeals process if denied

**If individual disengages:** fG re-engages, emphasizes importance and benefit

**Task closure:** Information gathered and documented

### Step 6: Application Preparation Call #2 & Draft Applications

**Task:** "Schedule & Complete Application Prep Call #2 & Complete SSA Draft Applications"

**Owner:** SOAR Specialist

**Activities:**

**Complete draft applications:**
- SSA-16 (Application for SSI)
- SSA-3368 (Disability Report)
- SSA work history forms
- Authorization forms for SSA to request medical records

**Review draft with individual:**
- Read through applications together
- Confirm accuracy of all information
- Explain what they're signing

**Individual has questions/concerns:**
- SOAR Specialist clarifies
- May involve fG to support

**Task closure:** Draft applications completed and reviewed with individual

### Step 7: Get Applications Signed

**Task:** "Get SSA Applications Signed"

**Owner:** firsthand Guide (or SOAR Specialist if in-person)

**Activities:**
- Meet with individual to sign all application forms
- Witness signatures
- Make copies for individual's records
- Scan originals for submission

**If individual hesitates:**
- Address concerns
- Re-explain benefits of approval
- fG uses rapport and trust to encourage

**Task closure:** Signed applications in hand

### Step 8: Submit Application to SSA

**Task:** "Submit SSA Application to Local SSA Office"

**Owner:** firsthand Guide or SOAR Specialist (state-specific)

**Methods vary by state/local SSA office:**
- **In-person submission:** fG or SOAR Specialist accompanies individual to SSA office, submits in person
- **Mail submission:** Mail application with tracking
- **Fax submission:** Some offices accept fax
- **Online submission:** Some components can be submitted online

**Receive confirmation:**
- Date stamp or tracking number
- Application receipt notice from SSA (may take weeks)

**Task closure:** Application submitted and confirmation received

### Step 9: Ongoing Support During Review

**Owner:** SOAR Specialist and fG

**Activities:**

**Monitor application status:**
- Check SSA system periodically
- Respond to any SSA requests for additional information
- Track timeline

**If SSA requests more information:**
- Gather requested medical records
- Schedule consultative exams (if SSA requires)
- Submit additional documentation

**Support individual:**
- fG checks in, reassures during long wait
- Helps with any SSA appointments
- Manages expectations

**If denied:**
- Review denial reason
- Assess if appeal is warranted (most are denied initially)
- If appealing, restart some steps with updated documentation
- SOAR Specialist supports through reconsideration and ALJ hearing if needed

**If approved:**
- Celebrate!
- fG helps individual understand benefit amount and payment schedule
- Connect to benefits management support if needed
- Document success in system

**Workflow completion:** Application decision received (approved or exhausted appeals)

**ISJ status:** Remains Stabilize, but major barrier addressed

## Key Metrics

- **NME eligibility rate:** % of panel screened as eligible
- **SOAR completion rate:** % of eligible who complete SOAR visit and application
- **Application submission rate:** % of started applications actually submitted
- **Approval rate:** % of submitted applications approved (first try and after appeals)
- **Time to submission:** Days from eligibility to application submitted
- **Time to decision:** Days from submission to SSA decision

## Platform Implementation

**Workflow type:** May be separate workflow or task-based within ISJ

**Tasks:** As listed in steps above

**Integration:**
- **Scheduling:** SOAR visit, prep calls
- **EMR:** SOAR report documentation
- **Care team:** Psych NP assignment

**Code location:** `apps/fh/lib/fh/bensup/`

---

**Key Takeaway**: SOAR is a high-touch, high-value intervention requiring coordination across multiple team members and patience through a lengthy government process. Success dramatically improves financial stability and health coverage for individuals.
