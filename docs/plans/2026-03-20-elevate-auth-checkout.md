# Elevate Supply Auth And Checkout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add shared Supabase auth and end-to-end checkout to Elevate Supply while keeping catalog pricing in the local Cloudflare worker and separating this site's orders with `site_key = 'elevate_supply'`.

**Architecture:** The frontend will use the same Supabase project as `ecomwithyasir` for auth, order creation, order history, Google Form submission, and PayPal checkout. The existing `elevate-catalog-worker` will remain the source for catalog reads and project-local price overrides, but its admin auth will be upgraded to trust Supabase sessions and `admin_users.is_admin` instead of a separate allowlist.

**Tech Stack:** React 19, React Router 7, TypeScript, Supabase JS, Supabase Edge Functions, Cloudflare Workers, Cloudflare D1, node:test with `tsx`

---

### Task 1: Add Supabase Client And Site Scope Foundations

**Files:**
- Modify: `d:\elevate supply\package.json`
- Create: `d:\elevate supply\src\lib\supabaseClient.ts`
- Create: `d:\elevate supply\src\lib\siteScope.ts`
- Test: `d:\elevate supply\src\lib\siteScope.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { SITE_KEY, isElevateOrderSiteKey, withElevateSiteKey } from "./siteScope";

test("withElevateSiteKey stamps every order payload", () => {
  assert.deepEqual(withElevateSiteKey({ listing_id: "123" }), {
    listing_id: "123",
    site_key: "elevate_supply",
  });
});

test("isElevateOrderSiteKey only accepts elevate rows", () => {
  assert.equal(isElevateOrderSiteKey("elevate_supply"), true);
  assert.equal(isElevateOrderSiteKey("ecomwithyasir"), false);
  assert.equal(SITE_KEY, "elevate_supply");
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/siteScope.test.ts`
Expected: FAIL with module-not-found errors for `siteScope.ts`.

**Step 3: Write minimal implementation**

```ts
export const SITE_KEY = "elevate_supply";

export function withElevateSiteKey<T extends Record<string, unknown>>(value: T) {
  return { ...value, site_key: SITE_KEY };
}

export function isElevateOrderSiteKey(value: unknown) {
  return value === SITE_KEY;
}
```

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/siteScope.test.ts`
Expected: PASS for both tests.

**Step 5: Commit**

```bash
git add package.json src/lib/supabaseClient.ts src/lib/siteScope.ts src/lib/siteScope.test.ts
git commit -m "feat: add supabase client foundations"
```

### Task 2: Port Auth Context And Auth Routes

**Files:**
- Create: `d:\elevate supply\src\contexts\AuthContext.tsx`
- Create: `d:\elevate supply\src\pages\auth\Auth.tsx`
- Create: `d:\elevate supply\src\components\auth\RequireAuth.tsx`
- Create: `d:\elevate supply\src\components\auth\RequireAdmin.tsx`
- Modify: `d:\elevate supply\src\App.tsx`
- Modify: `d:\elevate supply\src\main.tsx`
- Modify: `d:\elevate supply\src\layouts\StorefrontLayout.tsx`
- Modify: `d:\elevate supply\src\layouts\AdminLayout.tsx`
- Test: `d:\elevate supply\src\lib\authRedirects.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { getAuthRedirectPath } from "./authRedirects";

test("admins land on /admin after sign-in", () => {
  assert.equal(getAuthRedirectPath({ isAdmin: true }), "/admin");
});

test("non-admin users land on /orders after sign-in", () => {
  assert.equal(getAuthRedirectPath({ isAdmin: false }), "/orders");
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/authRedirects.test.ts`
Expected: FAIL because `authRedirects.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function getAuthRedirectPath(input: { isAdmin: boolean }) {
  return input.isAdmin ? "/admin" : "/orders";
}
```

Then port the parent app's Supabase auth behavior into `AuthContext.tsx` and `Auth.tsx`, using an Elevate-specific storage key like `elevate-auth-token` and the same `admin_users` lookup model.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/authRedirects.test.ts`
Expected: PASS for both redirect cases.

**Step 5: Commit**

```bash
git add src/contexts/AuthContext.tsx src/pages/auth/Auth.tsx src/components/auth/RequireAuth.tsx src/components/auth/RequireAdmin.tsx src/App.tsx src/main.tsx src/layouts/StorefrontLayout.tsx src/layouts/AdminLayout.tsx src/lib/authRedirects.test.ts
git commit -m "feat: add supabase auth flows"
```

### Task 3: Replace Manual Admin Tokens With Session-Based Worker Auth

**Files:**
- Modify: `d:\elevate supply\src\lib\catalog\api.ts`
- Modify: `d:\elevate supply\src\lib\catalog\context.tsx`
- Modify: `d:\elevate supply\src\pages\admin\Products.tsx`
- Modify: `d:\elevate supply\workers\elevate-catalog-worker\src\index.ts`
- Modify: `d:\elevate supply\workers\elevate-catalog-worker\wrangler.toml`
- Test: `d:\elevate supply\src\lib\catalog\requestAuth.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildCatalogAuthHeaders } from "./requestAuth";

test("adds bearer token when a session token exists", () => {
  assert.deepEqual(buildCatalogAuthHeaders("abc"), {
    Authorization: "Bearer abc",
  });
});

test("returns empty headers when there is no token", () => {
  assert.deepEqual(buildCatalogAuthHeaders(null), {});
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/catalog/requestAuth.test.ts`
Expected: FAIL because `requestAuth.ts` does not exist.

**Step 3: Write minimal implementation**

```ts
export function buildCatalogAuthHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

Then wire the admin catalog API to use the logged-in Supabase session token, and update the worker to verify the user and confirm `admin_users.is_admin = true` through Supabase instead of `ADMIN_USER_IDS`.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/catalog/requestAuth.test.ts`
Expected: PASS for both header-building cases.

**Step 5: Commit**

```bash
git add src/lib/catalog/api.ts src/lib/catalog/context.tsx src/pages/admin/Products.tsx src/lib/catalog/requestAuth.test.ts workers/elevate-catalog-worker/src/index.ts workers/elevate-catalog-worker/wrangler.toml
git commit -m "feat: connect admin worker auth to supabase sessions"
```

### Task 4: Add Shared-Supabase Order Site Separation

**Files:**
- Create: `C:\Users\r\Downloads\ecomwithyasir\supabase\migrations\20260320_add_site_key_to_user_orders.sql`
- Modify: `C:\Users\r\Downloads\ecomwithyasir\supabase\functions\paypal-create-order\index.ts`
- Test: `d:\elevate supply\src\lib\orders\siteFilters.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { filterElevateOrders } from "./siteFilters";

test("filterElevateOrders only keeps elevate rows", () => {
  const rows = [
    { id: "1", site_key: "elevate_supply" },
    { id: "2", site_key: "ecomwithyasir" },
  ];

  assert.deepEqual(filterElevateOrders(rows), [{ id: "1", site_key: "elevate_supply" }]);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/orders/siteFilters.test.ts`
Expected: FAIL because `siteFilters.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
import { SITE_KEY } from "../siteScope";

export function filterElevateOrders<T extends { site_key?: string | null }>(rows: T[]) {
  return rows.filter((row) => row.site_key === SITE_KEY);
}
```

Then add the Supabase migration so shared `user_orders` rows can be tagged by site, and make `paypal-create-order` accept optional request-driven branding fields while keeping the current defaults for `ecomwithyasir`.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/orders/siteFilters.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/orders/siteFilters.test.ts C:\Users\r\Downloads\ecomwithyasir\supabase\migrations\20260320_add_site_key_to_user_orders.sql C:\Users\r\Downloads\ecomwithyasir\supabase\functions\paypal-create-order\index.ts
git commit -m "feat: add shared-order site separation"
```

### Task 5: Port The Orders API And Checkout Modal

**Files:**
- Create: `d:\elevate supply\src\lib\ordersApi.ts`
- Create: `d:\elevate supply\src\components\orders\OrderFormModal.tsx`
- Create: `d:\elevate supply\src\lib\orders\trackerOrderSource.ts`
- Test: `d:\elevate supply\src\lib\orders\trackerOrderSource.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { trackerIdToOrderSource } from "./trackerOrderSource";

test("maps tracker ids to existing google-form order sources", () => {
  assert.equal(trackerIdToOrderSource("tims_textile"), "ebay_stock");
  assert.equal(trackerIdToOrderSource("tiktok_ds"), "tiktok_stock");
  assert.equal(trackerIdToOrderSource("wholesale_items"), "wholesale_stock");
  assert.equal(trackerIdToOrderSource("pakistani_jackets"), "jackets_stock");
  assert.equal(trackerIdToOrderSource("account_building"), "account_building_stock");
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/orders/trackerOrderSource.test.ts`
Expected: FAIL because `trackerOrderSource.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function trackerIdToOrderSource(trackerId: string) {
  switch (trackerId) {
    case "tims_textile":
      return "ebay_stock";
    case "tiktok_ds":
      return "tiktok_stock";
    case "wholesale_items":
      return "wholesale_stock";
    case "pakistani_jackets":
      return "jackets_stock";
    case "account_building":
      return "account_building_stock";
    default:
      throw new Error(`Unsupported trackerId: ${trackerId}`);
  }
}
```

Then port the parent app's `ordersApi` and `OrderFormModal`, adapting them to:
- stamp `site_key`
- filter reads by `site_key`
- use this repo's catalog product shape
- send optional PayPal branding for this site

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/orders/trackerOrderSource.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/ordersApi.ts src/components/orders/OrderFormModal.tsx src/lib/orders/trackerOrderSource.ts src/lib/orders/trackerOrderSource.test.ts
git commit -m "feat: add checkout api and order modal"
```

### Task 6: Wire Storefront Checkout, PayPal Return, And User Orders

**Files:**
- Create: `d:\elevate supply\src\pages\PayPalReturn.tsx`
- Create: `d:\elevate supply\src\pages\storefront\OrderHistory.tsx`
- Modify: `d:\elevate supply\src\pages\storefront\ProductDetail.tsx`
- Modify: `d:\elevate supply\src\layouts\StorefrontLayout.tsx`
- Modify: `d:\elevate supply\src\App.tsx`
- Test: `d:\elevate supply\src\lib\orders\paypalReturnMessage.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { buildPayPalReturnMessage } from "./paypalReturnMessage";

test("builds the window message payload for paypal return", () => {
  assert.deepEqual(buildPayPalReturnMessage({
    token: "abc",
    payerId: "payer-1",
    status: "success",
  }), {
    type: "paypal:return",
    token: "abc",
    payerId: "payer-1",
    status: "success",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/orders/paypalReturnMessage.test.ts`
Expected: FAIL because `paypalReturnMessage.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
export function buildPayPalReturnMessage(input: {
  token: string | null;
  payerId: string | null;
  status: string;
}) {
  return {
    type: "paypal:return",
    token: input.token,
    payerId: input.payerId,
    status: input.status,
  };
}
```

Then add checkout CTAs to product detail, route `/paypal/return`, and a signed-in `/orders` page that only shows rows where `site_key = 'elevate_supply'`.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/orders/paypalReturnMessage.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/PayPalReturn.tsx src/pages/storefront/OrderHistory.tsx src/pages/storefront/ProductDetail.tsx src/layouts/StorefrontLayout.tsx src/App.tsx src/lib/orders/paypalReturnMessage.test.ts
git commit -m "feat: wire storefront checkout and order history"
```

### Task 7: Replace Admin Orders Placeholder With Site-Scoped Orders

**Files:**
- Modify: `d:\elevate supply\src\pages\admin\Orders.tsx`
- Modify: `d:\elevate supply\src\layouts\AdminLayout.tsx`
- Test: `d:\elevate supply\src\lib\orders\adminOrderStats.test.ts`

**Step 1: Write the failing test**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { summarizeElevateOrders } from "./adminOrderStats";

test("summarizeElevateOrders ignores non-elevate rows", () => {
  const stats = summarizeElevateOrders([
    { site_key: "elevate_supply", total: 25, status: "processing" },
    { site_key: "ecomwithyasir", total: 100, status: "processing" },
  ]);

  assert.equal(stats.totalOrders, 1);
  assert.equal(stats.totalValue, 25);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test --import tsx src/lib/orders/adminOrderStats.test.ts`
Expected: FAIL because `adminOrderStats.ts` does not exist yet.

**Step 3: Write minimal implementation**

```ts
import { SITE_KEY } from "../siteScope";

export function summarizeElevateOrders(rows: Array<{ site_key?: string; total: number; status: string }>) {
  const filtered = rows.filter((row) => row.site_key === SITE_KEY);
  return {
    totalOrders: filtered.length,
    totalValue: filtered.reduce((sum, row) => sum + Number(row.total), 0),
  };
}
```

Then replace the admin orders placeholder with a real filtered orders table that only queries and displays this site's orders.

**Step 4: Run test to verify it passes**

Run: `node --test --import tsx src/lib/orders/adminOrderStats.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/admin/Orders.tsx src/layouts/AdminLayout.tsx src/lib/orders/adminOrderStats.test.ts
git commit -m "feat: add site-scoped admin orders"
```

### Task 8: Configure Env, Switch Cloudflare Login, Deploy, And Smoke Test

**Files:**
- Modify: `d:\elevate supply\.env`
- Modify: `d:\elevate supply\workers\elevate-catalog-worker\wrangler.toml`
- Reference: `C:\Users\r\Downloads\ecomwithyasir\supabase\functions\paypal-create-order\index.ts`
- Reference: `C:\Users\r\Downloads\ecomwithyasir\supabase\functions\paypal-capture-order\index.ts`

**Step 1: Write the failing verification checklist**

```md
- `wrangler whoami` shows the wrong Cloudflare account.
- frontend auth env values are missing or incomplete.
- worker env values are missing Supabase server-side auth settings.
- `/orders` and `/paypal/return` routes are not smoke-tested.
```

**Step 2: Run the failing verification**

Run:
- `npx wrangler whoami`
- `npm run lint`
- `npm run build`
- `npm test`

Expected:
- Cloudflare account is wrong until login is switched.
- Build or tests fail until previous tasks are complete.

**Step 3: Write minimal implementation**

Run:
- `npx wrangler logout`
- `npx wrangler login`
- update `.env`
- update worker secrets and bindings
- deploy worker with `npx wrangler deploy`
- deploy any Supabase migration and edge-function changes in `ecomwithyasir`

**Step 4: Run verification to confirm success**

Run:
- `npx wrangler whoami`
- `npm run lint`
- `npm run build`
- `npm test`
- manual smoke: sign in, place `Pay Later` order, place `Pay Now` order, verify order history filtering, verify admin product save, verify admin orders filtering

Expected:
- correct Cloudflare account
- all local checks pass
- both checkout paths work
- Google Form and PayPal complete successfully

**Step 5: Commit**

```bash
git add .env workers/elevate-catalog-worker/wrangler.toml
git commit -m "chore: configure auth checkout deployment"
```
