# Frontend Onboarding: Building Modules

Welcome to the Firsthand platform frontend onboarding guide. This series teaches you how the frontend is structured by having you **build something real** — a working module that appears in the app's navigation, has its own pages, and follows every convention the team uses in production.

---

## Who This Is For

| Audience                    | What You'll Get                                                                  |
| --------------------------- | -------------------------------------------------------------------------------- |
| **New internal hires**      | A guided tour of every layer of the frontend architecture, grounded in real code |
| **SDK / client developers** | A clear mental model of how to extend the platform with your own modules         |

---

## The Learning Philosophy

> **Learning by doing beats reading about doing.**

Rather than explaining the architecture in the abstract, these guides walk you through building a **"Book Library" module** — a self-contained feature that manages a collection of books. It's simple enough to understand quickly, but rich enough to touch every real pattern:

- A list page with search and sorting
- A detail page for a single item
- A slide-in view panel (edit form)
- A Zustand UI store
- A data layer with query hooks and Zod schemas
- Registration in the app's module system so it appears in the nav

By the end, you'll have built something that looks and behaves exactly like `Contacts`, `Users`, or `Workflows` — because it uses the same architecture.

---

## Guide Structure

| File                                                               | What It Covers                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| [`01-module-anatomy.md`](./01-module-anatomy.md)                   | The six files every module is built from, and why each one exists         |
| [`02-tutorial-library-module.md`](./02-tutorial-library-module.md) | Step-by-step: build the Book Library module from scratch                  |
| [`03-data-layer.md`](./03-data-layer.md)                           | Zod schemas, query key factories, `useRequestQuery`, `useRequestMutation` |
| [`04-cheatsheet.md`](./04-cheatsheet.md)                           | Quick-reference patterns for the most common tasks                        |

---

## Prerequisites

Before starting, make sure you can run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

You should see the app at `http://localhost:5173`. You don't need a running backend for most of this guide — the module system, routing, and UI all work without API calls.

---

## The Module You'll Build

**Book Library** — a module that lets users browse and manage a collection of books.

```
/library                    ← List page: searchable table of books
/library/:id                ← Detail page: a single book's info
/library/:id/edit           ← Slide-in view: edit the book
```

It will appear in the sidebar navigation alongside Contacts, Users, and Workflows.

Start with [`01-module-anatomy.md`](./01-module-anatomy.md) →
