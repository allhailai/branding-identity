# 04 — Quick Reference Cheatsheet

A single-page reference for the most common patterns. Bookmark this.

---

## New Module Checklist

When building a new module, create files in this order:

```
□ 1. Add module ID to module-ids.ts
□ 2. Create shared/data/{domain}/
│      {domain}.schema.ts      (Zod types)
│      {domain}.api.ts         (query keys + hooks)
│      index.ts                (re-exports)
□ 3. Create modules/{module}/
│      {module}.store.ts       (Zustand UI state)
│      {module}.module.config.tsx  (pages, views, nav)
│      pages/{PageName}/
│        {PageName}.tsx            (render only)
│        use{PageName}Provider.ts  (all logic)
│      views/{ViewName}/
│        {ViewName}.tsx            (render only)
│        use{ViewName}Provider.ts  (mutations, forms)
□ 4. Register in modules/index.ts
```

---

## Module Config Skeleton

```typescript
// {module}.module.config.tsx
import { SomeIcon } from "lucide-react";
import { lazy } from "react";
import { MODULE_IDS } from "@/apps/core/config/constants/module-ids";
import type { ModuleConfig } from "@/apps/core/types/module.types";
import { MyEditView } from "./views/MyEditView/MyEditView";

const MyListPage = lazy(() =>
  import("./pages/MyListPage/MyListPage").then((m) => ({
    default: m.MyListPage,
  })),
);

const { CORE_MY_MODULE } = MODULE_IDS;

// Export IDs so provider hooks can navigate
export const MY_LIST_PAGE_ID = `${CORE_MY_MODULE}.my-list`;
export const MY_DETAIL_PAGE_ID = `${CORE_MY_MODULE}.my-detail`;
export const LIST_EDIT_VIEW_ID = `${CORE_MY_MODULE}.my-list.edit-view`;

export const myModuleConfig: ModuleConfig = {
  id: CORE_MY_MODULE,
  name: "My Module",
  basePath: "/my-module",
  icon: SomeIcon,
  metadata: { source: CORE, description: "..." },
  pages: [
    {
      id: MY_LIST_PAGE_ID,
      component: MyListPage,
      isDefaultPage: true,
      isNav: true,
      views: [
        {
          id: LIST_EDIT_VIEW_ID,
          name: "Edit",
          icon: SomeIcon,
          component: MyEditView,
          slot: "right",
          path: "/edit",
        },
      ],
    },
  ],
};
```

---

## Zustand Store Skeleton

```typescript
// {module}.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface MyUIState {
  searchQuery: string;
  viewMode: "list" | "grid";
  setSearchQuery: (q: string) => void;
  setViewMode: (m: "list" | "grid") => void;
}

const initialState = { searchQuery: "", viewMode: "list" as const };

export const useMyUIStore = create<MyUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSearchQuery: (q) => set({ searchQuery: q }),
        setViewMode: (m) => set({ viewMode: m }),
      }),
      {
        name: "my-module-store",
        partialize: (state) => ({ viewMode: state.viewMode }), // persist prefs only
      },
    ),
    { name: "MyModuleStore" },
  ),
);

// Named selectors — use these in components to avoid inline arrow functions
export const selectSearchQuery = (s: MyUIState) => s.searchQuery;
export const selectViewMode = (s: MyUIState) => s.viewMode;
```

**Store rules:**

- ✅ Use individual selectors: `useMyUIStore(s => s.searchQuery)`
- ❌ Never object selectors: `useMyUIStore(s => ({ searchQuery: s.searchQuery }))` → infinite loop
- ✅ `partialize` only persists user preferences (view mode, column visibility)
- ❌ Never store server data in Zustand — that's TanStack Query's job

---

## Page Provider Skeleton

```typescript
// use{PageName}Provider.ts
import { useCallback, useMemo, useState, useEffect } from "react";
import { useMyQuery } from "@/apps/core/shared/data/my-domain";
import { useUnifiedURLState } from "@/apps/core/shared/hooks/useUnifiedURLState";
import {
  MY_DETAIL_PAGE_ID,
  LIST_EDIT_VIEW_ID,
} from "../../my-module.module.config";
import { useMyUIStore } from "../../my-module.store";

export const useMyListProvider = () => {
  // ── DATA ──────────────────────────────────────────────────────────────────
  const { navigatePage, navigateView } = useUnifiedURLState();
  const searchQuery = useMyUIStore((s) => s.searchQuery);
  const setSearchQuery = useMyUIStore((s) => s.setSearchQuery);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const { data, state, refetch } = useMyQuery({ search: searchQuery });

  // ── BUSINESS LOGIC ────────────────────────────────────────────────────────
  const handleItemClick = useCallback(
    (id: string) => navigatePage(MY_DETAIL_PAGE_ID, { params: { id } }),
    [navigatePage],
  );

  const handleEdit = useCallback(
    (id: number) =>
      navigateView(LIST_EDIT_VIEW_ID, { searchParams: { id: String(id) } }),
    [navigateView],
  );

  const debouncedSetSearch = useMemo(() => {
    let t: NodeJS.Timeout;
    return (v: string) => {
      setSearchTerm(v);
      clearTimeout(t);
      t = setTimeout(() => setSearchQuery(v), 300);
    };
  }, [setSearchQuery]);

  // ── DERIVED STATE ─────────────────────────────────────────────────────────
  const items = useMemo(() => data?.data ?? [], [data]);

  // ── RETURN ────────────────────────────────────────────────────────────────
  return {
    items,
    state,
    refetch,
    searchQuery: searchTerm,
    handleItemClick,
    handleEdit,
    debouncedSetSearch,
  };
};
```

---

## Page Component Skeleton

```typescript
// {PageName}.tsx
import { Outlet } from '@tanstack/react-router';
import { Container, ContainerContent, ContainerHeader,
         DataList, Header } from '@/apps/core/shared/core-components/core-ui';
import { OperationStateDisplay } from '@/apps/core/shared/core-components/features/OperationState/OperationStateDisplay';
import { useMyUIStore, selectViewMode } from '../../my-module.store';
import { useMyListProvider } from './useMyListProvider';

export function MyListPage() {
  const { items, state, refetch, searchQuery,
          tableColumns, handleItemClick, debouncedSetSearch } = useMyListProvider();
  const viewMode = useMyUIStore(selectViewMode);
  const setViewMode = useMyUIStore(s => s.setViewMode);

  return (
    <OperationStateDisplay state={state} onRetry={refetch}>
      <Container>
        <ContainerHeader>
          <Header title="My Items" subtitle="Manage your items" />
        </ContainerHeader>
        <ContainerContent>
          <DataList
            columns={tableColumns}
            data={items}
            emptyMessage="No items found."
            onRowClick={row => handleItemClick(row.id.toString())}
            showToolbar showSearch stickyToolbar
            searchValue={searchQuery}
            onSearchChange={debouncedSetSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            enableSorting enablePagination pageSize={10}
          />
        </ContainerContent>
      </Container>
      <Outlet />  {/* ← Required: views render here */}
    </OperationStateDisplay>
  );
}
```

---

## View Provider Skeleton

```typescript
// use{ViewName}Provider.ts
import { useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  useMyItemQuery,
  useCreateMyItemMutation,
  useUpdateMyItemMutation,
} from "@/apps/core/shared/data/my-domain";
import { useUnifiedURLState } from "@/apps/core/shared/hooks/useUnifiedURLState";

export const useMyEditViewProvider = () => {
  const { closeView } = useUnifiedURLState();
  const { id } = useSearch({ strict: false }) as { id?: string };
  const isEditMode = !!id;

  const { data: item } = useMyItemQuery(isEditMode ? id : null);
  const { mutateAsync: create, isPending: isCreating } =
    useCreateMyItemMutation();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateMyItemMutation(id);

  const handleSubmit = useCallback(
    async (values: MyItemInput) => {
      if (isEditMode) {
        await update(values);
      } else {
        await create(values);
      }
      closeView();
    },
    [isEditMode, update, create, closeView],
  );

  return {
    item,
    isEditMode,
    isSaving: isCreating || isUpdating,
    handleSubmit,
    handleClose: closeView,
  };
};
```

---

## Data Layer Skeleton

```typescript
// {domain}.schema.ts
import { z } from "zod";

export const myItemListSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string().nullish(),
});

export const myItemDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string().nullish(),
  description: z.string().nullish(),
  inserted_at: z.string().nullish(),
});

export const myItemInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().trim(),
  description: z.string().trim(),
});

export type MyItemList = z.infer<typeof myItemListSchema>;
export type MyItemDetail = z.infer<typeof myItemDetailSchema>;
export type MyItemInput = z.infer<typeof myItemInputSchema>;
```

```typescript
// {domain}.api.ts
import { useQueryClient } from "@tanstack/react-query";
import { useRequestMutation, useRequestQuery } from "@/apps/core/app/data";
import { normalizeId, requireId } from "@/apps/core/shared/utils/normalize";
import type { MyItemDetail, MyItemInput, MyItemList } from "./my-domain.schema";

export const myItemKeys = {
  all: ["core", "my-items"] as const,
  lists: () => [...myItemKeys.all, "list"] as const,
  list: (f: Record<string, unknown>) =>
    [...myItemKeys.lists(), { filters: f }] as const,
  details: () => [...myItemKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...myItemKeys.details(), normalizeId(id)] as const,
};

const invalidate = async (
  qc: ReturnType<typeof useQueryClient>,
  id?: string | number,
) => {
  const nid = id ? normalizeId(id) : null;
  await Promise.all([
    qc.invalidateQueries({ queryKey: myItemKeys.lists() }),
    nid
      ? qc.invalidateQueries({ queryKey: myItemKeys.detail(nid) })
      : Promise.resolve(),
  ]);
};

export const useMyItemsQuery = (opts: { search?: string } = {}) =>
  useRequestQuery<MyItemList[], ReturnType<typeof myItemKeys.list>, true>({
    queryKey: myItemKeys.list(opts),
    url: "/my-items",
    params: opts.search ? { search: opts.search } : undefined,
    namespace: "api:my-items-list",
    includeMeta: true,
    transform: (d) => d || [],
    staleTime: 5 * 60 * 1000,
  });

export const useMyItemQuery = (id: string | number | null | undefined) => {
  const nid = normalizeId(id);
  return useRequestQuery<MyItemDetail>({
    queryKey: myItemKeys.detail(nid),
    url: `/my-items/${nid}`,
    namespace: "api:my-items-detail",
    enabled: !!nid,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMyItemMutation = () => {
  const qc = useQueryClient();
  return useRequestMutation<MyItemDetail, MyItemInput>({
    namespace: "api:my-items-create",
    method: "POST",
    url: "/my-items",
    wrapPayload: (p) => ({ my_item: p }),
    messages: { success: "Item created", error: "Failed to create item" },
    onSuccess: async (item) => {
      await invalidate(qc, item?.id);
    },
  });
};

export const useUpdateMyItemMutation = (id?: string | number) => {
  const qc = useQueryClient();
  return useRequestMutation<MyItemDetail, MyItemInput>({
    namespace: "api:my-items-update",
    method: "PUT",
    url: () => `/my-items/${requireId(id, "ID required")}`,
    wrapPayload: (p) => ({ my_item: p }),
    messages: { success: "Item updated", error: "Failed to update item" },
    onSuccess: async (item) => {
      await invalidate(qc, item?.id ?? id);
    },
  });
};

export const useDeleteMyItemMutation = () => {
  const qc = useQueryClient();
  return useRequestMutation<void, string | number>({
    namespace: "api:my-items-delete",
    method: "DELETE",
    url: (id) => `/my-items/${requireId(id, "ID required")}`,
    messages: { success: "Item deleted", error: "Failed to delete item" },
    onSuccess: async (_, id) => {
      await invalidate(qc, id);
    },
  });
};
```

---

## Navigation Reference

```typescript
const { navigatePage, navigateView, navigateBack, closeView } =
  useUnifiedURLState();

// Go to a page (replaces current page)
navigatePage(MY_DETAIL_PAGE_ID, { params: { id: "42" } });

// Open a view panel (appends to current URL)
navigateView(LIST_EDIT_VIEW_ID, { searchParams: { id: "42" } });

// Open a view in create mode (no ID)
navigateView(LIST_EDIT_VIEW_ID);

// Close the current view panel
closeView();

// Go back to the previous page
navigateBack();
```

---

## ID Compound Format

```
{module-id}.{page-id}.{view-id}

core-contacts.contact-detail.edit-contact-view
│             │               └─ view segment
│             └─ page segment
└─ module segment (from MODULE_IDS)
```

---

## Common Gotchas

| Symptom                           | Cause                            | Fix                                         |
| --------------------------------- | -------------------------------- | ------------------------------------------- |
| Component re-renders infinitely   | Object selector in Zustand       | Use individual selectors                    |
| View panel doesn't render         | Missing `<Outlet />` in page     | Add `<Outlet />` at end of page JSX         |
| Cache not updating after mutation | Wrong invalidation key           | Check key hierarchy in factory              |
| Query runs with empty ID          | Missing `enabled: !!id`          | Add `enabled` guard to `useRequestQuery`    |
| TypeScript error on API field     | Using list type for detail field | Use `BookDetail` not `BookList`             |
| URL param is string, ID is number | Not normalizing                  | Use `normalizeId()` in query keys           |
| Edit view shows blank form        | `useSearch` not reading ID       | Check `path: '/edit'` in module config view |

---

## File Naming Conventions

| File           | Convention                   | Example                     |
| -------------- | ---------------------------- | --------------------------- |
| Module config  | `{module}.module.config.tsx` | `library.module.config.tsx` |
| Store          | `{module}.store.ts`          | `library.store.ts`          |
| Page component | `{PageName}Page.tsx`         | `BookListPage.tsx`          |
| Page provider  | `use{PageName}Provider.ts`   | `useBookListProvider.ts`    |
| View component | `{ViewName}View.tsx`         | `EditBookView.tsx`          |
| View provider  | `use{ViewName}Provider.ts`   | `useEditBookProvider.ts`    |
| Schema         | `{domain}.schema.ts`         | `books.schema.ts`           |
| API hooks      | `{domain}.api.ts`            | `books.api.ts`              |
| Column defs    | `{entity}-list.columns.tsx`  | `book-list.columns.tsx`     |

---

## Real Module References

When in doubt, read the source:

| Pattern              | Reference File                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Module config (full) | [`contacts.module.config.tsx`](../../frontend/src/apps/core/modules/contacts/contacts.module.config.tsx)                     |
| Zustand store        | [`contacts.store.ts`](../../frontend/src/apps/core/modules/contacts/contacts.store.ts)                                       |
| Page provider        | [`useContactListProvider.ts`](../../frontend/src/apps/core/modules/contacts/pages/ContactListPage/useContactListProvider.ts) |
| Page component       | [`ContactListPage.tsx`](../../frontend/src/apps/core/modules/contacts/pages/ContactListPage/ContactListPage.tsx)             |
| API hooks            | [`contacts.api.ts`](../../frontend/src/apps/core/shared/data/contacts/contacts.api.ts)                                       |
| Zod schema           | [`contacts.schema.ts`](../../frontend/src/apps/core/shared/data/contacts/contacts.schema.ts)                                 |
| Multi-page module    | [`users.module.config.tsx`](../../frontend/src/apps/core/modules/users/users.module.config.tsx)                              |
