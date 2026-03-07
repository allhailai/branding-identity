# Tenant Documentation: Firsthand

**Care Coordination for High-Risk Medicaid/Medicare Advantage Members**

## Overview

**Firsthand** is a care coordination company focused on individuals with serious mental illness (SMI) and complex medical/social needs enrolled in Medicaid and Medicare Advantage programs.

## Business Model

Firsthand contracts with **health plans (payers)** to coordinate care for their highest-risk, highest-cost members. The goal is to:

1. **Engage** hard-to-reach populations
2. **Stabilize** medical and social conditions
3. **Reduce** preventable hospitalizations and ER visits
4. **Improve** quality of life and health outcomes
5. **Generate savings** for the health plan through avoided costs

**Revenue model:** Shared savings based on Medical Loss Ratio (MLR) improvement. Firsthand earns a portion of the savings generated for the health plan when care costs are reduced below a target threshold.

**Rate-cell migration (Benefits Support strategy):** A core component of Firsthand's value creation is moving members from a **TANF or Medicaid expansion** rate cell into the **ABD (Aged, Blind, Disabled)** rate cell by helping them qualify for SSI/SSDI. Once approved for SSI/SSDI, a member gains ABD Medicaid status, which carries richer benefits and a higher capitation rate. From the health plan's perspective, this transition reduces the MLR on that member (ABD capitation better matches the member's actual cost burden), directly increasing the shared savings Firsthand captures. See [Benefits Support (SOAR)](./workflows/benefits-support.md) for the full workflow.

## Target Population

**Primary:** Medicaid members with SMI (Serious Mental Illness)

**Characteristics:**
- Complex psychiatric diagnoses (schizophrenia, bipolar, severe depression)
- Often dual-eligible (Medicaid + Medicare)
- Frequent hospitalizations and ER visits
- Barriers to accessing traditional healthcare
- Social determinants of health (SDOH) needs: housing instability, food insecurity, unemployment
- May lack insight into their conditions (anosognosia)
- Mistrust of healthcare system
- Medication non-adherence

**Lines of Business (LOB):**
- **TANF / Medicaid Expansion:** Members on TANF or ACA Medicaid expansion (entry point for rate-cell migration via Benefits Support)
- **ABD:** Aged, Blind, Disabled Medicaid
- **ABD w/SMI:** ABD with Serious Mental Illness (primary clinical target population)
- **Dual Eligible:** Medicaid + Medicare (both ABD and full duals)
- **Medicare Advantage**

## Documentation Index

### Business Context
- **[Organizational Structure](./organizational-structure.md)**: Team roles, office/pod structure, reporting lines
- **[Individual Journey (ISJ)](./individual-journey.md)**: Engage → Activate → Stabilize → Promote → Inactive
- **[Care Pathways](./care-pathways.md)**: Benefits Support, Medication Support, SUD, Suicidal Ideation, SDOH

### Workflows (Detailed)
- **[Assignment & Reassignment](./workflows/assignment.md)**: How individuals get assigned to firsthand Guides
- **[Engagement](./workflows/engagement.md)**: Initial outreach, consent, welcome session, WPA
- **[Benefits Support (SOAR)](./workflows/benefits-support.md)**: SSI/SSDI application workflow
- **[Medical Records](./workflows/medical-records.md)**: Requesting records from facilities
- **[CDI/HCC Coding](./workflows/cdi-prospective-review.md)**: Diagnosis documentation workflow
- **[Transitions of Care](./workflows/transitions-of-care.md)**: Hospital admission/discharge follow-up
- **[Escalations](./workflows/escalations.md)**: Triage line and urgent response
- **[Stabilization](./workflows/stabilization.md)**: Ongoing care coordination
- **[STRIVE (Promote)](./workflows/strive.md)**: Transition to self-management

## Quick Start Guides

**New to Firsthand?** Start with:
1. [Organizational Structure](./organizational-structure.md) - Understand the team roles and structure
2. [Individual Journey (ISJ)](./individual-journey.md) - Understand the care model progression
3. [Care Pathways](./care-pathways.md) - Understand tailored interventions

**Working on a specific workflow?** Go directly to:
- **Assignment:** [Assignment & Reassignment](./workflows/assignment.md) - Panel management
- **Engagement:** [Engagement](./workflows/engagement.md) - Initial outreach and enrollment
- **Benefits:** [Benefits Support (SOAR)](./workflows/benefits-support.md) - SSI/SSDI applications
- **Records:** [Medical Records](./workflows/medical-records.md) - Record retrieval process
- **Coding:** [CDI/HCC Coding](./workflows/cdi-prospective-review.md) - Documentation workflow
- **Transitions:** [Transitions of Care](./workflows/transitions-of-care.md) - Post-hospitalization
- **Escalations:** [Escalations](./workflows/escalations.md) - Triage and urgent response
- **Stabilization:** [Stabilization](./workflows/stabilization.md) - Ongoing care coordination
- **STRIVE:** [STRIVE (Promote)](./workflows/strive.md) - Self-management transition

**Understanding terminology?**
- **Individual** = Patient (core platform terminology)
- **fG** = firsthand Guide
- **HG** = Health Guide
- **MCO** = Manager of Community Operations
- **NME** = New Member Eligibility (benefits screening)
- **WPA** = Whole Person Assessment
- **IPR** = Individual Progress Review
- **SOAR** = SSI/SSDI Outreach, Access, and Recovery (benefits application)
- **TOC** = Transitions of Care (hospital follow-up)
- **CDI** = Clinical Documentation Improvement (HCC coding)
- **ISJ** = Individual Status Journey (overall workflow)

## Platform Mapping

### Core → Firsthand Terminology
| Core Platform | Firsthand |
|---------------|-----------|
| Patient | Individual |
| Workflow | Journey / Care Pathway |
| Task | Action Item |
| Queue | My Day / Action List |
| Contact | Support Network |
| Appointment | Visit / Session |

### Workflow Implementations

Firsthand implements multiple workflow types on the core workflow engine:

**ISJ (Individual Status Journey):** Overall progression through care
- Type Key: `isj`
- Statuses: `isj_engage`, `isj_activate`, `isj_stabilize`, `isj_promote`, `isj_inactive`

**Benefits Support:** SOAR application process
- Workflow or task-based (implementation varies)

**Engagement:** Initial outreach and enrollment
- Task-based workflow triggering ISJ progression

**Medical Records:** Record request and retrieval
- Not a separate workflow type — implemented as "super tasks" on the ISJ workflow
- One ISJ task per patient-facility, assigned to a medical records queue
- Backing table (`medical_records_requests`) tracks per-facility attempt state
- Queue statuses drive the fax/follow-up lifecycle

**CDI:** Prospective review and gap closure
- Task-based workflow integrated with scheduling

---

Last Updated: 2026-02-18
