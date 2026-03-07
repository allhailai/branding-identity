# Medical Records Workflow

**Requesting and Retrieving Medical Records from Facilities**

## Overview

The **Medical Records workflow** manages the process of requesting, tracking, and uploading medical records from hospitals, clinics, and providers to support care coordination and clinical documentation.

**Primary owner:** Medical Records Specialists

**Triggered by:** Signed consents uploaded to Elation during Engagement workflow

**Purpose:** 
- Provide clinicians with historical medical information
- Support HCC coding and diagnosis validation
- Enable informed care planning

## Workflow Steps

### Step 1: Queue of Individuals Needing Records

**View:** "List of Individuals Requiring Medical Record Requests"

**Filters:**
- WPA scheduled or completed
- No medical records in Elation
- No facilities requested (or facilities closed without success)
- Can filter by office, pod, or individual

**Source:** Data Operations or automated system

### Step 2: Verify Consents

**Owner:** Medical Records Specialist

**Activities:**
- Verify signed ROI consents are in Elation
- Print consents to PDF for attachment to record requests
- If consents missing or expired, notify fG to obtain

### Step 3: Identify Facilities

**Owner:** Medical Records Specialist

**Activities:**
1. Access QuickSite (claims data sidecar tool)
2. Review individual's claims history
3. Identify all facilities with recent claims:
   - Hospitals (admissions in past 2-3 years)
   - Primary care providers
   - Specialists
   - Emergency departments
   - Behavioral health providers

4. For each facility, capture:
   - Facility name
   - NPI (National Provider Identifier)

### Step 4: Facility Contact Lookup

**Owner:** Medical Records Specialist

**Activities:**
- Google search facility by name and NPI
- Find medical records department phone/fax number
- Record contact information

### Step 5: Prepare Fax Request

**Owner:** Medical Records Specialist

**Activities:**

**Use MFax (faxing tool):**
- Search for facility in MFax
- If facility exists in system, add to request list
- If facility doesn't exist, add facility to MFax database, then add to request list

**Create request PDF:**
- Authorization to Release Medical Records (signed consent)
- Cover sheet listing:
  - Individual's name, DOB, identifying info
  - Date range of records requested
  - Specific records needed (all encounters, discharge summaries, labs, etc.)
  - Firsthand's fax number for return
- Add all facilities to one PDF (or multiple if too many facilities for one page)

### Step 6: Send Fax Request

**Owner:** Medical Records Specialist

**Activities:**
- Select all facilities in MFax
- Attach request PDF(s)
- Send fax batch
- MFax tracks confirmation of fax delivery

### Step 7: Document Request in Platform

**Owner:** Medical Records Specialist

**Activities:**
- In platform, for each facility:
  - Add facility by name (lookup)
  - Set status: "Requested"
  - Set request reason: "WPA preparation" or "CDI review" or "Ad-hoc clinician request"
  - Record request date

**Individual record now reflects:**
- All facilities requested from
- Status of each request
- Request date

### Step 8: Track and Follow Up

**Owner:** Medical Records Specialist

**Attempt protocol:**
- **Attempt 1:** Fax (day 1)
- **Attempt 2:** Fax (day 7 if no response)
- **Attempt 3:** Fax (day 14 if no response)

**Activities:**
- Monitor MFax for incoming faxes from facilities
- Check request queue regularly
- Make follow-up attempts per protocol
- Update status in platform:
  - "Requested" → "Received" (when records come in)
  - "Requested" → "No response" (after 3 attempts)
  - "Requested" → "Declined" (if facility refuses, e.g., no longer has records)

### Step 9: Receive and Upload Records

**Owner:** Medical Records Specialist

**Activities when records received:**
1. Download records from MFax
2. Verify correct individual (check name, DOB)
3. Upload to Elation:
   - Create document entry
   - Categorize (Hospital records, PCP notes, Labs, etc.)
   - Upload PDF
4. Update platform:
   - Set facility request status to "Received"
   - Record date received
5. Notify clinician if urgent/upcoming visit

### Step 10: Manage Ad-Hoc Requests

**Triggered by:** Clinicians request specific records during care

**Source:** Clinician creates ad-hoc request in Elation

**Queue:** Ad-hoc requests appear in Medical Records queue

**Process:** Same as above (identify facility, lookup, fax, track, upload)

## Key Metrics

- **Request completion rate:** % of facilities that provide records
- **Time to receipt:** Days from request to receipt
- **Records received before WPA:** % of individuals with records available when HG does assessment
- **Ad-hoc request turnaround:** Days from clinician request to records received

## Platform Implementation

Medical records is **not a separate workflow type**. It is implemented as **tasks on the ISJ workflow** — one task per patient-facility combination — assigned to a medical records queue.

### Data Model

**Task type:** `isj_medical_records_request` (on the ISJ workflow)

**Assignment:** Tasks are assigned to a `medical_records` queue, not to a specific user or team+role. Medical Records Specialists work from this queue.

**Backing table:** Each task has a corresponding row in `medical_records_requests` that stores per-facility state:
- Patient and facility contact references
- Attempt timestamps and who sent each fax (attempt 1, 2, 3 sent dates + sent_by user)
- Response data (received date, PDF file reference)
- Resolution status (received, no_response, declined)

This backing table is **updated in place** as the specialist works through attempts — it is not an append-only log like workflow blocks.

**Queue statuses:** The task's `queue_status_key` tracks where the facility request is in the attempt lifecycle:
- `needs_first_fax` → `awaiting_first_response` → `needs_second_fax` → `awaiting_second_response` → `needs_third_fax` → `awaiting_third_response` → `received` / `no_response` / `declined`

### How It Works

1. When consents are uploaded (during Engagement), the system identifies facilities from claims data and creates one ISJ task per facility, each assigned to the medical records queue
2. Medical Records Specialists grab tasks from the queue (lock-based)
3. For each task, the specialist prepares and sends a fax, updates the backing table with attempt date, and advances the queue status
4. The queue surfaces tasks needing follow-up based on queue status and time elapsed
5. When records are received, the specialist uploads the PDF, links it to the backing table, and completes the task

### Integration

- **Elation:** Consent retrieval, record upload, ad-hoc requests
- **QuickSite:** Claims data for facility identification
- **MFax:** External faxing tool

### Why Not a Separate Workflow?

Medical records doesn't have its own multi-phase lifecycle with distinct statuses and transition logic (like Benefits Support does). The work is per-facility, queue-driven, and repetitive. The ISJ task + queue status + backing table pattern provides per-facility state tracking without the overhead of a full workflow type, blocks, summaries, and status transitions.

---

**Key Takeaway**: Medical records are essential for informed care. This process is implemented as queue-based "super tasks" on the ISJ workflow, with a backing table tracking per-facility attempt state. Success depends on external facilities' responsiveness.
