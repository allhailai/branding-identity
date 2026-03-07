# Assignment & Reassignment Workflow

**How Individuals Get Assigned to firsthand Guides**

## Overview

The **Assignment workflow** manages how newly enrolled individuals (or individuals needing reassignment) are distributed to firsthand Guides based on capacity, risk mix, and pod structure.

**Primary owner:** Manager of Community Operations (MCO)

## New Assignment Process

### Step 1: Member Selection File Received

**Source:** Data Operations receives outreach wave file from health plan

**Contents:**
- List of newly enrolled members to be served
- Demographics and basic info
- Risk stratification
- Geographic location (address)

**Action:** File imported into platform, creates individuals with status = `isj_engage`

### Step 2: Assignment Queue Available

**View:** "List of New Individuals Needing Assignments Available by Pod / Office"

**Filters:**
- Office/pod
- Risk level
- Already assigned vs unassigned
- Can multi-select and bulk edit

**MCO reviews list:**
- Check for any data errors (wrong pod, incorrect risk level, etc.)
- Edit if needed
- Confirm list is ready for assignment

### Step 3: Capacity Analysis

**MCO reviews:**
- **fG current panels:** How many individuals assigned to each fG
- **Risk mix:** Balance of high-risk vs low-risk per fG
- **Pod capacity:** Total capacity for the pod
- **fG availability:** Any fGs on leave, new hires ramping up, etc.

**Considerations:**
- High-risk individuals need more time → smaller panel size
- New fGs may start with smaller panels
- Even distribution across team
- Geographic proximity (same neighborhood/area)

### Step 4: Bulk or Individual Assignment

**MCO assigns:**
- Can select multiple individuals and bulk assign to one fG
- Or assign one-by-one if need specific matching
- System creates/updates ISJ workflow with assigned fG
- Status remains `isj_engage`

**System notifies:**
- fG receives notification of new assignment(s)
- Tasks created for fG: "Schedule Engagement Visit"

### Step 5: Queue Empty

**Success:** All new individuals assigned, queue cleared

**MCO confirms:** Ready for fGs to begin outreach

## Reassignment Process

### When Reassignment Needed

**Reasons:**
- fG leaves organization (resignation, termination)
- fG on extended leave (medical, family)
- Individual requests different fG (personality mismatch, language, gender preference)
- Capacity rebalancing (one fG overloaded, another underutilized)
- Pod restructuring

### Step 1: Reassignment Queue Available

**View:** "List of Individuals Needing Re-assignment"

**Filters:**
- Reason for reassignment
- Current fG (if leaving/on leave)
- Office/pod
- Service level (high/low risk)

### Step 2: MCO Review

Similar to new assignment:
- Review panels and capacity
- Identify target fG for reassignment
- Consider continuity (if temporary leave, plan for return)

### Step 3: Reassignment & Handoff

**If current fG available:**
- Current fG does warm handoff:
  - Call or visit with individual and new fG
  - Share key information and rapport
  - Individual meets new fG before transition
- Current fG documents handoff notes

**If current fG unavailable:**
- MCO provides new fG with summary
- New fG introduces self to individual
- Explain transition reason if appropriate

**System updates:**
- Workflow assigned fG changed
- Assignment period ended for old fG, new period started for new fG
- Tasks reassigned to new fG

### Step 4: Confirm Successful Transition

**New fG:**
- Makes contact within [X] days
- Confirms individual comfortable with transition
- Reports any concerns to MCO

## Platform Implementation

**Assignment management:**
- Likely a queue/view in platform with filters
- Bulk edit capabilities
- Assignment tracking in workflow

**Capacity dashboard:**
- Panel size per fG
- Risk mix visualization
- Pod total capacity

**Task implications:**
- Tasks assigned to specific fG
- On reassignment, tasks transfer to new fG
- History preserved in assignment periods

## Key Metrics

- **Time from file receipt to assignment complete:** Speed of onboarding
- **Panel size distribution:** Evenness of workload
- **Risk mix per fG:** Balance of complexity
- **Reassignment rate:** Frequency of needed reassignments
- **Engagement rate by fG:** Identifies high/low performers for coaching

---

**Key Takeaway**: Thoughtful assignment is critical for fG success and individual outcomes. MCOs must balance capacity, risk, and individual needs to set up both fGs and individuals for successful engagement.
