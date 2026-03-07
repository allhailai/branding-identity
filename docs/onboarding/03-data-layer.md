# 03 — The Data Layer

The data layer is the bridge between the frontend and the API. It lives in `frontend/src/apps/core/shared/data/` and is made of three things:

1. **Zod schemas** — define the shape of API responses and form inputs
2. **Query key factories** — stable, hierarchical cache keys for TanStack Query
3. **Request hooks** — `useRequestQuery` and `useRequestMutation` wrappers

This guide explains each layer in depth, with the patterns you'll use in every module.

---

## Directory Structure

```
frontend/src/apps/core/shared/data/
└── {domain}/
    ├── {domain}.schema.ts    ← Zod types
    ├── {domain}.api.ts       ← Query keys + hooks
    └── index.ts              ← Re-exports
```

The `{domain}` matches the API resource name: `contacts`, `books`, `users`, etc.

---

## Part 1 — Zod Schemas

### Why Zod?

Zod validates API responses at runtime and infers TypeScript types at compile time. You get one source of truth for both.

```typescript
// Define once
const bookListSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullish(),
});

// TypeScript type is inferred — no manual interface needed
type BookList = z.infer<typeof bookListSchema>;
//   ^ { id: number; title: string; author: string | null | undefined }
```

### The List / Detail Split

Every domain has two response shapes:

| Schema                 | Used by                 | Contains                                         |
| ---------------------- | ----------------------- | ------------------------------------------------ |
| `{entity}ListSchema`   | `GET /books` (index)    | Lean — only fields needed for table rows         |
| `{entity}DetailSchema` | `GET /books/:id` (show) | Full — every field the detail page might display |

This split is intentional. The backend serializes less data for list responses (faster queries, smaller payloads). If you use the detail schema for list items, TypeScript will let you access fields that don't exist in the response.

```typescript
// ✅ Correct — lean list schema
export const bookListSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullish(),
  is_available: z.boolean().default(true),
});

// ✅ Correct — full detail schema
export const bookDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string().nullish(),
  isbn: z.string().nullish(), // ← only in detail
  description: z.string().nullish(), // ← only in detail
  is_available: z.boolean().default(true),
  inserted_at: z.string().nullish(),
  updated_at: z.string().nullish(),
});
```

### Nullable vs Optional vs Both

The API returns `null` for missing values, not `undefined`. Use `.nullish()` (which is `.nullable().optional()`) for fields that may be absent:

```typescript
// ✅ Correct — field may be null in the API response
author: z.string().nullish(),

// ❌ Wrong — .optional() means the key may be absent from the object,
//    but the API always includes the key (just with a null value)
author: z.string().optional(),
```

### Input Schemas for Forms

Form inputs are validated separately from API responses. Input schemas are stricter — they enforce required fields and business rules:

```typescript
// API response schema — permissive (the backend controls what it sends)
export const bookDetailSchema = z.object({
  title: z.string(),
  author: z.string().nullish(),
});

// Form input schema — strict (the user must provide valid data)
export const bookInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().trim(),
});
```

### Common Patterns

```typescript
// Reusable nullable helpers (define at top of schema file)
const nullableString = z.string().nullish();
const nullableNumber = z.number().nullish();
const nullableBoolean = z.boolean().nullish();
const timestampString = z.string().nullish();

// Default values for booleans that should never be null in the UI
is_available: z.boolean().default(true),

// Arrays that should never be undefined
events: z.array(eventSchema).optional().default([]),

// Nested objects
type: contactTypeSchema.nullish(),
```

---

## Part 2 — Query Key Factories

### Why Query Keys Matter

TanStack Query uses cache keys to:

- Store and retrieve cached data
- Know which queries to invalidate after a mutation
- Deduplicate in-flight requests

If your keys aren't stable and hierarchical, cache invalidation breaks silently.

### The Factory Pattern

```typescript
export const bookKeys = {
  // Root — invalidating this invalidates EVERYTHING for books
  all: ["core", "books"] as const,

  // List branch — invalidating this invalidates all list queries
  lists: () => [...bookKeys.all, "list"] as const,

  // Specific list with filters — invalidating lists() also invalidates this
  list: (filters: Record<string, unknown>) =>
    [...bookKeys.lists(), { filters }] as const,

  // Detail branch
  details: () => [...bookKeys.all, "detail"] as const,

  // Specific detail
  detail: (id: string | number) =>
    [...bookKeys.details(), normalizeId(id)] as const,
};
```

The hierarchy is:

```
['core', 'books']                              ← all
['core', 'books', 'list']                      ← lists()
['core', 'books', 'list', { filters: {...} }]  ← list(filters)
['core', 'books', 'detail']                    ← details()
['core', 'books', 'detail', '42']              ← detail(42)
```

Invalidating `bookKeys.lists()` automatically invalidates every `list(filters)` key because TanStack Query uses prefix matching.

### The `normalizeId` Helper

Always normalize IDs before using them in keys. The API may return `number` but the URL param is `string`. Inconsistent key types cause cache misses:

```typescript
import { normalizeId } from "@/apps/core/shared/utils/normalize";

// normalizeId converts numbers to strings and handles null/undefined
normalizeId(42); // → '42'
normalizeId("42"); // → '42'
normalizeId(null); // → ''
normalizeId(undefined); // → ''
```

### Invalidation Helpers

Centralize invalidation logic in a private helper function. Mutations call this instead of duplicating `invalidateQueries` calls:

```typescript
// Private — only used within this file
const invalidateBookQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  bookId?: string | number,
) => {
  const id = bookId ? normalizeId(bookId) : null;
  await Promise.all([
    // Always invalidate the list (the new/updated book should appear)
    queryClient.invalidateQueries({ queryKey: bookKeys.lists() }),
    // Conditionally invalidate the specific detail (if we know the ID)
    id
      ? queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) })
      : Promise.resolve(),
  ]);
};
```

---

## Part 3 — `useRequestQuery`

`useRequestQuery` is a wrapper around TanStack Query's `useQuery`. It adds:

- Unified `state` object (`state.phase`, `state.error`, `state.canRetry`)
- Structured logging via `namespace`
- Optional toast messages
- Payload transformation via `transform`
- Pagination metadata via `includeMeta: true`

**Import from:** `@/apps/core/app/data`

### Basic Query

```typescript
export const useBooksQuery = (options: { search?: string } = {}) => {
  return useRequestQuery<BookList[], ReturnType<typeof bookKeys.list>, true>({
    // Cache key — must be stable (same inputs → same key)
    queryKey: bookKeys.list(options),

    // API endpoint
    url: "/books",

    // Query string params (serialized automatically)
    params: options.search ? { search: options.search } : undefined,

    // Logging namespace — appears in browser console and error tracking
    namespace: "api:books-list",

    // true = response includes { data: [...], meta: { total: 100 } }
    includeMeta: true,

    // Transform null responses to empty arrays
    transform: (data) => data || [],

    // How long before the cache is considered stale (5 minutes)
    staleTime: 5 * 60 * 1000,

    // Toast messages (optional)
    messages: {
      loading: "Loading books...",
      error: "Failed to load books",
    },
  });
};
```

### The Generic Type Parameters

```typescript
useRequestQuery<
  TData, // The shape of the data you expect back
  TQueryKey, // The type of the query key (inferred from factory)
  TIncludeMeta // true if the response has { data, meta } wrapper
>;
```

For most list queries: `useRequestQuery<MyType[], ReturnType<typeof myKeys.list>, true>`  
For detail queries: `useRequestQuery<MyDetailType>` (no meta, no key type needed)

### Conditional Queries

Use `enabled` to prevent a query from running until its dependencies are ready:

```typescript
export const useBookQuery = (bookId: string | number | null | undefined) => {
  const id = normalizeId(bookId);

  return useRequestQuery<BookDetail>({
    queryKey: bookKeys.detail(id),
    url: `/books/${id}`,
    namespace: "api:books-detail",
    enabled: !!id, // ← Don't fetch if id is empty string / null
    staleTime: 5 * 60 * 1000,
  });
};
```

### Reading Query Results

```typescript
const {
  data, // The response data (transformed if transform was provided)
  state, // { phase: 'loading' | 'error' | 'success', error, canRetry }
  isLoading, // true during initial load
  isFetching, // true during any fetch (including background refetch)
  refetch, // Manually trigger a refetch
  error, // Error object if the query failed
} = useBooksQuery({ search: "gatsby" });

// With includeMeta: true, data has shape { data: BookList[], meta: { total: number } }
const books = data?.data ?? [];
const total = data?.meta?.total ?? 0;
```

---

## Part 4 — `useRequestMutation`

`useRequestMutation` wraps TanStack Query's `useMutation`. It adds:

- Automatic toast notifications (success, error, loading)
- DELETE confirmation with countdown/undo
- Payload wrapping via `wrapPayload`
- URL as a function (for dynamic IDs)

### Create Mutation

```typescript
export const useCreateBookMutation = () => {
  const queryClient = useQueryClient();

  return useRequestMutation<BookDetail, BookInput>({
    namespace: "api:books-create",
    method: "POST",
    url: "/books",

    // Wrap the payload: { title: '...' } → { book: { title: '...' } }
    // Matches the Phoenix controller's expected params shape
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
```

### Update Mutation (Dynamic URL)

When the URL depends on an ID, pass `url` as a function:

```typescript
export const useUpdateBookMutation = (bookId?: string | number) => {
  const queryClient = useQueryClient();

  return useRequestMutation<BookDetail, BookInput>({
    namespace: "api:books-update",
    method: "PUT",

    // url as a function — called at mutation time, not hook call time
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
```

### Delete Mutation

DELETE mutations automatically show a countdown toast with an undo option:

```typescript
export const useDeleteBookMutation = () => {
  const queryClient = useQueryClient();

  return useRequestMutation<void, string | number>({
    namespace: "api:books-delete",
    method: "DELETE",

    // url receives the mutation variable (the ID passed to mutateAsync)
    url: (id) => `/books/${requireId(id, "Book ID is required")}`,

    messages: {
      successTitle: "Delete Book",
      loading: "Deleting book...",
      success: "Book removed from library",
      error: "Failed to delete book",
      errorTitle: "Delete Book Failed",
    },
    onSuccess: async (_, id) => {
      await invalidateBookQueries(queryClient, id);
    },
  });
};
```

### Calling Mutations

```typescript
// In a provider hook:
const { mutateAsync: createBook, isPending } = useCreateBookMutation();

// Fire and await — errors are caught by the mutation hook and shown as toasts
const handleSubmit = async (values: BookInput) => {
  await createBook(values);
  closeView(); // Only runs if mutation succeeded
};

// For DELETE — pass the ID as the mutation variable
const { mutateAsync: deleteBook } = useDeleteBookMutation();
await deleteBook(bookId);
```

### The Generic Type Parameters

```typescript
useRequestMutation<
  TResponse, // Shape of the successful response
  TVariables // Shape of the data you pass to mutateAsync()
>;
```

---

## Part 5 — The `requireId` Helper

`requireId` throws a descriptive error if an ID is missing. Use it in `url` functions to catch programming errors early:

```typescript
import { requireId } from '@/apps/core/shared/utils/normalize';

url: () => `/books/${requireId(bookId, 'Book ID is required to update book')}`,
//                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                   Throws if bookId is null/undefined/empty — not a silent 404
```

---

## Common Mistakes

### ❌ Querying inside a loop

```typescript
// WRONG — N+1 queries
const enriched = books.map((book) => {
  const { data: detail } = useBookQuery(book.id); // ← hooks can't be in loops
  return { ...book, ...detail };
});
```

```typescript
// CORRECT — fetch all details in one request, or build a lookup map upfront
const bookIds = books.map((b) => b.id);
const { data: details } = useBooksDetailBatchQuery(bookIds);
```

### ❌ Object selector in Zustand

```typescript
// WRONG — creates a new object reference every render → infinite loop
const { searchQuery, viewMode } = useLibraryUIStore((s) => ({
  searchQuery: s.searchQuery,
  viewMode: s.viewMode,
}));
```

```typescript
// CORRECT — individual selectors
const searchQuery = useLibraryUIStore((s) => s.searchQuery);
const viewMode = useLibraryUIStore((s) => s.viewMode);
```

### ❌ Fetching outside the module system

```typescript
// WRONG — raw fetch bypasses caching, error handling, and auth headers
const response = await fetch("/books");
const books = await response.json();
```

```typescript
// CORRECT — always use useRequestQuery
const { data } = useBooksQuery();
```

### ❌ Inconsistent query key types

```typescript
// WRONG — sometimes number, sometimes string → cache misses
bookKeys.detail(42); // → ['core', 'books', 'detail', 42]
bookKeys.detail("42"); // → ['core', 'books', 'detail', '42']  ← different key!
```

```typescript
// CORRECT — always normalizeId
bookKeys.detail(normalizeId(42)); // → ['core', 'books', 'detail', '42']
bookKeys.detail(normalizeId("42")); // → ['core', 'books', 'detail', '42']  ← same key
```

---

## Next Step

→ Continue to [`04-cheatsheet.md`](./04-cheatsheet.md) for a quick-reference summary of all patterns.
