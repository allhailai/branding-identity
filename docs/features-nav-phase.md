# Machina — Features Left-Nav Phase Plan

**Status:** Planning
**Phase:** Post Executive Summary
**Target Route:** `/overview/` — new standalone endpoint with persistent left-nav shell

> ⚠️ **Language Constraint:** This project uses **plain JavaScript only**. No TypeScript. No `.ts` files. All JavaScript files use the `.js` extension. Type hints are documented via JSDoc comments where needed.


---

## Overview

This phase introduces a persistent **left-hand navigation shell** that serves as the primary product exploration interface. Visitors can navigate between the Executive Summary and a deep-dive **Features** section. The Features section uses a collapsible left nav to expose individual product modules, each rendering a dedicated detail view in the main content area.

---

## Site Architecture Change

### Current Structure
```
/executive-summary/   ← single scroll-driven page
```

### Proposed Structure
```
/executive-summary/         ← existing scroll-driven briefing (unchanged)
/overview/                  ← NEW: two-column shell with persistent left-nav
  └── executive-summary     ← executive summary view inside the shell
  └── features/[slug]       ← individual feature detail views
```

The `/overview/` route is the new primary shell. It does **not** replace `/executive-summary/` — both routes coexist. The left nav appears **only** on `/overview/` routes, not on the main marketing site (`/`).

The `/overview/` shell uses a **two-column layout**:
- **Left column (280px fixed):** Persistent navigation sidebar
- **Right column (flex-grow):** Content panel (executive summary or feature detail)

---

## Left Navigation Structure

```
┌─────────────────────────────┐
│  [Machina logo]             │
├─────────────────────────────┤
│  Executive Summary          │  ← links to /overview/executive-summary
│  ▼ Features                 │  ← collapsible section (expanded by default)
│                             │
│  — AI-Native Features —     │  ← section divider label
│    · Omni Channel Comms     │  ← AI badge
│    · Agentic Patient Profile│  ← AI badge
│    · Agentic Task Completion│  ← AI badge + Coming Soon
│    · Agentic Queue Mgmt     │  ← AI badge
│                             │
│  — Platform Features —      │  ← section divider label
│    · Workflows              │
│    · Tasks                  │
│    · Queues                 │
│    · Workspace              │
│    · CRM                    │
│    · Scheduling             │
│    · ACD Module             │
└─────────────────────────────┘
```

### Nav Items — Full Specification (Ordered: AI-Native First)

| Nav Label | Slug | Type | Status |
|---|---|---|---|
| Executive Summary | `executive-summary` | — | Existing content |
| **Features** *(collapsible parent)* | — | — | New |
| **— AI-Native Features —** | *(divider)* | — | — |
| Omni Channel Communications | `omni-channel` | 🤖 AI-Native | New |
| Agentic Patient Profile | `patient-profile` | 🤖 AI-Native | New |
| Agentic Task Completion | `agentic-tasks` | 🤖 AI-Native | New / Coming Soon badge |
| Agentic Queue Management & Task Completion | `agentic-queues` | 🤖 AI-Native | New |
| **— Platform Features —** | *(divider)* | — | — |
| Workflows | `workflows` | Platform | New |
| Tasks | `tasks` | Platform | New |
| Queues | `queues` | Platform | New |
| Workspace | `workspace` | Platform | New |
| CRM | `crm` | Platform | New |
| Scheduling — Maps & Appointments | `scheduling` | Platform | New |
| ACD Module (Appropriate Coding) | `acd-module` | Platform | New |

---

## Feature Detail View — Per-Item Layout

Each feature nav item loads a **detail panel** in the right content area. The panel follows a consistent three-zone layout:

```
┌──────────────────────────────────────────────────────┐
│  ZONE 1 — Feature Header                             │
│  ─────────────────────────────────────────────────── │
│  [Feature Name]                                      │
│  [Brief description — 2–3 sentences]                 │
├──────────────────────────────────────────────────────┤
│  ZONE 2 — Screenshot                                 │
│  ─────────────────────────────────────────────────── │
│  [ SCREENSHOT PLACEHOLDER ]                          │
│  Caption: "Machina — [Feature Name] interface"       │
├──────────────────────────────────────────────────────┤
│  ZONE 3 — Demo Video                                 │
│  ─────────────────────────────────────────────────── │
│  [ VIDEO EMBED PLACEHOLDER ]                         │
│  Caption: "See [Feature Name] in action"             │
└──────────────────────────────────────────────────────┘
```

---

## Feature Content — Names & Descriptions

> **Visual distinction:** AI-Native features render with a teal `🤖 AI-NATIVE` badge in the detail view header. Platform features render with no badge. "Coming Soon" features additionally render a gold `COMING SOON` pill.

### AI-Native Features

### 1. Omni Channel Communications w/ Agentic Interactions
**Slug:** `omni-channel`  
**Description:** Machina unifies SMS, telephony, and video into a single communication layer — with AI agents that can initiate, route, and resolve patient interactions autonomously. Every channel is logged, contextualized, and actionable without manual intervention.

**Screenshot:** `[ PLACEHOLDER — omni-channel-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — omni-channel-demo.mp4 ]`

---

### 2. Agentic Patient Profile
**Slug:** `patient-profile`  
**Description:** A living, AI-maintained patient record that aggregates clinical history, communication preferences, care gaps, and risk signals in real time. Agents continuously update and act on the profile — no manual data entry required.

**Screenshot:** `[ PLACEHOLDER — patient-profile-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — patient-profile-demo.mp4 ]`

---

### 3. Agentic Task Completion *(Future)*
**Slug:** `agentic-tasks`  
**Status Badge:** `Coming Soon`  
**Description:** The next evolution of the Tasks module — AI agents that don't just surface tasks but complete them end-to-end. From outreach to documentation to follow-up, agents close the loop without human handoff.

**Screenshot:** `[ PLACEHOLDER — agentic-tasks-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — agentic-tasks-demo.mp4 ]`

---

### Platform Features

### 6. Workflows
**Slug:** `workflows`
**Description:** Visual, configurable care workflows that orchestrate multi-step patient journeys across teams, channels, and time. Machina executes workflow steps autonomously, escalating to humans only when judgment is required.

**Screenshot:** `[ PLACEHOLDER — workflows-screenshot.png ]`
**Video:** `[ PLACEHOLDER — workflows-demo.mp4 ]`

---

### 7. Tasks
**Slug:** `tasks`
**Description:** A structured task layer that captures every action item generated by agents, workflows, or staff — with priority scoring, assignment logic, and completion tracking built in. Nothing falls through the cracks.

**Screenshot:** `[ PLACEHOLDER — tasks-screenshot.png ]`
**Video:** `[ PLACEHOLDER — tasks-demo.mp4 ]`

---

### 8. Queues
**Slug:** `queues`  
**Description:** Intelligent work queues that organize patient interactions, care gaps, and staff assignments by priority, acuity, and capacity. Machina ensures the right work reaches the right person at the right time.

**Screenshot:** `[ PLACEHOLDER — queues-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — queues-demo.mp4 ]`

---

### 4. Agentic Queue Management & Task Completion
**Slug:** `agentic-queues`  
**Description:** AI agents that actively manage queue load — triaging, reassigning, and completing tasks within queues without waiting for human direction. Queue depth shrinks automatically as agents work in parallel.

**Screenshot:** `[ PLACEHOLDER — agentic-queues-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — agentic-queues-demo.mp4 ]`

---

### 9. Workspace
**Slug:** `workspace`  
**Description:** The unified operator interface where staff, supervisors, and agents share a single working environment. Workspace surfaces the right context, tools, and actions for each role — eliminating tab-switching and context loss.

**Screenshot:** `[ PLACEHOLDER — workspace-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — workspace-demo.mp4 ]`

---

### 10. CRM
**Slug:** `crm`  
**Description:** A healthcare-native CRM that tracks every patient relationship, interaction history, and engagement signal. Machina's CRM is agent-aware — records update automatically as agents act, keeping data current without manual effort.

**Screenshot:** `[ PLACEHOLDER — crm-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — crm-demo.mp4 ]`

---

### 11. Scheduling — Maps & Appointments
**Slug:** `scheduling`  
**Description:** Intelligent scheduling that combines geographic mapping with appointment management — optimizing visit routes, reducing no-shows, and enabling agents to book, reschedule, and confirm appointments autonomously.

**Screenshot:** `[ PLACEHOLDER — scheduling-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — scheduling-demo.mp4 ]`

---

### 12. ACD Module (Appropriate Coding)
**Slug:** `acd-module`  
**Description:** An AI-powered appropriate coding module that surfaces risk-adjusted coding opportunities in real time — ensuring accurate HCC capture, closing coding gaps, and maximizing compliant revenue without additional staff burden.

**Screenshot:** `[ PLACEHOLDER — acd-module-screenshot.png ]`  
**Video:** `[ PLACEHOLDER — acd-module-demo.mp4 ]`

---

## Component Architecture

### New Files to Create

```
src/
├── layouts/
│   └── OverviewLayout.astro              ← two-column shell (left-nav + content panel)
├── pages/
│   └── overview/
│       ├── index.astro                   ← default landing (redirects to executive-summary)
│       ├── executive-summary.astro       ← executive summary view inside the shell
│       └── features/
│           └── [slug].astro              ← dynamic route for all 11 feature detail views
├── components/
│   └── overview/
│       ├── OverviewNav.astro             ← left sidebar nav with collapsible Features group
│       ├── FeatureDetail.astro           ← reusable detail panel (name, desc, screenshot, video)
│       └── feature-data.js              ← plain JS array of all 11 features (slug, name, desc, assets)
```

### Data Shape — `feature-data.js`

```js
/** @type {Array<{slug: string, name: string, badge: string|null, description: string, screenshot: string|null, video: string|null}>} */
export const features = [
  {
    slug: 'omni-channel',
    name: 'Omni Channel Communications',
    badge: null,
    description: '...',
    screenshot: null,
    video: null,
  },
  // ... 10 more entries
];
```

### Rendering Strategy Options

| Option | Approach | Pros | Cons |
|---|---|---|---|
| **A — Static pages** | One `.astro` file per feature in `src/pages/features/` | Simple, no JS routing | 11 files to maintain |
| **B — Dynamic route** | `src/pages/features/[slug].astro` with `getStaticPaths()` | Single template, data-driven | Requires `feature-data.js` |
| **C — Client-side SPA** | Single page, JS swaps content panel on nav click | Instant transitions, no page reload | More JS, harder to deep-link |

**Recommendation: Option B (Dynamic Route)**
Use `[slug].astro` with `getStaticPaths()` pulling from `feature-data.js`. This keeps the template DRY, enables deep-linking to any feature, and fits Astro's static generation model cleanly.

---

## Design System — Left Nav

Inherits the Executive color system from [`ExecutiveLayout.astro`](src/layouts/ExecutiveLayout.astro):

```css
/* Left nav sidebar */
--nav-width: 280px;
--nav-bg: var(--navy-mid);          /* #121F36 */
--nav-border: rgba(255,255,255,0.06);
--nav-item-active-bg: rgba(240,180,41,0.08);
--nav-item-active-border: var(--gold);
--nav-item-hover-bg: rgba(255,255,255,0.04);

/* Content panel */
--content-bg: var(--navy);          /* #0A1628 */
--content-max-width: 860px;
```

### Nav Interaction States

| State | Visual Treatment |
|---|---|
| Default | Muted white text, no background |
| Hover | Subtle white background tint |
| Active | Gold left border (3px), gold text, faint gold background |
| Future badge | Teal pill label `COMING SOON` inline |
| Collapsed parent | Chevron rotates 0° |
| Expanded parent | Chevron rotates 90° |

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `> 1024px` | Left nav visible, fixed sidebar |
| `768px – 1024px` | Left nav collapses to icon-only or hamburger toggle |
| `< 768px` | Left nav hidden, accessible via slide-in drawer |

---

## Implementation Sequence

1. **Create `feature-data.js`** — define all 11 features with placeholder asset paths (plain JS, no TypeScript)
2. **Create `OverviewLayout.astro`** — two-column shell, inherits Executive CSS variables
3. **Create `OverviewNav.astro`** — left sidebar with AI-Native / Platform section dividers, collapsible Features group, active state tracking
4. **Create `overview/executive-summary.astro`** — executive summary content rendered inside the shell
5. **Create `overview/features/[slug].astro`** — dynamic route using `getStaticPaths()`, renders `FeatureDetail`
6. **Create `FeatureDetail.astro`** — three-zone layout (header + AI-Native badge, screenshot placeholder, video placeholder)
7. **Wire `overview/index.astro`** — redirect to `executive-summary` as default landing
8. **Add "Explore Platform →" link in `ExecNav.astro`** — points to `/overview/`
9. **Add per-feature links in `ExecPlatform.astro`** — each platform card links to its `/overview/features/[slug]`

---

## Resolved Decisions

| Question | Decision |
|---|---|
| Standalone page or tab within `/executive-summary/`? | **New `/overview/` endpoint** — standalone shell with left-nav containing both Executive Summary and Features |
| Left nav on main marketing site (`/`)? | **No** — left nav appears only on `/overview/` routes |
| Video embed format? | **Arcade** (preferred) or **Loom** (acceptable). See recommendation below. |
| AI-native features visually distinguished? | **Yes** — teal `🤖 AI-NATIVE` badge in detail view header; section dividers in left nav |
| Feature list order? | **AI-Native features first**, then Platform features |

### Video Embed Recommendation: Arcade over Loom

| | Loom | Arcade |
|---|---|---|
| **Format** | Passive screen recording | Interactive click-through product tour |
| **Viewer experience** | Watch only | Click through the demo themselves |
| **Embed quality** | Standard video player | Polished branded product tour widget |
| **Best for** | Internal walkthroughs | Marketing/sales product showcases |
| **Audience fit** | General | MCO CEOs and VC partners evaluating a product |

**Recommendation:** Use **Arcade** for the final embeds — interactive demos are significantly more compelling for executive buyers than passive video. **Practical path:** start with Loom placeholders during build, migrate to Arcade once demos are polished.

## Open Questions

- [ ] What is the default landing view inside `/overview/` — Executive Summary or first feature (`omni-channel`)?

---

*Document created: 2026-03-03 | Author: Architect mode | Next action: Implementation in Code mode*
