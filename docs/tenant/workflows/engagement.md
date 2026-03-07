# Engagement Workflow

**Initial Outreach, Consent, and Assessment**

## Overview

The **Engagement workflow** is the first substantive interaction with an individual, moving them from initial assignment through consent and assessment to enrollment in ongoing care coordination.

**Duration:** Typically 2-4 weeks from assignment to completion
**Primary owner:** firsthand Guide (fG)
**Outcome:** Individual consented, assessed, and transitioned to Stabilize phase

## Workflow Steps

### Pre-Work: Assignment Complete

**Prerequisite:** Individual assigned to fG by MCO via assignment workflow

**Status:** ISJ workflow created with status = `isj_engage`

**Starting point:** fG receives notification of new assignment

### Step 1: Outreach and Scheduling

**Task:** "Schedule Engagement Visit"

**Owner:** firsthand Guide

**Activities:**
1. **Review individual information:**
   - Name, age, address
   - Available contact information (phone, email)
   - Diagnoses and risk level from claims
   - Previous engagement attempts if re-outreach

2. **Attempt contact via all methods:**
   - **3 phone calls** - Try all known phone numbers at least once
     - Different times of day
     - Leave voicemail if available
   - **2 cold home visits** - Go to address without appointment
     - Knock on door
     - Leave door hanger with contact info
   - **1 pharmacy outreach** - If individual picks up meds regularly
     - Call pharmacy to leave message
     - Or visit pharmacy to coordinate contact

3. **Make warm contact:**
   - Introduce self and Firsthand
   - Explain purpose: "We're here to support your health and wellbeing"
   - Leverage lived experience: "I've been through similar challenges"
   - Address concerns or hesitations
   - Propose engagement visit

4. **Schedule visit:**
   - Individual's preferred location (home, community location)
   - Individual's preferred time
   - Confirm contact info for reminder
   - Send appointment reminder

**Success:** Engagement visit scheduled
**Failure path:** After exhausted attempts across X days → escalate to MCO → may move to Inactive

**Task closure:** Completed when engagement visit appointment created in system

### Step 2: Engagement Visit

**Task:** "Complete Engagement Visit"

**Owner:** firsthand Guide

**Location:** Individual's home or community location (park, coffee shop, library, etc.)

**Activities:**

1. **Build rapport:**
   - Introductions, share own story of lived experience
   - Ask about individual's day, interests, life
   - Listen without judgment
   - Establish trust

2. **Explain Firsthand services:**
   - "We're here to help you with whatever you need"
   - Peer support + nurse practitioner visits
   - Assistance with housing, food, transportation, benefits
   - No judgment, meet you where you are

3. **Gather basic information:**
   - Preferred name
   - Current living situation
   - Immediate needs or concerns
   - Emergency contact

4. **Obtain signed consents:**
   - **Release of Information (ROI):** Required - allows requesting medical records
   - **Treatment consent:** Required - allows HG to provide care
   - **Photography/media release:** Optional - for success stories if individual agrees
   - Explain each consent in plain language
   - Individual signs physical forms

5. **Upload consents to Elation:**
   - Scan or photo signed consents
   - Upload to EMR immediately (triggers medical records workflow)

6. **Conduct Welcome Session questionnaire:**
   - Tailored questions based on suspected needs
   - Screen for Care Pathway eligibility (e.g., benefits screening for NME)
   - Can be completed during visit or follow-up call if time limited

7. **Schedule Whole Person Assessment (WPA):**
   - Explain what WPA is: comprehensive health assessment with nurse practitioner
   - Propose dates/times
   - Create appointment with Health Guide
   - Provide individual with appointment details

**If individual cancels/no-shows:**
- Reattempt [X] times
- After [X] failed attempts, escalate to MCO

**If individual unresponsive after exhausted attempts:**
- Document final attempt
- Move ISJ workflow to Inactive status

**Task closure:** Completed when:
- 2 required consents uploaded to Elation
- Welcome questionnaire submitted
- WPA scheduled

**ISJ status transition:** `isj_engage` → `isj_activate`

### Step 3: Medical Records Request (Parallel)

**Triggered by:** Consents uploaded to Elation

**Owner:** Medical Records Specialists

**See:** [Medical Records](./medical-records.md) for full details

**Implementation:** When consents are uploaded, the system creates ISJ tasks (one per facility identified from claims data) assigned to the medical records queue. These are not a separate workflow — they are tasks on the same ISJ workflow, worked via the queue by Medical Records Specialists.

**Summary:**
- Identify facilities from claims data
- Create one ISJ task per facility on the medical records queue
- Specialists request records via fax, track attempts, and follow up
- Upload received records to Elation

**Timing:** Occurs in parallel with WPA scheduling, ideally records received before or shortly after WPA

### Step 4: Whole Person Assessment (WPA)

**Task:** "Complete Initial WPA"

**Owner:** Health Guide

**Preceded by:** HG reviews fG's welcome session notes and any received medical records

**Activities:**

1. **Build rapport:**
   - Introduction, acknowledge fG's role
   - Explain HG role: nurse practitioner, here to help with health

2. **Comprehensive assessment:**
   - **Medical history:** Chronic conditions, past hospitalizations, surgeries
   - **Current symptoms:** What's bothering you now?
   - **Medications:** What are you taking, how often, any side effects?
   - **Behavioral health:** Mental health diagnoses, treatment history, current symptoms
   - **Functional assessment:** ADLs (activities of daily living), mobility, cognition
   - **Social determinants:** Housing, food, transportation, safety, social support
   - **Substance use:** Screening for alcohol, tobacco, drugs
   - **Risk assessment:** Suicide ideation, safety concerns

3. **Physical exam (if in-person):**
   - Vitals: BP, pulse, temperature, weight
   - Basic physical exam relevant to conditions

4. **Review and validate ICD-10 codes:**
   - CDI specialist has pre-populated suspected diagnoses in "Sidecar"
   - For each suspected diagnosis:
     - **Present:** Ask about it, document current status, code as addressed
     - **Not present:** Mark as not applicable
     - **Unable to assess:** Defer, may need records or specialist referral

5. **Identify focus areas and barriers:**
   - What are the biggest challenges right now?
   - What do you want to work on?
   - Document preliminary barriers for IPR

6. **Set preliminary service level:**
   - High risk: Complex needs, high hospitalization risk, frequent touch needed
   - Low risk: Stable, less intensive support appropriate

**If individual cancels/no-shows WPA:**
- fG re-schedules
- Reattempt [X] times
- After [X] failed attempts, may move to Inactive

**Task closure:** Completed when WPA documented in Elation and suspected/surfaced diagnoses resolved or deferred

### Step 5: CDI Prospective Review (Parallel)

**Task:** "Complete PR for Initial WPA Suspecting & Surfacing"

**Owner:** CDI Specialist

**Activities:**
1. Review ICD-10 codes from claims
2. Pre-populate suspected diagnoses in "Sidecar"
3. Publish review for HG to see during WPA
4. After WPA, review HG documentation for code assignment

**See:** [CDI Prospective Review Workflow](./cdi-prospective-review.md) for full details

### Step 6: Initial Individual Progress Review (IPR)

**Task:** "Complete Initial IPR"

**Owners:** fG, HG, MCO (together)

**Activities:**

1. **Review all gathered information:**
   - fG's engagement visit and welcome session notes
   - HG's WPA findings
   - Received medical records
   - Claims data and risk indicators

2. **Identify interventions:**
   - What are the top 3-5 priorities?
   - Which Care Pathways should be enrolled in?
     - Benefits Support (if NME-eligible)
     - Medication Support (if non-adherent)
     - SUD, Suicidal Ideation, SDOH as appropriate
   - What specialist referrals needed?
   - What tasks need to be created?

3. **Confirm service level:**
   - High risk vs low risk
   - Determines visit cadence going forward

4. **Create initial care plan:**
   - Goals for next 3-6 months
   - Assigned responsibilities (fG, HG, specialists)
   - Follow-up schedule

**Task closure:** Completed when IPR documented and intervention tasks created

**ISJ status transition:** `isj_activate` → `isj_stabilize`

## Success Criteria

**Engagement workflow complete when:**
- Individual consented
- Welcome questionnaire completed
- Medical records requested
- WPA completed with validated diagnoses
- Initial IPR conducted with care plan established
- ISJ status = Stabilize

## Failure Paths

**Unable to reach:**
- After exhausted outreach attempts: Move to `isj_inactive`
- Can re-engage later if individual responds

**Individual declines services:**
- Document reason
- Move to `isj_inactive`
- Report to health plan as declined

**Individual not eligible:**
- Disenrolled from health plan
- Moved out of service area
- Move to `isj_inactive`

## Timeline Expectations

| Step | Expected Duration |
|------|------------------|
| Outreach to scheduled visit | 3-7 days |
| Engagement visit to WPA | 7-14 days |
| WPA to IPR | 1-3 days |
| Total (Assignment to Stabilize) | 2-4 weeks |

## Key Metrics

- **Engagement rate:** % of assigned individuals who complete engagement visit
- **Consent rate:** % who sign consents during engagement visit
- **WPA completion rate:** % who complete WPA after engagement visit
- **Time to WPA:** Days from assignment to WPA complete
- **Dropout rate:** % who disengage during engagement workflow

## Platform Implementation

**ISJ workflow status:** `isj_engage` → `isj_activate` → `isj_stabilize`

**Tasks created:**
- `schedule_engagement_visit`
- `complete_engagement_visit`
- `gather_nme_info`
- `complete_welcome_questionnaire`
- `isj_medical_records_request` (one per facility, on medical records queue)
- `complete_initial_wpa`
- `complete_prospective_review`
- `complete_initial_ipr`

**Integrations:**
- **Elation:** Consent upload, WPA documentation, diagnosis coding
- **Medical Records tasks:** ISJ tasks created on consent upload (one per facility)
- **CDI workflow:** Prospective review for WPA
- **Scheduling:** Engagement visit and WPA appointments

---

**Key Takeaway**: The Engagement workflow is critical for successfully onboarding individuals into Firsthand's care model. It requires persistence, cultural competence, and building trust with a population that often has negative experiences with healthcare systems. The fG's lived experience is essential to success.
