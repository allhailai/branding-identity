# Individual Status Journey (ISJ)

**Firsthand's Core Care Progression Model**

## Overview

The **Individual Status Journey (ISJ)** is Firsthand's primary workflow tracking an individual's progression from initial outreach through stabilization to self-management.

**Platform implementation:** Workflow type with key `isj`

## Journey Phases

### 1. Engage (-3 to 0 months)

**Goal:** Establish first contact and build trust.

**Who:** firsthand Guide (fG)

**Key activities:**
- **Outreach attempts:**
  - 3 phone calls (try all known numbers)
  - 2 cold home visits (knock on door without appointment)
  - 1 pharmacy outreach (if individual doesn't respond)
- **Warm visit:** Meet individual where they are (home, community location)
- **Build rapport:** Leverage lived experience, establish trust
- **Identify immediate needs:** Safety, crisis intervention, basic SDOH support

**Success criteria:** Individual agrees to engagement visit

**Failure path:** After exhausted attempts across defined timeframe → move to **Inactive** status

**Platform status:** `isj_engage`

### 2. Activate (0-3 months)

**Goal:** Complete enrollment, assessment, and establish care plan.

**Who:** firsthand Guide + Health Guide

**Key activities:**

**Engagement Visit (fG):**
- Obtain signed consents (2 required: ROI, Treatment; 1 optional: Photography)
- Upload consents to Elation
- Conduct welcome session questionnaire
- Gather NME (New Member Eligibility) information

**Medical Records Request (Med Records team):**
- Triggered automatically when consents uploaded
- Request records from all facilities in claims data

**Schedule WPA:**
- fG schedules Whole Person Assessment with Health Guide

**Whole Person Assessment (HG):**
- Comprehensive health assessment
- Functional assessment
- Medication review
- Behavioral health screening
- Social determinants of health (SDOH) needs assessment
- Risk stratification (high risk vs low risk)

**Initial Individual Progress Review (IPR):**
- fG, HG, and MCO review together
- Identify focus areas and barriers to address
- Determine service level (high risk = more intensive)
- May identify Care Pathway eligibility (Benefits Support, Medication Support, etc.)

**CDI Prospective Review:**
- CDI specialist reviews suspected ICD-10 codes from claims
- Publishes review to HG in "Sidecar" for upcoming visits
- HG validates diagnoses during WPA

**Success criteria:** WPA completed, IPR conducted, initial care plan established → move to **Stabilize**

**Failure paths:**
- Individual cancels/no-shows: Reattempt (defined # of times)
- Individual unresponsive: After exhausted attempts → move to **Inactive**

**Platform status:** `isj_activate`

### 3. Stabilize (2-9 months)

**Goal:** Address identified barriers, stabilize conditions, improve quality of life.

**Who:** Full care team (fG, HG, + specialists as needed)

**Key activities:**

**Ongoing Care Coordination (fG):**
- Regular check-ins at cadence based on risk level:
  - **High risk:** Weekly to bi-weekly
  - **Low risk:** Monthly
- Navigate SDOH barriers (housing, food, transportation, benefits)
- Accompany to appointments
- Medication adherence support
- Crisis prevention and intervention

**Clinical Care (HG):**
- Regular health visits based on service level
- Medication management
- Chronic condition management
- Behavioral health treatment
- Order labs, imaging, referrals
- Document in EMR

**Care Pathways:**
- If enrolled in pathway (Benefits Support, Medication Support, SUD, Suicidal Ideation, SDOH), execute pathway-specific interventions
- Track pathway progress

**Pillar Scorecard:**
- System calculates stability across "pillars" based on barrier assessments
- Pillars may include: Housing, Benefits, Physical Health, Behavioral Health, Social Connection, etc.
- Drives tasks and visit priorities

**Monitoring:**
- Track hospitalizations and ER visits
- Transitions of Care follow-up after any admission
- Escalation response via triage line
- HCC gap closure (ongoing throughout year)

**Success criteria:** Key barriers resolved, conditions stabilized, individual demonstrating self-management skills → eligible for **Promote**

**Ongoing:** Most individuals spend majority of time in Stabilize, may cycle back from Promote if destabilize

**Platform status:** `isj_stabilize`

### 4. Promote (As Ready)

**Goal:** Transition to self-management with minimal support.

**Who:** STRIVE Specialists

**Key activities:**
- Reduced touch frequency
- Individual-initiated contact (vs team-driven outreach)
- Check-ins on progress and setbacks
- Support with navigating system independently
- Celebrate progress and milestones

**Criteria for promotion:**
- Engaged with care team consistently
- Stabilized medical/behavioral health conditions
- Stable housing and benefits
- Medication adherent
- Demonstrates ability to self-manage and access resources
- Low risk of hospitalization

**Monitoring:**
- Still track claims data for admissions/ER
- If individual destabilizes, can move back to Stabilize

**Platform status:** `isj_promote`

### 5. Inactive

**Why individuals become inactive:**
- **Unable to reach:** Exhausted outreach attempts, individual not responsive
- **Deceased**
- **Moved out of service area**
- **Disenrolled from health plan**
- **Declined services**

**Activities:**
- Periodic outreach attempts (some individuals may re-engage later)
- Update status in health plan reporting

**Not the same as "promoted":** Inactive = disengaged or ineligible, not successfully transitioned to self-management

**Platform status:** `isj_inactive`

## Status Transitions

**Typical progression:**
```
Engage → Activate → Stabilize → Promote
            ↓           ↓          ↓
         Inactive    Inactive   [Back to Stabilize if destabilize]
```

**System-driven transitions:**
- Engage → Activate: fG completes engagement visit and schedules WPA
- Activate → Stabilize: HG completes WPA and IPR
- Stabilize → Promote: Manual decision by care team based on criteria
- Any → Inactive: System timeout after failed outreach, or manual due to disenrollment/death/decline

## Integration with Other Workflows

**ISJ is the container.** Other workflows and tasks feed into ISJ progression:

- **Benefits Support (SOAR):** Separate workflow type, typically occurs during Activate or Stabilize
- **Medical Records:** Implemented as tasks directly on the ISJ workflow (one task per facility, assigned to a medical records queue). Triggered in Activate when consents are uploaded, ongoing in Stabilize. These are "super tasks" with a backing table (`medical_records_requests`) tracking per-facility attempt state.
- **CDI/HCC Coding:** Starts in Activate, continues throughout Stabilize
- **Transitions of Care:** Can occur at any active status
- **Escalations:** Can occur at any active status

## Metrics & Reporting

**Key metrics by phase:**

**Engage:**
- % successfully engaged (made contact)
- Time to first contact
- Outreach attempts before success

**Activate:**
- % consented
- % WPA completed
- Time from engagement visit to WPA
- % moved to Stabilize

**Stabilize:**
- Time in stabilize
- Hospitalizations (before vs during)
- ER visits (before vs during)
- HCC capture rate
- HEDIS measure closure
- Benefits enrollment rate
- Medication adherence

**Promote:**
- % of panel promoted
- Sustained promotion (not cycling back to Stabilize)

**Overall:**
- Engagement rate (% of assigned panel engaged)
- Panel size by status
- Movement through journey (flow analysis)

## Platform Implementation

**Code locations:**
- Workflow type definition: `apps/fh/lib/fh/individuals/individual_journey_statuses.ex`
- Status values: `isj_engage`, `isj_activate`, `isj_stabilize`, `isj_promote`, `isj_inactive`
- Business logic: Various modules in `apps/fh/lib/fh/`
- Seed data: `apps/fh/priv/repo/local_seed_data/isj_wf.ex`

**Database:**
- Each individual has one ISJ workflow (type_key = "isj")
- Workflow status periods track time in each phase
- Tasks generated based on status transitions

---

**Key Takeaway**: ISJ is the backbone of Firsthand's care model, providing structure to what could otherwise be ad-hoc care coordination. It ensures systematic progression, appropriate interventions at each phase, and clear success criteria for moving forward or identifying individuals needing more support.
