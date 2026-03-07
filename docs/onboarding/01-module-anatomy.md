# 01 — Module Anatomy

Every feature in the frontend is a **module**. A module is a self-contained directory under `frontend/src/apps/core/modules/` that owns its own pages, views, state, and data hooks. Modules are registered in the app config and the framework handles routing, navigation, and permissions automatically.

This document explains the six building blocks every module is made of, using the real `contacts` module as the reference.

---

## The Six Files

```
frontend/src/apps/core/modules/{module}/
├── {module}.module.config.tsx   ← 1. The manifest: pages, views, commands, permissions
├── {module}.store.ts            ← 2. Zustand UI state (search, selection, view mode)
├── pages/
│   └── {PageName}/
│       ├── {PageName}.tsx       ← 3. Presentational page component (render only)
│       └── use{PageName}Provider.ts  ← 4. All business logic for that page
└── views/
    └── {ViewName}.tsx           ← 5. Slide-in panel component (forms, detail)
    └── use{ViewName}Provider.ts ← 6. Business logic for the view (mutations, forms)
```

The data layer lives **outside** the module, in shared space:

```
frontend/src/apps/core/shared/data/{domain}/
├── {domain}.schema.ts           ← Zod types for the API response shapes
├── {domain}.api.ts              ← Query and mutation hooks
└── index.ts                     ← Re-exports
```

---

## 1. The Module Config (`{module}.module.config.tsx`)

**What it is:** The single source of truth for everything the framework needs to know about your module — its URL path, its icon, which pages it has, which views those pages can open, and what permissions gate access.

**Why it exists:** The app shell reads this config to build the sidebar navigation, register routes, and wire up the command palette. You never write a route manually.

**Key concepts:**

### IDs are compound strings

Every page and view gets a unique string ID built by concatenating the module ID, page ID, and view ID with dots:

```typescript
// From contacts.module.config.tsx
const CORE_CONTACTS = "core-contacts";

export const CONTACTS_LIST_PAGE_ID = `${CORE_CONTACTS}.contacts-list`;
// → 'core-contacts.contacts-list'

export const DETAIL_EDIT_CONTACT_VIEW_ID = `${CORE_CONTACTS}.contact-detail.edit-contact-view`;
// → 'core-contacts.contact-detail.edit-contact-view'
```

These IDs are used everywhere: to navigate programmatically, to scope command palette commands to a specific page, and to identify which view is open in the URL.

### Pages are lazy-loaded

```typescript
const ContactListPage = lazy(() =>
  import("./pages/ContactListPage/ContactListPage").then((m) => ({
    default: m.ContactListPage,
  })),
);
```

This keeps the initial bundle small. The page component is only downloaded when the user first navigates to it.

### Views are slide-in panels

A `view` is a panel that opens alongside a page — typically a form or detail drawer. Views have a `slot` (`'right'`) and a `path` that appends to the page URL:

```typescript
{
  id: DETAIL_EDIT_CONTACT_VIEW_ID,
  component: EditContactView,
  slot: 'right',
  path: '/edit',   // URL becomes /contacts/:id/edit when open
}
```

### Permissions are declarative

```typescript
permission: { asset: 'contacts', action: 'read' }
```

The framework checks this before rendering the page or showing the nav item. You never write `if (hasPermission(...))` in your page component.

### Commands are global actions

Commands appear in the command palette (⌘K). They can be scoped to a specific page context:

```typescript
{
  id: 'contacts:add-comment',
  contexts: ['page:contact-detail'],  // Only visible on the contact detail page
  action: { type: 'component', component: AddContactCommentCommandForm },
}
```

---

## 2. The UI Store (`{module}.store.ts`)

**What it is:** A [Zustand](https://zustand.pmnd.rs/) store that holds UI-only state for the module — things like the current search query, which row is selected, sort order, and view mode preference.

**Why it exists:** UI state that needs to survive navigation (e.g., the user searched for "Smith", clicked into a contact, then hit back) should not live in component `useState`. The store persists it. It also decouples the page component from the provider hook — both can read from the store independently.

**The pattern:**

```typescript
// contacts.store.ts (simplified)
export const useContactsUIStore = create<ContactsUIState>()(
  devtools(
    // ← Redux DevTools support
    persist(
      // ← localStorage persistence
      (set) => ({
        searchQuery: "",
        viewMode: "list",

        setSearchQuery: (query) => set({ searchQuery: query }),
        setViewMode: (mode) => set({ viewMode: mode }),
      }),
      {
        name: "contacts-ui-store",
        // Only persist user preferences, not transient state
        partialize: (state) => ({
          viewMode: state.viewMode,
          columnVisibility: state.columnVisibility,
        }),
      },
    ),
    { name: "ContactsUIStore" },
  ),
);
```

**Rules:**

- Only UI state lives here — never server data (that's TanStack Query's job)
- Use `partialize` to choose what gets persisted to localStorage
- Always use individual selectors (`s => s.searchQuery`) not object selectors (`s => ({ searchQuery: s.searchQuery })`) — object selectors create new references on every render and cause infinite loops

---

## 3. The Page Component (`{PageName}.tsx`)

**What it is:** A purely presentational React component. It renders the UI. It does not fetch data, does not contain business logic, and does not call mutations directly.

**Why it exists:** Separating rendering from logic makes both easier to test and reason about. The page component is a "dumb" view of the state provided by its provider hook.

**The pattern:**

```typescript
// ContactListPage.tsx (simplified)
export function ContactListPage() {
  // ✅ All logic comes from the provider
  const { contacts, searchQuery, handleContactClick, debouncedSetSearch } =
    useContactListProvider();

  // ✅ UI preferences come directly from the store
  const viewMode = useContactsUIStore(s => s.viewMode);

  return (
    <Container>
      <DataList
        data={contacts}
        searchValue={searchQuery}
        onSearchChange={debouncedSetSearch}
        onRowClick={row => handleContactClick(row.id.toString())}
      />
      <Outlet />  {/* ← Views render here */}
    </Container>
  );
}
```

**Rules:**

- No `useQuery`, `useMutation`, or `fetch` calls in the page component
- No business logic — event handlers come from the provider
- Always render `<Outlet />` so views can open alongside the page

---

## 4. The Page Provider Hook (`use{PageName}Provider.ts`)

**What it is:** A custom hook that owns all the business logic for a page. It fetches data, derives computed values, and returns event handlers.

**Why it exists:** Keeping logic in a hook makes it independently testable and keeps the page component clean. The hook is the "brain" of the page.

**The pattern:**

```typescript
// useContactListProvider.ts (simplified)
export const useContactListProvider = () => {
  // ── DATA ──────────────────────────────────────────────────────────────────
  const { navigateView, navigatePage } = useUnifiedURLState();
  const searchQuery = useContactsUIStore((s) => s.searchQuery);

  const { data: contactsData, state: contactsState } = useContactsQuery({
    search: searchQuery,
  });

  // ── BUSINESS LOGIC ────────────────────────────────────────────────────────
  const handleContactClick = useCallback(
    (contactId: string) => {
      navigatePage(CONTACT_DETAIL_PAGE_ID, { params: { id: contactId } });
    },
    [navigatePage],
  );

  // ── DERIVED STATE ─────────────────────────────────────────────────────────
  const contacts = useMemo(() => contactsData?.data ?? [], [contactsData]);

  // ── RETURN ────────────────────────────────────────────────────────────────
  return { contacts, contactsState, handleContactClick, searchQuery };
};
```

**Rules:**

- Organize with `// ── DATA`, `// ── BUSINESS LOGIC`, `// ── DERIVED STATE`, `// ── RETURN` sections
- Return only what the page component needs — don't leak internal state
- Navigation uses `useUnifiedURLState` — never `useNavigate` directly

---

## 5. The View Component (`{ViewName}.tsx`)

**What it is:** A slide-in panel component. Views are typically forms (create/edit) or secondary detail displays. They open alongside a page without replacing it.

**Why it exists:** The panel pattern lets users edit data without losing their place in the list. The URL changes when a view opens (`/contacts/123/edit`), so the state is shareable and bookmarkable.

**The pattern:**

```typescript
// EditContactView.tsx (simplified)
export function EditContactView() {
  const { form, contact, handleSubmit, handleClose, isLoading } =
    useEditContactProvider();

  return (
    <ViewPanel title="Edit Contact" onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
        <Button type="submit" loading={isLoading}>Save</Button>
      </form>
    </ViewPanel>
  );
}
```

---

## 6. The View Provider Hook (`use{ViewName}Provider.ts`)

**What it is:** The business logic hook for a view. It typically manages a form (using TanStack Form), calls mutations, and handles close/success navigation.

**Why it exists:** Same reason as the page provider — keeps the view component purely presentational.

**The pattern:**

```typescript
// useEditContactProvider.ts (simplified)
export const useEditContactProvider = () => {
  const { closeView } = useUnifiedURLState();
  const contactId = useSearchParam("id");

  const { data: contact } = useContactQuery(contactId);
  const { mutateAsync: updateContact, isPending } =
    useUpdateContactMutation(contactId);

  const handleSubmit = async (values: ContactUpdateInput) => {
    await updateContact(values);
    closeView();
  };

  return {
    contact,
    handleSubmit,
    handleClose: closeView,
    isLoading: isPending,
  };
};
```

---

## How It All Fits Together

```
App Config
  └── registers modules[]
        └── Module Config
              ├── pages[]
              │     ├── Page Component  ←→  Page Provider Hook
              │     │                           ├── useRequestQuery (data)
              │     │                           ├── Store (UI state)
              │     │                           └── useUnifiedURLState (navigation)
              │     └── views[]
              │           ├── View Component  ←→  View Provider Hook
              │           │                           ├── useRequestMutation
              │           │                           └── TanStack Form
              └── commands[]
```

---

## Next Step

Now that you understand the anatomy, let's build one from scratch.

→ Continue to [`02-tutorial-library-module.md`](./02-tutorial-library-module.md)
