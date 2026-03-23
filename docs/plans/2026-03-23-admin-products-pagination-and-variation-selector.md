# Admin Products Pagination And Variation Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep `/admin/products` light with true server-side pagination while upgrading storefront variation picking to grouped selectors.

**Architecture:** The worker gets a dedicated admin catalog page route with server-side filtering and paging. The admin products page switches to that route and stops depending on the full shared snapshot. Storefront product detail keeps using the shared catalog snapshot, but variation choice is derived through grouped selector helpers instead of a flat button list.

**Tech Stack:** React 19, TypeScript, Vite, Cloudflare Workers, Cloudflare D1, node:test

---

### Task 1: Admin Catalog Pagination Helpers

**Files:**
- Create: `src/lib/catalog/adminCatalog.ts`
- Create: `src/lib/catalog/adminCatalog.test.ts`

**Step 1: Write the failing test**

Cover tracker filtering, search filtering, page clamping, and returned counts.

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/catalog/adminCatalog.test.ts`

**Step 3: Write minimal implementation**

Add normalized query parsing and filtered/paginated page building.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/catalog/adminCatalog.test.ts`

### Task 2: Storefront Variation Selector Helpers

**Files:**
- Create: `src/lib/catalog/variationSelection.ts`
- Create: `src/lib/catalog/variationSelection.test.ts`

**Step 1: Write the failing test**

Cover grouped selector generation and fallback to a real variation when a requested combination does not exist.

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/catalog/variationSelection.test.ts`

**Step 3: Write minimal implementation**

Add selector-group extraction and option-to-variation resolution helpers.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/catalog/variationSelection.test.ts`

### Task 3: Worker And Frontend Integration

**Files:**
- Modify: `workers/elevate-catalog-worker/src/index.ts`
- Modify: `src/lib/catalog/types.ts`
- Modify: `src/lib/catalog/api.ts`
- Modify: `src/pages/admin/Products.tsx`
- Modify: `src/pages/storefront/ProductDetail.tsx`
- Modify: `package.json`

**Step 1: Wire the worker route**

Use the admin pagination helper to serve a paginated admin-only response.

**Step 2: Wire the admin page**

Fetch one page at a time, render paging metadata, and refresh only the current page after writes.

**Step 3: Wire the storefront selectors**

Replace the flat variation list with grouped option selectors driven by the variation-selection helper.

**Step 4: Verify**

Run:
- `node --test --import tsx src/lib/catalog/adminCatalog.test.ts src/lib/catalog/variationSelection.test.ts`
- `npm test`
- `npm run build`
