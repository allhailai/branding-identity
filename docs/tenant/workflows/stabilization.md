# Stabilization Workflow

**Ongoing Care Coordination and Barrier Management**

## Overview

The **Stabilization workflow** represents the ongoing care coordination phase where the care team works to address identified barriers, stabilize medical and behavioral health conditions, and improve quality of life.

**ISJ Status:** `isj_stabilize`

**Duration:** Typically 2-9 months, but individuals may remain in stabilize long-term or cycle back from promote

**Primary owners:** firsthand Guide, Health Guide

## Entry Criteria

**Transitions to Stabilize when:**
- WPA completed by Health Guide
- Initial IPR conducted (fG, HG, MCO)
- Service level set (high risk or low risk)
- Initial care plan established

## Key Activities

### Individual Progress Reviews (IPR)

**Frequency:** 
- Initial IPR: After WPA
- Ongoing IPRs: Every 3-6 months or as needed

**Participants:** fG, HG, MCO (together)

**Purpose:**
1. Review progress on identified focus areas
2. Assess barrier status (resolved, improving, persistent, new)
3. Update care plan and goals
4. Identify new interventions or Care Pathways
5. Adjust service level if needed

**Outputs:**
- Updated focus areas
- New tasks created
- Care plan documented

### Service Level and Visit Cadence

**Service Level determines visit frequency:**

**High Risk:**
- More intensive support needed
- Complex medical/behavioral health needs
- High hospitalization risk
- Social instability
- **fG check-ins:** Weekly to bi-weekly
- **HG visits:** Every 2-4 weeks or as needed

**Low Risk:**
- Stable conditions
- Engaged with care
- Lower acuity
- **fG check-ins:** Monthly
- **HG visits:** Every 2-3 months or as needed

**Adjustment:** Service level can change based on individual's status

### Pillar Scorecard

**Concept:** Stability assessed across multiple "pillars" or domains

**Example Pillars:**
- **Physical Health:** Chronic conditions controlled, medications adherent
- **Behavioral Health:** Psych symptoms managed, engaged in treatment
- **Housing:** Stable, safe, appropriate
- **Benefits:** Income and health coverage secured
- **Social Connection:** Support network, community engagement
- **Safety:** Free from abuse, exploitation, high-risk behaviors

**Scoring:**
- System calculates status of each pillar based on assessments and data
- "Green" = Stable, "Yellow" = At risk, "Red" = Unstable
- Drives prioritization and task generation

**Platform:** Pillar scorecard visualized in individual profile

### Ongoing Care Coordination (fG)

**Regular touch points:**
- Scheduled check-ins (phone or in-person)
- Responsive to individual-initiated contact
- Accompanying to appointments
- Crisis prevention and intervention

**Activities:**
- **SDOH navigation:**
  - Housing applications and stability
  - Food assistance (SNAP, food banks)
  - Transportation coordination
  - Benefits enrollment and maintenance
- **Healthcare navigation:**
  - Schedule appointments with specialists
  - Accompany to appointments
  - Coordinate prescriptions and refills
  - Follow up on referrals and test results
- **Medication adherence support:**
  - Pill box setup
  - Reminders
  - Address barriers (cost, side effects, beliefs)
- **Social support:**
  - Build trusting relationship
  - Encourage connection to community resources
  - Celebrate successes
- **Crisis prevention:**
  - Monitor for warning signs
  - Safety planning
  - Escalate to clinicians when needed

### Ongoing Clinical Care (HG)

**Regular health visits:**
- Comprehensive health assessments
- Chronic condition management (diabetes, hypertension, COPD, etc.)
- Behavioral health treatment
- Medication management
- Lab/imaging orders and review
- Referrals to specialists
- **HCC coding:** Validate and document all active diagnoses annually
- **HEDIS measures:** Close quality gaps opportunistically

### Care Pathways

**If enrolled in Care Pathway during Stabilize:**
- Execute pathway-specific interventions
- Track pathway progress
- May involve specialists (SOAR, Psych NP, etc.)

**See:** [Care Pathways documentation](../care-pathways.md)

### Monitoring and Response

**Ongoing monitoring for:**
- **Hospitalizations:** TOC workflow triggered
- **ER visits:** Follow up to understand why and prevent future
- **No-shows:** Outreach and re-engagement
- **Escalations:** Triage line and urgent visits
- **Gaps:** HCC, HEDIS, care plan gaps

## Promotion Readiness

**Criteria for moving to Promote:**
- Consistent engagement with care team
- Medical/behavioral health conditions stabilized
- Stable housing and income
- Medication adherent
- Demonstrates self-management skills
- Low risk of hospitalization
- Pillar scorecard mostly "green"
- Individual expresses readiness

**Decision:** Care team (fG, HG, MCO) in IPR decides individual ready for promotion

**Transition:** ISJ status `isj_stabilize` → `isj_promote`

## Cycling Back from Promote

**If individual destabilizes after promotion:**
- Hospitalization or ER visits increase
- Housing or benefits lost
- Behavioral health crisis
- Medication non-adherence
- Individual requests more support

**Action:** Move back to Stabilize with higher service level temporarily

## Key Metrics

- **Time in stabilize:** Average duration before promotion or inactivation
- **Hospitalizations:** Rate during stabilize vs baseline
- **ER visits:** Rate during stabilize vs baseline
- **HCC capture rate:** % of HCCs documented during stabilize
- **HEDIS gap closure rate**
- **Pillar scorecard progress:** Movement from red → yellow → green
- **Promotion rate:** % of stabilize individuals promoted annually

## Platform Implementation

**ISJ workflow status:** `isj_stabilize`

**Tasks:** Ongoing tasks for fG check-ins, HG visits, gap closure, etc.

**Pillar scorecard:** Calculated and displayed in individual profile

**Care plan:** Documented and updated in platform

---

**Key Takeaway**: Stabilization is the core of Firsthand's care model, where sustained engagement and tailored interventions improve outcomes and quality of life. Success is measured by reduced acute care utilization, improved health, and progression toward self-management.
