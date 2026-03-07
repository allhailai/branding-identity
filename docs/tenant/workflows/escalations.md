# Escalations Workflow

**Triage Line and Urgent Response**

## Overview

The **Escalations workflow** manages urgent clinical needs that arise between scheduled visits, ensuring individuals can access clinical support quickly when issues arise.

**Primary owners:** Health Guide Assistants (HGA), Triage RNs, Health Guides, Psych NPs

**Entry points:**
1. **Triage Line:** Individuals call a dedicated phone number
2. **Health Check:** firsthand Guides perform periodic health checks; a "yes" answer to any of the four questions automatically generates an escalation

## Triage Line Workflow

### Step 1: Call Received

**Initial answer:** Health Guide Assistant (HGA)

**Activities:**
- Greet caller
- Identify individual (confirm name, DOB)
- Assess urgency (triage algorithm)
- If life-threatening emergency: Direct to call 911
- If urgent clinical: Slack clinicians to pick up call

### Step 2: Clinician Pick-Up

**Owner:** Triage RN (primary) or available clinician

**Activities:**

**If Triage RN available:**
- Pick up call from HGA
- Review individual's info in platform:
  - Timeline (recent activities, visits, notes)
  - Current medications
  - Diagnoses and risk factors
  - Assigned Health Guide

**Assess need:**
- What's happening right now?
- How long has this been going on?
- What have you tried?
- Any new symptoms?
- Safety assessment (if behavioral health concern)

**Determine response:**

**Option A: Triage RN can assist**
- Provide advice (medication side effects, symptom management, when to seek ER)
- Call in prescription if needed and within scope
- Schedule appointment with PCP or specialist
- Coordinate services (transportation, home health)
- Reassure and educate
- **Create escalation event in Elation** to start visit note
- **Change escalation status to "Resolved"** after call

**Option B: Escalate to Health Guide or Psych NP**
- Need for prescribing (controlled substances, complex meds)
- Need for diagnostic assessment
- Need for behavioral health crisis intervention
- Proceed to Step 3 (same as Health Check escalation workflow)

### Step 3: Escalate to Appropriate Clinician

**Owner:** Triage RN

**Activities:**

**Identify assigned Health Guide:**
- Check individual's care team
- Preferred clinician if known

**Check availability:**
- Is assigned HG available now or soon?
- Is assigned HG licensed in individual's state?

**If available:** Schedule with assigned HG
**If unavailable:** Schedule with another HG or Psych NP licensed in that state

**Create appointment** in scheduling system

**Close escalation:**
- Document in Elation: "Scheduled with [clinician] on [date/time]"
- Update escalation status: "Resolved" (or "In progress" if waiting for appointment)
- Notify individual of scheduled appointment

## Health Check Workflow

### Step 1: fG Performs Health Check

**Performed by:** firsthand Guide (fG) during scheduled check-ins or visits

**The Health Check asks four questions:**
1. Is the individual currently or recently hospitalized?
2. Is the patient having trouble taking their medication?
3. Have you noticed any changes in the patient's health?
4. Does the patient have any health concerns?

**If "yes" to any question:** The health check is automatically flagged and an escalation is created in the system, routing to the escalation queue.

**If "no" to all questions:** No escalation created; health check recorded as routine.

### Step 2: Escalation Queue Review

**View:** "Escalation Queue"

**Owner:** Triage RN

**Filters:**
- Urgency level
- Status (pending, in progress, resolved)
- Date submitted
- Individual, pod, office

**Triage RN reviews queue:**
- Prioritize high urgency
- Review health check details and the flagged question(s)
- Check individual timeline and context in platform

### Step 3: On-Call Assessment

**Owner:** Triage RN contacts individual or reviews with care team

**Determine if can assist:**

**Option A: Triage RN can resolve**
- Provide guidance
- Coordinate resources
- Schedule non-urgent appointment
- Update escalation: "In progress" → "Resolved"

**Option B: Escalate to HG**
- Clinical decision needed
- Prescribing needed
- Continue to Step 4

### Step 4: Notify or Schedule with Health Guide

**Clinician selection is driven by chief complaint and scope of practice:**
- **Minor issues** (e.g., medication question, mild symptom): Triage RN resolves directly
- **Moderate/complex issues** (e.g., diagnostic assessment needed, uncontrolled condition): Schedule with Health Guide (NP)
- **Behavioral health crisis or complex prescribing:** Schedule with Psych NP

**If Health Guide is already aware:**
- Triage RN messages assigned HG in platform/Slack
- HG responds with plan (will call individual, will schedule visit, etc.)
- Triage RN updates escalation status based on HG response

**If scheduling is needed:**
- Identify assigned HG
- Check availability and state license
- Schedule appointment
- Create escalation event in Elation for visit note
- Update escalation: "Resolved"

### Step 5: Clinician Visit

**Owner:** Health Guide or Psych NP

**Activities:**
- Call or visit individual (based on escalation urgency)
- Assess problem
- Provide treatment
- Document in EMR (escalation visit note)
- Coordinate any follow-up needed
- Notify fG of outcome

## Key Considerations

**If triage nurse answers triage line and can resolve immediately:**
- Escalation resolved on first call
- No queue entry needed
- Documented in Elation

**If HGA answers triage line:**
- Follows triage line escalation workflow (notify clinicians, RN picks up)

**Urgency levels:**
- **High:** Immediate safety concern, severe symptoms, needs response same day
- **Medium:** Concerning but not emergent, needs response within 1-2 days
- **Low:** Can wait for next scheduled visit or routine follow-up

## Key Metrics

- **Triage line answer rate:** % of calls answered (not going to voicemail)
- **Time to clinician response:** From call/form submission to clinician contact
- **Escalation resolution rate:** % resolved by Triage RN vs requiring HG
- **ER diversion rate:** Escalations that prevented ER visits
- **Same-day response rate:** % of high-urgency escalations addressed same day

## Platform Implementation

**Triage line integration:** Phone system routing, call logging

**Health checks:** Performed by fGs; flagged answers auto-create escalation queue items

**Escalation queue:** Filterable view for Triage RNs

**Integration:**
- **Scheduling:** Create urgent appointments
- **EMR:** Escalation visit notes
- **Notifications:** Slack/messaging to clinicians

---

**Key Takeaway**: Escalations provide a safety net for individuals between scheduled visits, preventing crises and ER visits through timely clinical support.
