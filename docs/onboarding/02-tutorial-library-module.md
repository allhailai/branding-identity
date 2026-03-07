# 02 — Tutorial: Build the Book Library Module

In this tutorial you will build a fully working **Book Library** module from scratch. When you're done, it will appear in the sidebar navigation, have a searchable list page, a detail page, and a slide-in edit panel — all wired up exactly the way production modules are.

**Estimated time:** 60–90 minutes  
**What you'll touch:** 10 new files, 3 existing files

---

## What You're Building

```
/library                    ← BookListPage: searchable table of books
/library/:id                ← BookDetailPage: a single book's info
/library/:id/edit           ← EditBookView: slide-in edit form
```

The finished file tree:

```
frontend/src/apps/core/
├── config/
│   └── constants/
│       └── module-ids.ts          ← EDIT: add CORE_LIBRARY
├── modules/
│   ├── index.ts                   ← EDIT: register the module
│   └── library/                   ← NEW directory
│       ├── library.module.config.tsx
│       ├── library.store.ts
│       ├── pages/
│       │   ├── BookListPage/
│       │   │   ├── BookListPage.tsx
│       │   │   ├── book-list.columns.tsx
│       │   │   └── useBookListProvider.ts
│       │   └── BookDetailPage/
│       │       ├── BookDetailPage.tsx
│       │       └── useBookDetailProvider.ts
│       └── views/
│           └── EditBookView/
│               ├── EditBookView.tsx
│               └── useEditBookProvider.ts
└── shared/
    └── data/
        └── books/                 ← NEW directory
            ├── books.schema.ts
            ├── books.api.ts
            └── index.ts
```

---

## Step 1 — Register the Module ID

Open [`frontend/src/apps/core/config/constants/module-ids.ts`](../../frontend/src/apps/core/config/constants/module-ids.ts) and add one line:

```typescript
export const MODULE_IDS = {
  CORE_WORKSPACE: "core-workspace",
  CORE_PATIENTS: "core-patients",
  CORE_CONTACTS: "core-contacts",
  CORE_CARETEAMS: "core-careteams",
  CORE_WORKFLOWS: "core-workflows",
  CORE_USERS: "core-users",
  CORE_LIBRARY: "core-library", // ← ADD THIS
} as const;
```

> **Why here?** All module IDs live in one place so they can be imported anywhere without circular dependencies. The `as const` assertion makes TypeScript treat these as literal types, not plain strings.

---

## Step 2 — Create the Data Layer

The data layer lives outside the module so it can be shared across modules if needed.

### 2a. Zod Schema

Create [`frontend/src/apps/core/shared/data/books/books.schema.ts`](../../frontend/src/apps/core/shared/data/books/books.schema.ts):

```typescript
import { z } from "zod";

// ── List shape (returned by GET /books) ──────────────────────────────────────
// Lean — only the fields needed to render a row in the table.
export const bookListSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullish(),
  genre: z.string().nullish(),
  published_year: z.number().nullish(),
  is_available: z.boolean().default(true),
});

// ── Detail shape (returned by GET /books/:id) ────────────────────────────────
// Full — every field the detail page might display.
export const bookDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullish(),
  genre: z.string().nullish(),
  published_year: z.number().nullish(),
  isbn: z.string().nullish(),
  description: z.string().nullish(),
  is_available: z.boolean().default(true),
  inserted_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});

// ── Input schema (used by the edit form) ─────────────────────────────────────
export const bookInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().trim(),
  genre: z.string().trim(),
  published_year: z.number().nullish(),
  isbn: z.string().trim(),
  description: z.string().trim(),
  is_available: z.boolean(),
});

// ── TypeScript types inferred from schemas ───────────────────────────────────
export type BookList = z.infer<typeof bookListSchema>;
export type BookDetail = z.infer<typeof bookDetailSchema>;
export type BookInput = z.infer<typeof bookInputSchema>;
```

> **Why two schemas?** List responses are intentionally lean — the backend only serializes the fields the table needs. Detail responses include everything. Keeping them separate prevents TypeScript from lying to you about which fields are available where.

### 2b. API Hooks

Create [`frontend/src/apps/core/shared/data/books/books.api.ts`](../../frontend/src/apps/core/shared/data/books/books.api.ts):

```typescript
import { useQueryClient } from "@tanstack/react-query";

import { useRequestMutation, useRequestQuery } from "@/apps/core/app/data";
import { normalizeId, requireId } from "@/apps/core/shared/utils/normalize";

import type { BookDetail, BookInput, BookList } from "./books.schema";

// ── Query Key Factory ─────────────────────────────────────────────────────────
// A factory object that produces stable, hierarchical cache keys.
// The hierarchy matters: invalidating `lists()` also invalidates all `list(...)` keys.
export const bookKeys = {
  all: ["core", "books"] as const,
  lists: () => [...bookKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...bookKeys.lists(), { filters }] as const,
  details: () => [...bookKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...bookKeys.details(), normalizeId(id)] as const,
};

// ── Invalidation Helper ───────────────────────────────────────────────────────
// Centralizes cache invalidation logic so mutations don't repeat themselves.
const invalidateBookQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  bookId?: string | number,
) => {
  const id = bookId ? normalizeId(bookId) : null;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: bookKeys.lists() }),
    id
      ? queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) })
      : Promise.resolve(),
  ]);
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const useBooksQuery = (options: { search?: string } = {}) => {
  return useRequestQuery<BookList[], ReturnType<typeof bookKeys.list>, true>({
    queryKey: bookKeys.list(options),
    url: "/books",
    params: options.search ? { search: options.search } : undefined,
    namespace: "api:books-list",
    includeMeta: true,
    transform: (data) => data || [],
    staleTime: 5 * 60 * 1000,
    messages: {
      loading: "Loading books...",
      error: "Failed to load books",
    },
  });
};

export const useBookQuery = (bookId: string | number | null | undefined) => {
  const id = normalizeId(bookId);
  return useRequestQuery<BookDetail>({
    queryKey: bookKeys.detail(id),
    url: `/books/${id}`,
    namespace: "api:books-detail",
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateBookMutation = () => {
  const queryClient = useQueryClient();
  return useRequestMutation<BookDetail, BookInput>({
    namespace: "api:books-create",
    method: "POST",
    url: "/books",
    wrapPayload: (payload) => ({ book: payload }),
    messages: {
      success: "Book added to library",
      error: "Failed to add book",
    },
    onSuccess: async (book) => {
      await invalidateBookQueries(queryClient, book?.id);
    },
  });
};

export const useUpdateBookMutation = (bookId?: string | number) => {
  const queryClient = useQueryClient();
  return useRequestMutation<BookDetail, BookInput>({
    namespace: "api:books-update",
    method: "PUT",
    url: () => `/books/${requireId(bookId, "Book ID is required")}`,
    wrapPayload: (payload) => ({ book: payload }),
    messages: {
      success: "Book updated",
      error: "Failed to update book",
    },
    onSuccess: async (book) => {
      await invalidateBookQueries(queryClient, book?.id ?? bookId);
    },
  });
};

export const useDeleteBookMutation = () => {
  const queryClient = useQueryClient();
  return useRequestMutation<void, string | number>({
    namespace: "api:books-delete",
    method: "DELETE",
    url: (id) => `/books/${requireId(id, "Book ID is required")}`,
    messages: {
      successTitle: "Delete Book",
      loading: "Deleting book...",
      success: "Book removed from library",
      error: "Failed to delete book",
    },
    onSuccess: async (_, id) => {
      await invalidateBookQueries(queryClient, id);
    },
  });
};
```

### 2c. Index Re-export

Create [`frontend/src/apps/core/shared/data/books/index.ts`](../../frontend/src/apps/core/shared/data/books/index.ts):

```typescript
export * from "./books.schema";
export * from "./books.api";
```

> **Why an index file?** Consumers import from `@/apps/core/shared/data/books` — a clean path that doesn't expose internal file structure. If you ever split `books.api.ts` into multiple files, the import paths in modules don't change.

---

## Step 3 — Create the Zustand Store

Create [`frontend/src/apps/core/modules/library/library.store.ts`](../../frontend/src/apps/core/modules/library/library.store.ts):

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface LibraryUIState {
  // Transient state (not persisted)
  searchQuery: string;
  selectedBookId: string | null;

  // Persisted preferences
  viewMode: "list" | "grid";

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedBookId: (id: string | null) => void;
  setViewMode: (mode: "list" | "grid") => void;
  reset: () => void;
}

const initialState = {
  searchQuery: "",
  selectedBookId: null,
  viewMode: "list" as const,
};

export const useLibraryUIStore = create<LibraryUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setSearchQuery: (query) => set({ searchQuery: query }),
        setSelectedBookId: (id) => set({ selectedBookId: id }),
        setViewMode: (mode) => set({ viewMode: mode }),
        reset: () => set(initialState),
      }),
      {
        name: "library-ui-store",
        // Only persist the view mode preference — search and selection are transient
        partialize: (state) => ({ viewMode: state.viewMode }),
      },
    ),
    { name: "LibraryUIStore" },
  ),
);

// ── Selectors ─────────────────────────────────────────────────────────────────
// Export named selectors so components don't repeat selector logic.
export const selectSearchQuery = (s: LibraryUIState) => s.searchQuery;
export const selectViewMode = (s: LibraryUIState) => s.viewMode;
```

> **`partialize` is important.** Without it, `searchQuery` would be saved to localStorage and restored on the next page load — which would be confusing. Only persist things the user would _want_ to remember (view mode, column visibility, sort preferences).

---

## Step 4 — Create the List Page

### 4a. Column Definitions

Create [`frontend/src/apps/core/modules/library/pages/BookListPage/book-list.columns.tsx`](../../frontend/src/apps/core/modules/library/pages/BookListPage/book-list.columns.tsx):

```typescript
import type { ColumnDef } from '@tanstack/react-table';
import { BookOpen, Pencil } from 'lucide-react';

import { Badge, Button } from '@/apps/core/shared/core-components/core-ui';
import type { BookList } from '@/apps/core/shared/data/books';

export const createBookColumns = (
  onEdit: (bookId: number) => void
): ColumnDef<BookList>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <BookOpen className="text-muted-foreground h-4 w-4 shrink-0" />
        <span className="font-medium">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: 'author',
    header: 'Author',
    cell: ({ getValue }) => getValue<string>() ?? '—',
  },
  {
    accessorKey: 'genre',
    header: 'Genre',
    cell: ({ getValue }) => {
      const genre = getValue<string>();
      return genre ? <Badge variant="secondary">{genre}</Badge> : '—';
    },
  },
  {
    accessorKey: 'published_year',
    header: 'Year',
    cell: ({ getValue }) => getValue<number>() ?? '—',
  },
  {
    accessorKey: 'is_available',
    header: 'Status',
    cell: ({ getValue }) => {
      const available = getValue<boolean>();
      return (
        <Badge variant={available ? 'success' : 'destructive'}>
          {available ? 'Available' : 'Checked Out'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={e => {
          e.stopPropagation(); // Don't trigger row click (navigate to detail)
          onEdit(row.original.id);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    ),
  },
];
```

### 4b. List Page Provider

Create [`frontend/src/apps/core/modules/library/pages/BookListPage/useBookListProvider.ts`](../../frontend/src/apps/core/modules/library/pages/BookListPage/useBookListProvider.ts):

```typescript
import { useCallback, useMemo, useState, useEffect } from "react";

import { useBooksQuery } from "@/apps/core/shared/data/books";
import { useUnifiedURLState } from "@/apps/core/shared/hooks/useUnifiedURLState";

import {
  BOOK_DETAIL_PAGE_ID,
  LIST_EDIT_BOOK_VIEW_ID,
} from "../../library.module.config";
import { useLibraryUIStore } from "../../library.store";
import { createBookColumns } from "./book-list.columns";

export const useBookListProvider = () => {
  // ── DATA ──────────────────────────────────────────────────────────────────
  const { navigatePage, navigateView } = useUnifiedURLState();

  // Read search from the store (persists across navigation)
  const searchQuery = useLibraryUIStore((s) => s.searchQuery);
  const setSearchQuery = useLibraryUIStore((s) => s.setSearchQuery);

  // Local state for immediate input feedback (avoids debounce lag in the input)
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Keep local state in sync if the store is cleared externally
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const {
    data: booksData,
    state: booksState,
    refetch,
  } = useBooksQuery({
    search: searchQuery,
  });

  // ── BUSINESS LOGIC ────────────────────────────────────────────────────────

  const handleBookClick = useCallback(
    (bookId: string) => {
      navigatePage(BOOK_DETAIL_PAGE_ID, { params: { id: bookId } });
    },
    [navigatePage],
  );

  const handleEditBook = useCallback(
    (bookId: number) => {
      navigateView(LIST_EDIT_BOOK_VIEW_ID, {
        searchParams: { id: String(bookId) },
      });
    },
    [navigateView],
  );

  const handleAddBook = useCallback(() => {
    navigateView(LIST_EDIT_BOOK_VIEW_ID); // No ID = create mode
  }, [navigateView]);

  // Debounced search: update local input immediately, delay store update by 300ms
  const debouncedSetSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      setSearchTerm(value);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setSearchQuery(value), 300);
    };
  }, [setSearchQuery]);

  // ── DERIVED STATE ─────────────────────────────────────────────────────────

  const books = useMemo(() => booksData?.data ?? [], [booksData]);

  const tableColumns = useMemo(
    () => createBookColumns(handleEditBook),
    [handleEditBook],
  );

  // ── RETURN ────────────────────────────────────────────────────────────────

  return {
    books,
    booksState,
    refetch,
    searchQuery: searchTerm,
    tableColumns,
    handleBookClick,
    handleAddBook,
    debouncedSetSearch,
  };
};
```

### 4c. List Page Component

Create [`frontend/src/apps/core/modules/library/pages/BookListPage/BookListPage.tsx`](../../frontend/src/apps/core/modules/library/pages/BookListPage/BookListPage.tsx):

```typescript
import { Outlet } from '@tanstack/react-router';
import { BookOpen, Plus } from 'lucide-react';

import {
  Badge,
  Button,
  Container,
  ContainerContent,
  ContainerHeader,
  DataList,
  Header,
} from '@/apps/core/shared/core-components/core-ui';
import { OperationStateDisplay } from '@/apps/core/shared/core-components/features/OperationState/OperationStateDisplay';

import { useLibraryUIStore, selectViewMode } from '../../library.store';
import { useBookListProvider } from './useBookListProvider';

export function BookListPage() {
  const {
    books,
    booksState,
    refetch,
    searchQuery,
    tableColumns,
    handleBookClick,
    handleAddBook,
    debouncedSetSearch,
  } = useBookListProvider();

  // Read view mode directly from store (not via provider — it's pure UI preference)
  const viewMode = useLibraryUIStore(selectViewMode);
  const setViewMode = useLibraryUIStore(s => s.setViewMode);

  return (
    <OperationStateDisplay state={booksState} onRetry={refetch}>
      <Container>
        <ContainerHeader>
          <Header
            icon={<BookOpen className="h-8 w-8" />}
            title="Book Library"
            subtitle="Browse and manage the book collection"
            actions={
              <>
                <Badge variant="primary">{books.length} books</Badge>
                <Button onClick={handleAddBook}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </Button>
              </>
            }
          />
        </ContainerHeader>

        <ContainerContent>
          <DataList
            columns={tableColumns}
            data={books}
            emptyMessage="No books found. Add one to get started."
            onRowClick={row => handleBookClick(row.id.toString())}
            rowClassName="cursor-pointer"
            // Search
            showToolbar
            stickyToolbar
            showSearch
            searchValue={searchQuery}
            onSearchChange={debouncedSetSearch}
            searchPlaceholder="Search by title or author..."
            // View toggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            // Sorting & pagination
            enableSorting
            enablePagination
            pageSize={10}
            showResultsCounter
          />
        </ContainerContent>
      </Container>

      {/* Views (e.g. EditBookView) render here as a slide-in panel */}
      <Outlet />
    </OperationStateDisplay>
  );
}
```

> **Notice `<Outlet />`** at the bottom. This is where the `EditBookView` will render when the user navigates to `/library/edit`. Without it, the view panel has nowhere to mount.

---

## Step 5 — Create the Detail Page

### 5a. Detail Page Provider

Create [`frontend/src/apps/core/modules/library/pages/BookDetailPage/useBookDetailProvider.ts`](../../frontend/src/apps/core/modules/library/pages/BookDetailPage/useBookDetailProvider.ts):

```typescript
import { useCallback } from "react";

import { useBookQuery } from "@/apps/core/shared/data/books";
import { useUnifiedURLState } from "@/apps/core/shared/hooks/useUnifiedURLState";

import { DETAIL_EDIT_BOOK_VIEW_ID } from "../../library.module.config";

export const useBookDetailProvider = (bookId: string | undefined) => {
  // ── DATA ──────────────────────────────────────────────────────────────────
  const { navigateView, navigateBack } = useUnifiedURLState();

  const { data: book, state: bookState, refetch } = useBookQuery(bookId);

  // ── BUSINESS LOGIC ────────────────────────────────────────────────────────

  const handleEdit = useCallback(() => {
    navigateView(DETAIL_EDIT_BOOK_VIEW_ID, {
      searchParams: { id: bookId ?? "" },
    });
  }, [navigateView, bookId]);

  const handleBack = useCallback(() => {
    navigateBack();
  }, [navigateBack]);

  // ── RETURN ────────────────────────────────────────────────────────────────

  return { book, bookState, refetch, handleEdit, handleBack };
};
```

### 5b. Detail Page Component

Create [`frontend/src/apps/core/modules/library/pages/BookDetailPage/BookDetailPage.tsx`](../../frontend/src/apps/core/modules/library/pages/BookDetailPage/BookDetailPage.tsx):

```typescript
import { Outlet, useParams } from '@tanstack/react-router';
import { ArrowLeft, BookOpen, Pencil } from 'lucide-react';

import {
  Badge,
  Button,
  Container,
  ContainerContent,
  ContainerHeader,
  Header,
} from '@/apps/core/shared/core-components/core-ui';
import { OperationStateDisplay } from '@/apps/core/shared/core-components/features/OperationState/OperationStateDisplay';

import { useBookDetailProvider } from './useBookDetailProvider';

export function BookDetailPage() {
  // TanStack Router provides URL params via useParams
  const { id } = useParams({ strict: false });

  const { book, bookState, refetch, handleEdit, handleBack } =
    useBookDetailProvider(id);

  return (
    <OperationStateDisplay state={bookState} onRetry={refetch}>
      <Container>
        <ContainerHeader>
          <Header
            icon={<BookOpen className="h-8 w-8" />}
            title={book?.title ?? 'Book Detail'}
            subtitle={book?.author ?? ''}
            actions={
              <>
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
                <Button onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </>
            }
          />
        </ContainerHeader>

        <ContainerContent>
          {book && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Genre</p>
                  <p>{book.genre ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Published</p>
                  <p>{book.published_year ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">ISBN</p>
                  <p>{book.isbn ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Status</p>
                  <Badge variant={book.is_available ? 'success' : 'destructive'}>
                    {book.is_available ? 'Available' : 'Checked Out'}
                  </Badge>
                </div>
              </div>

              {book.description && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Description</p>
                  <p className="mt-1">{book.description}</p>
                </div>
              )}
            </div>
          )}
        </ContainerContent>
      </Container>

      <Outlet />
    </OperationStateDisplay>
  );
}
```

---

## Step 6 — Create the Edit View

### 6a. Edit View Provider

Create [`frontend/src/apps/core/modules/library/views/EditBookView/useEditBookProvider.ts`](../../frontend/src/apps/core/modules/library/views/EditBookView/useEditBookProvider.ts):

```typescript
import { useCallback } from "react";
import { useSearch } from "@tanstack/react-router";

import {
  useBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
} from "@/apps/core/shared/data/books";
import { useUnifiedURLState } from "@/apps/core/shared/hooks/useUnifiedURLState";
import type { BookInput } from "@/apps/core/shared/data/books";

export const useEditBookProvider = () => {
  // ── DATA ──────────────────────────────────────────────────────────────────
  const { closeView } = useUnifiedURLState();

  // The view receives the book ID via URL search params: /library/edit?id=42
  const { id: bookId } = useSearch({ strict: false }) as { id?: string };

  const isEditMode = !!bookId;

  const { data: book, isLoading: isLoadingBook } = useBookQuery(
    isEditMode ? bookId : null,
  );

  const { mutateAsync: createBook, isPending: isCreating } =
    useCreateBookMutation();
  const { mutateAsync: updateBook, isPending: isUpdating } =
    useUpdateBookMutation(bookId);

  // ── BUSINESS LOGIC ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (values: BookInput) => {
      if (isEditMode) {
        await updateBook(values);
      } else {
        await createBook(values);
      }
      closeView();
    },
    [isEditMode, updateBook, createBook, closeView],
  );

  const handleClose = useCallback(() => {
    closeView();
  }, [closeView]);

  // ── RETURN ────────────────────────────────────────────────────────────────

  return {
    book,
    isEditMode,
    isLoading: isLoadingBook,
    isSaving: isCreating || isUpdating,
    handleSubmit,
    handleClose,
  };
};
```

### 6b. Edit View Component

Create [`frontend/src/apps/core/modules/library/views/EditBookView/EditBookView.tsx`](../../frontend/src/apps/core/modules/library/views/EditBookView/EditBookView.tsx):

```typescript
import { useState } from 'react';

import {
  Button,
  Input,
  Label,
} from '@/apps/core/shared/core-components/core-ui';
import type { BookInput } from '@/apps/core/shared/data/books';

import { useEditBookProvider } from './useEditBookProvider';

export function EditBookView() {
  const { book, isEditMode, isSaving, handleSubmit, handleClose } =
    useEditBookProvider();

  // Simple local form state — for production use TanStack Form instead
  const [values, setValues] = useState<Partial<BookInput>>({
    title: book?.title ?? '',
    author: book?.author ?? '',
    genre: book?.genre ?? '',
    published_year: book?.published_year ?? undefined,
    isbn: book?.isbn ?? '',
    description: book?.description ?? '',
    is_available: book?.is_available ?? true,
  });

  const handleChange = (field: keyof BookInput, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(values as BookInput);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold">
          {isEditMode ? 'Edit Book' : 'Add Book'}
        </h2>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          ✕
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={values.title ?? ''}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="The Great Gatsby"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={values.author ?? ''}
            onChange={e => handleChange('author', e.target.value)}
            placeholder="F. Scott Fitzgerald"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            value={values.genre ?? ''}
            onChange={e => handleChange('genre', e.target.value)}
            placeholder="Fiction"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="published_year">Published Year</Label>
          <Input
            id="published_year"
            type="number"
            value={values.published_year ?? ''}
            onChange={e => handleChange('published_year', Number(e.target.value) || undefined)}
            placeholder="1925"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={values.isbn ?? ''}
            onChange={e => handleChange('isbn', e.target.value)}
            placeholder="978-0-7432-7356-5"
          />
        </div>

        {/* Panel footer — sticky at bottom */}
        <div className="mt-auto flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Book'}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

> **For production forms**, replace the local `useState` with [TanStack Form](https://tanstack.com/form). See [`useEditContactProvider.ts`](../../frontend/src/apps/core/modules/contacts/views/EditContactView/useEditContactProvider.ts) in the contacts module for a real example with validation and field-level error messages.

---

## Step 7 — Create the Module Config

This is the file that wires everything together and makes the module visible to the app.

Create [`frontend/src/apps/core/modules/library/library.module.config.tsx`](../../frontend/src/apps/core/modules/library/library.module.config.tsx):

```typescript
import { BookOpen, Pencil } from "lucide-react";
import { lazy } from "react";

import { CORE } from "@/apps/core/config/constants/common";
import { MODULE_IDS } from "@/apps/core/config/constants/module-ids";
import type { ModuleConfig } from "@/apps/core/types/module.types";

import { EditBookView } from "./views/EditBookView/EditBookView";

// Lazy-load pages for better bundle performance
const BookListPage = lazy(() =>
  import("./pages/BookListPage/BookListPage").then((m) => ({
    default: m.BookListPage,
  })),
);
const BookDetailPage = lazy(() =>
  import("./pages/BookDetailPage/BookDetailPage").then((m) => ({
    default: m.BookDetailPage,
  })),
);

// ============================================================================
// ALL IDS DECLARED AT TOP — export the ones other files need to navigate
// ============================================================================
const { CORE_LIBRARY } = MODULE_IDS;

const PAGES = {
  LIST: "book-list",
  DETAIL: "book-detail",
} as const;

const VIEWS = {
  EDIT_BOOK: "edit-book-view",
} as const;

// Page IDs
export const BOOK_LIST_PAGE_ID = `${CORE_LIBRARY}.${PAGES.LIST}`;
export const BOOK_DETAIL_PAGE_ID = `${CORE_LIBRARY}.${PAGES.DETAIL}`;

// View IDs — exported so provider hooks can call navigateView(LIST_EDIT_BOOK_VIEW_ID)
export const LIST_EDIT_BOOK_VIEW_ID = `${CORE_LIBRARY}.${PAGES.LIST}.${VIEWS.EDIT_BOOK}`;
export const DETAIL_EDIT_BOOK_VIEW_ID = `${CORE_LIBRARY}.${PAGES.DETAIL}.${VIEWS.EDIT_BOOK}`;

// ============================================================================
// MODULE CONFIG
// ============================================================================
export const libraryModuleConfig: ModuleConfig = {
  id: CORE_LIBRARY,
  name: "Book Library",
  basePath: "/library",
  icon: BookOpen,

  metadata: {
    source: CORE,
    description: "Browse and manage the book collection",
  },

  pages: [
    {
      id: BOOK_LIST_PAGE_ID,
      component: BookListPage,
      isDefaultPage: true, // This page loads at /library
      isNav: true, // Show in sidebar navigation

      views: [
        {
          id: LIST_EDIT_BOOK_VIEW_ID,
          name: "Edit Book",
          icon: Pencil,
          component: EditBookView,
          slot: "right",
          path: "/edit", // Opens at /library/edit?id=42
        },
      ],
    },

    {
      id: BOOK_DETAIL_PAGE_ID,
      path: "$id", // TanStack Router dynamic segment: /library/:id
      name: "Book Detail",
      component: BookDetailPage,
      isNav: false, // Not in sidebar — reached by clicking a row

      views: [
        {
          id: DETAIL_EDIT_BOOK_VIEW_ID,
          name: "Edit Book",
          icon: Pencil,
          component: EditBookView,
          slot: "right",
          path: "/edit", // Opens at /library/:id/edit
        },
      ],
    },
  ],
};
```

---

## Step 8 — Register the Module

Open [`frontend/src/apps/core/modules/index.ts`](../../frontend/src/apps/core/modules/index.ts) and add two lines:

```typescript
import { careteamsModuleConfig } from "./careteams/careteams.module.config";
import { contactsModuleConfig } from "./contacts/contacts.module.config";
import { libraryModuleConfig } from "./library/library.module.config"; // ← ADD
import { patientsModuleConfig } from "./patients/patients.module.config";
import { usersModuleConfig } from "./users/users.module.config";
import { workflowsModuleConfig } from "./workflows/workflows.module.config";
import { workspaceModuleConfig } from "./workspace/workspace.module.config";

export const coreModules = [
  workspaceModuleConfig,
  patientsModuleConfig,
  contactsModuleConfig,
  workflowsModuleConfig,
  careteamsModuleConfig,
  usersModuleConfig,
  libraryModuleConfig, // ← ADD (order determines sidebar position)
];
```

That's it. The app shell reads `coreModules` at startup, registers the routes, and adds "Book Library" to the sidebar navigation.

---

## Step 9 — Verify It Works

Start the dev server if it isn't running:

```bash
cd frontend && npm run dev
```

You should now see:

1. **"Book Library"** appears in the sidebar navigation with a book icon
2. Navigating to `/library` renders `BookListPage` (empty list until the backend exists)
3. Clicking "Add Book" opens the `EditBookView` slide-in panel at `/library/edit`
4. The URL updates correctly as you open and close the panel
5. Navigating to `/library/123` renders `BookDetailPage`

> **No backend yet?** The list will show an error state from `OperationStateDisplay` because the API call to `/books` will fail. That's expected — the error boundary is working correctly. To see the UI without a backend, temporarily return mock data from `useBooksQuery` or use [MSW](https://mswjs.io/) to intercept the request.

---

## What You Just Built

| File                                                                                                                     | Pattern              | What It Does                                       |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------- | -------------------------------------------------- |
| [`books.schema.ts`](../../frontend/src/apps/core/shared/data/books/books.schema.ts)                                      | Zod schema           | Defines the shape of API responses and form inputs |
| [`books.api.ts`](../../frontend/src/apps/core/shared/data/books/books.api.ts)                                            | Query/mutation hooks | All data fetching and cache management             |
| [`library.store.ts`](../../frontend/src/apps/core/modules/library/library.store.ts)                                      | Zustand store        | UI state (search, view mode)                       |
| [`library.module.config.tsx`](../../frontend/src/apps/core/modules/library/library.module.config.tsx)                    | Module config        | Routes, nav, views, permissions                    |
| [`BookListPage.tsx`](../../frontend/src/apps/core/modules/library/pages/BookListPage/BookListPage.tsx)                   | Page component       | Renders the list — no logic                        |
| [`useBookListProvider.ts`](../../frontend/src/apps/core/modules/library/pages/BookListPage/useBookListProvider.ts)       | Page provider        | All list page logic                                |
| [`BookDetailPage.tsx`](../../frontend/src/apps/core/modules/library/pages/BookDetailPage/BookDetailPage.tsx)             | Page component       | Renders the detail — no logic                      |
| [`useBookDetailProvider.ts`](../../frontend/src/apps/core/modules/library/pages/BookDetailPage/useBookDetailProvider.ts) | Page provider        | All detail page logic                              |
| [`EditBookView.tsx`](../../frontend/src/apps/core/modules/library/views/EditBookView/EditBookView.tsx)                   | View component       | Renders the edit form — no logic                   |
| [`useEditBookProvider.ts`](../../frontend/src/apps/core/modules/library/views/EditBookView/useEditBookProvider.ts)       | View provider        | Create/update mutations, close navigation          |

---

## Stretch Goals

Once the basics are working, try these to deepen your understanding:

1. **Add a delete button** to the detail page. Use `useDeleteBookMutation` and navigate back to the list on success.
2. **Add a command palette entry** in `library.module.config.tsx` to create a book from anywhere in the app (see how `contacts:create` is defined in [`contacts.module.config.tsx`](../../frontend/src/apps/core/modules/contacts/contacts.module.config.tsx)).
3. **Add column visibility** to the list page — look at how `ContactListPage` uses `enableColumnVisibility` and persists the state in the store.
4. **Replace the simple form** in `EditBookView` with TanStack Form — look at [`useEditContactProvider.ts`](../../frontend/src/apps/core/modules/contacts/views/EditContactView/useEditContactProvider.ts) for the pattern.
5. **Add a grid view** — the `DataList` component supports `viewMode="grid"` with a `renderCard` prop. See how `ContactListPage` implements `renderContactCard`.

---

## Next Step

Understand the data layer patterns in depth.

→ Continue to [`03-data-layer.md`](./03-data-layer.md)
