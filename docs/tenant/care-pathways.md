# Care Pathways

**Tailored Interventions for Specific Needs**

## What are Care Pathways?

**Care Pathways** are structured intervention sequences designed to address specific clinical or social needs identified during an individual's journey. They represent Firsthand's "not one size fits all" approach to care.

**Key principle:** Rather than applying the same interventions to everyone, identify which pathways an individual needs and tailor the care accordingly.

## How Pathways Work

### Identification
Individual identified as potentially eligible for pathway based on:
- Screening during Welcome Session or WPA
- Claims data (e.g., substance use diagnosis, lack of medication fills)
- Care team observation
- Self-report

### Enrollment
- Custom questions during Welcome Session (fG) and WPA (HG) to confirm need
- Care team discusses in IPR and decides to enroll in pathway
- Individual informed and agrees to participate

### Intervention Sequence
Each pathway has a defined set of interventions:
- Specific assessments
- Scheduled visits or calls
- Referrals to specialists or programs
- Care team tasks
- Follow-up timeline

### Monitoring
- **Pathway Panel Dashboard:** Program management view to monitor progress of all individuals on a pathway
- Track completion of pathway steps
- Identify individuals not progressing as expected

### Completion or Exit
- Pathway goals achieved → Pathway complete, continue general care coordination
- Pathway not appropriate after all → Exit pathway
- Individual declines continued participation → Exit pathway

## Established Pathway: Benefits Support (SOAR)

**Full documentation:** [Benefits Support (SOAR) Workflow](./workflows/benefits-support.md)

**Goal:** Secure SSI/SSDI benefits for eligible individuals with disabilities.

**Eligibility screening:** NME (New Member Eligibility) assessment during Welcome Session

**Key interventions:**
1. Medical eligibility assessment
2. SOAR visit (psychiatric evaluation by Psych NP)
3. Medical determination by SOAR Specialist
4. Application preparation calls (2 sessions)
5. SSA application submission
6. Follow-up and appeals if needed

**Success metric:** Application approval rate

## Pathways in Development

### Medication Support

**Goal:** Improve medication adherence for chronic conditions.

**Target population:**
- Low fill rates on Surescripts data
- Self-reported non-adherence
- Uncontrolled chronic conditions despite treatment

**Potential interventions:**
- Medication education
- Pill box setup and reminder systems
- Pharmacy coordination
- Address barriers (cost, side effects, beliefs)
- Behavioral techniques for habit formation
- Regular medication reviews with HG

**Success metric:** % with improved fill rates (e.g., PDC - Proportion of Days Covered)

### Substance Use Disorder (SUD)

**Goal:** Support recovery and reduce substance use-related harms.

**Target population:**
- Active substance use identified
- History of SUD with relapse risk
- Interested in recovery support

**Potential interventions:**
- Screening and assessment (AUDIT, DAST, etc.)
- Motivational interviewing
- Referral to SUD treatment programs
- Medication-assisted treatment (MAT) coordination
- Peer support connection
- Harm reduction education
- Regular sobriety check-ins
- Relapse prevention planning

**Success metric:** % enrolled in treatment, % achieving recovery milestones

### Suicidal Ideation Support

**Goal:** Safety planning and suicide prevention.

**Target population:**
- Active or recent suicidal ideation
- History of suicide attempts
- High-risk behavioral health diagnoses

**Potential interventions:**
- Safety assessment and planning
- Increased touch frequency (daily or every other day)
- Lethal means counseling
- Crisis line education and warm transfer
- Behavioral health treatment intensification
- Psych NP medication management
- Family/support network engagement
- Follow-up after any crisis events

**Success metric:** % enrolled in appropriate behavioral health care, reduction in attempts

### SDOH Support

**Goal:** Address social determinants of health barriers.

**Target population:**
- Housing instability or homelessness
- Food insecurity
- Transportation barriers
- Unemployment
- Legal issues
- Social isolation

**Potential interventions:**
- Comprehensive SDOH assessment
- Connection to community resources
- Housing application support
- SNAP/food bank enrollment
- Transportation vouchers or coordination
- Employment services referral
- Legal aid referral
- Social activity facilitation

**Success metric:** % with stabilized housing, % with food security, % employed

## Pathway Framework Benefits

**For individuals:**
- Targeted interventions addressing their specific needs
- Clear expectations and timeline
- Focused support from specialists

**For care team:**
- Structured approach vs ad-hoc problem-solving
- Clear roles and handoffs
- Progress tracking and accountability

**For organization:**
- Scalable and replicable interventions
- Measurable outcomes by pathway
- Resource allocation optimization
- Quality improvement via pathway refinement

## Platform Implementation

**Current state:**
- Benefits Support (SOAR) is implemented via workflow and tasks
- Other pathways in design phase

**Future state:**
- Pathway enrollment flagged on individual record
- Custom forms and assessments per pathway
- Automated task generation based on pathway steps
- Pathway-specific dashboards and reporting

**Code location:**
- SOAR/BenSupp implementation: `apps/fh/lib/fh/bensup/`
- Future pathway logic: TBD in `apps/fh/lib/fh/<pathway_name>/`

## Integration with ISJ

Pathways typically occur **during Stabilize phase** of ISJ, though some (like Benefits Support) may start in Activate.

**Pathway does not replace ISJ.** Individual has:
- One ISJ workflow (overall journey)
- Zero or more active Care Pathway enrollments (specific interventions)

Both progress in parallel, with pathway milestones contributing to overall stabilization.

---

**Key Takeaway**: Care Pathways enable Firsthand to provide tailored, evidence-based interventions for common needs within their population, moving beyond "one size fits all" care coordination to targeted support that improves outcomes.
