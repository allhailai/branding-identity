# Transitions of Care (TOC) Workflow

**Hospital Admission/Discharge Follow-Up**

## Overview

The **Transitions of Care (TOC) workflow** ensures individuals receive timely follow-up after hospital admissions and discharges to prevent readmissions, close care gaps, and provide continuity.

**Primary owners:** firsthand Guide, Triage RN, Health Guide, Psych NP

**Triggered by:** ADT (Admission, Discharge, Transfer) feed from hospitals or health plan

**Goal:** Contact within 7 days of discharge to assess needs and schedule follow-up

## Workflow Trigger

### ADT Feed Notification

**Source:** Real-time or batch feeds from hospitals or health plan claims data

**Events tracked:**
- **Admission:** Individual admitted to hospital
- **Discharge:** Individual discharged from hospital
- **Transfer:** Individual moved between facilities or units

**Data includes:**
- Individual identity (name, DOB, Medicaid ID)
- Facility name
- Admission date
- Discharge date (if discharged)
- Discharge disposition (home, SNF, AMA, etc.)
- Diagnosis/reason for admission

**System creates:**
- Sentinel event record
- Notification to care team
- Task: "TOC Follow-up"

## Workflow Steps

### Step 1: Admits Dashboard Review

**View:** "Admits Dashboard"

**Shows:** All admissions and discharges for panel

**Owner:** MCO or care team lead

**Activities:**
- Review new admits/discharges daily
- Prioritize high-risk individuals
- Create tasks for fG: "Attempt TOC visit within 7 days"

### Step 2: fG Attempt Visit or Call

**Task:** "TOC Follow-up"

**Owner:** firsthand Guide

**Timeline:** Within 7 days of discharge (ideally within 48-72 hours)

**Activities:**

**Attempt to reach individual:**
- Call individual
- If no answer, try cold home visit
- If reached, propose in-person or phone visit

**If successful contact:**
- Get individual on phone or visit in person
- Call triage line to get Health Guide or Triage RN on phone for clinical assessment

### Step 3: Clinical Assessment via Triage Line

**Owner:** Triage RN (or Health Guide if available)

**If Triage RN answers:**
1. Ask individual about hospitalization:
   - What happened?
   - Why were you admitted?
   - What treatment did you receive?
   - What medications did they send you home with?
   - Do you have follow-up appointments scheduled?
   - How are you feeling now?
   - Any new symptoms or concerns?

2. Assess immediate needs:
   - Medication: Do they have their new prescriptions? Can they afford them?
   - Appointments: Do they know when/where follow-up is? Can they get there?
   - Equipment: Do they have needed equipment (wheelchair, oxygen, etc.)?
   - Home support: Do they have help at home if needed?
   - Safety: Is home environment safe for recovery?

3. **If Triage RN can assist:** Provide support immediately
   - Call in prescriptions
   - Schedule follow-up appointments
   - Arrange transportation
   - Educate on warning signs
   - Close HEDIS gaps if RN is dual-certified and opportunity presents

4. **If escalation needed:** Schedule with Health Guide or Psych NP

**Update escalation status:** Change to "In progress" then "Resolved" after call

### Step 4: Schedule Follow-Up Visit

**Owner:** Triage RN or fG

**Criteria:**
- **High risk:** Schedule with HG or Psych NP within 7 days of talking to clinician
- **Low risk:** Schedule within 30 days of talking to clinician
- **Psych discharge:** Schedule with Psych NP within 7 days

**Activities:**
- Check clinician availability and state licensure
- Prefer assigned Health Guide if available
- If unavailable, schedule with another licensed clinician
- Create appointment in scheduling system
- Confirm with individual

**Close escalation:** Document in Elation and resolve the TOC escalation record

### Step 5: Health Guide Follow-Up Visit

**Owner:** Health Guide or Psych NP

**Activities:**
1. Review hospital discharge summary and records
2. Assess current status:
   - Symptom improvement or worsening
   - Medication adherence to new regimen
   - Understanding of discharge instructions
   - Follow-up with specialists scheduled
3. Close HEDIS gaps if opportunity
4. Address any complications or concerns
5. Reinforce care plan
6. Schedule next regular visit

**Document in EMR:** TOC visit note

### Alternative Path: Health Check

**If direct outreach fails or ADT feed missed the event:**

During a routine **Health Check**, the fG asks: *"Is the individual currently or recently hospitalized?"* — one of the four standard health check questions. A "yes" answer automatically flags the health check and generates an escalation, which initiates the TOC workflow.

See [Escalations workflow](./escalations.md) for the full Health Check question set and escalation queue logic.

## Key Metrics

- **% contacted within 7 days of discharge:** Primary TOC quality measure
- **% with follow-up visit scheduled:** Ensuring continuity
- **30-day readmission rate:** Outcome measure (goal: reduce readmissions)
- **HEDIS gap closure rate during TOC:** Value-add quality measure

## Platform Implementation

**ADT feed integration:** Sentinel events system receives feeds, creates events

**Admits dashboard:** Real-time view of admissions/discharges

**TOC tasks:** Auto-generated based on discharge events

**Integration:**
- **Scheduling:** Follow-up appointments
- **Triage line:** Escalation routing and status tracking
- **EMR:** Hospital records, TOC visit notes

---

**Key Takeaway**: TOC is critical for preventing readmissions and ensuring continuity. Timely outreach during a vulnerable period can catch problems early and reinforce care plans.
