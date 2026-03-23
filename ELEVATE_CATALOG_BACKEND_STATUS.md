# Elevate Supply Catalog Backend Status

Date: 2026-03-20

## Summary

This project has been refactored away from the old mock catalog and now includes a real catalog architecture plus shared auth and checkout for the separate Elevate Supply site.

The codebase now has:

- a dedicated Cloudflare Worker backend for this project
- project-local D1 tables for pricing overrides and Pakistani Jackets
- a shared frontend catalog model and pricing pipeline
- a storefront and admin UI wired to the new catalog contract
- shared Supabase login, password reset, and admin route protection
- shared Supabase order creation and order history filtered by `site_key = 'elevate_supply'`
- end-to-end `Pay Now` and `Pay Later` checkout wiring against the existing PayPal and Google Form edge functions
- Account Building kept as a fixed read-only product

The original Ecom With Yasir pricing data is not being written to by this project.

## What Has Been Implemented

### 1. Shared catalog model and pricing logic

Implemented in:

- `src/lib/catalog/types.ts`
- `src/lib/catalog/trackers.ts`
- `src/lib/catalog/pricing.ts`
- `src/lib/catalog/normalize.ts`
- `src/lib/catalog/static.ts`
- `src/lib/catalog/api.ts`
- `src/lib/catalog/context.tsx`

This now provides:

- the five fixed tracker IDs only
- normalized `CatalogProduct` and `CatalogVariation` types
- `in_stock | out_of_stock | ended` availability states
- PayPal fee handling matching Ecom With Yasir
- tracker-specific pricing rules:
  - Tims Textile: PayPal fee only
  - TikTok DS: `+0.50` then PayPal fee
  - Wholesale Items: `+shipping + 0.50` then PayPal fee
  - Pakistani Jackets: PayPal fee only
  - Account Building: PayPal fee only

### 2. Dedicated worker and D1 schema

Implemented in:

- `workers/elevate-catalog-worker/src/index.ts`
- `workers/elevate-catalog-worker/migrations/0001_initial.sql`
- `workers/elevate-catalog-worker/wrangler.toml`

This now includes:

- public read routes:
  - `GET /trackers`
  - `GET /catalog`
  - `GET /catalog/:trackerId`
  - `GET /products/:trackerId/:listingId`
- admin write routes:
  - `PATCH /admin/prices/listing`
  - `PATCH /admin/prices/variation`
  - `PATCH /admin/prices/shipping`
  - `PATCH /admin/jackets/listings/:listingId`
  - `PATCH /admin/jackets/variations/:variationId`
  - `POST /admin/jackets/import`
- D1 tables for:
  - listing price overrides
  - variation price overrides
  - wholesale shipping overrides
  - Pakistani Jackets listings
  - Pakistani Jackets variations
  - admin audit log

### 3. Jackets migration path

Implemented in:

- `workers/elevate-catalog-worker/scripts/migrate-jackets.ts`

This script is ready to:

- read `jackstock_listings` and `jackstock_variations` from Supabase
- send them into this project's worker import endpoint
- seed Pakistani Jackets into this project's own D1

### 4. Frontend refactor

Implemented in:

- `src/App.tsx`
- `src/components/ProductCard.tsx`
- `src/components/CategoryCard.tsx`
- `src/layouts/StorefrontLayout.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/pages/storefront/Home.tsx`
- `src/pages/storefront/Catalog.tsx`
- `src/pages/storefront/ProductDetail.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Products.tsx`
- `src/pages/admin/Orders.tsx`
- `src/pages/admin/Accounts.tsx`

This now means:

- the storefront reads catalog data from the new catalog context, not `mockData`
- the admin products page edits worker-backed prices and jackets data
- Account Building is shown but intentionally read-only
- dashboard KPIs are inventory-based, not placeholder margin/low-stock metrics
- old resale/margin/low-stock language has been removed from the active UI
- the catalog now fails clearly when `VITE_ELEVATE_CATALOG_API_URL` is missing instead of trying to parse frontend HTML as JSON

### 5. Shared auth and checkout

Implemented in:

- `src/lib/supabaseClient.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/auth/RequireAuth.tsx`
- `src/components/auth/RequireAdmin.tsx`
- `src/pages/auth/Auth.tsx`
- `src/lib/ordersApi.ts`
- `src/components/orders/OrderFormModal.tsx`
- `src/pages/PayPalReturn.tsx`
- `src/pages/storefront/OrderHistory.tsx`
- `src/lib/siteScope.ts`
- `src/lib/orders/trackerOrderSource.ts`
- `src/lib/orders/paypalReturnMessage.ts`
- `src/lib/orders/siteFilters.ts`
- `src/lib/orders/adminOrderStats.ts`

This now includes:

- sign in, sign up, forgot password, and reset password flows in this repo
- storefront and admin layouts driven by Supabase session state
- admin route protection using the shared `admin_users.is_admin` model
- automatic bearer-token attachment for catalog worker admin writes
- user orders scoped to `site_key = 'elevate_supply'`
- admin orders scoped to `site_key = 'elevate_supply'`
- `Pay Now` flow using shared `paypal-create-order` and `paypal-capture-order`
- `Pay Later` flow that creates the order first and lets users settle it later from `/orders`
- shared Google Form submission via existing `submit-google-form` and `submit-tiktok-stock-form`

### 6. Shared backend file changes in `ecomwithyasir`

Implemented in:

- `C:\Users\r\Downloads\ecomwithyasir\supabase\migrations\20260320000000_add_site_key_to_user_orders.sql`
- `C:\Users\r\Downloads\ecomwithyasir\supabase\functions\paypal-create-order\index.ts`

This now includes:

- a new `site_key` column for shared `user_orders`
- a backfill to `ecomwithyasir` for existing rows
- supporting indexes for site-scoped user/admin queries
- optional branding and redirect-origin support in the shared PayPal create-order edge function

### 7. Old mock catalog removed

Removed:

- `src/data/mockData.ts`

## Verification Already Run

These were run successfully after implementation:

- `npm run lint`
- `npm run build`
- `npm test`

Also checked:

- browser smoke for `/`, `/auth/sign-in`, and `/orders`
- `/orders` redirects correctly when signed out
- homepage now shows an explicit missing-worker-env error when `VITE_ELEVATE_CATALOG_API_URL` is not set
- no remaining active `mockData` imports
- no remaining active resale / low-stock catalog terminology in `src` and `workers`

## What Is Still Left From The Plan

Yes, there are still a few tasks remaining before this is fully live. The remaining items are external-account and deployment steps, not core missing implementation work.

### Required remaining tasks

1. Provision and bind the real D1 database

- create the Cloudflare D1 database for `elevate-catalog-worker`
- replace the placeholder `database_id` in `workers/elevate-catalog-worker/wrangler.toml`
- apply `workers/elevate-catalog-worker/migrations/0001_initial.sql`

2. Finish Cloudflare login and deploy from the correct account

- `wrangler login` timed out waiting for browser OAuth while the terminal was still on the wrong account
- log into the intended Cloudflare account and re-run `wrangler whoami`
- deploy `workers/elevate-catalog-worker`
- set the worker secret `SUPABASE_SERVICE_ROLE_KEY`
- set production `ALLOWED_ORIGINS`

3. Apply shared Supabase changes through Supabase MCP

- apply `C:\Users\r\Downloads\ecomwithyasir\supabase\migrations\20260320000000_add_site_key_to_user_orders.sql`
- deploy the updated shared `paypal-create-order` edge function
- verify the shared project is the real `xdarswpqooznozsdalgy` project used by this site

Current blocker:

- the currently connected Supabase MCP account can only see `qeptrxkwssxisnblsyqw` and `lvnrpawgduoogxhvdtnp`
- `get_project("xdarswpqooznozsdalgy")` currently returns `Forbidden resource`

4. Fill the final frontend and worker deployment env values

- set frontend `VITE_ELEVATE_CATALOG_API_URL`
- set production hosting env vars for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- keep worker `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` aligned with the shared project

5. Run the one-time Jackets migration

- execute `workers/elevate-catalog-worker/scripts/migrate-jackets.ts`
- verify Pakistani Jackets rows are now in this project's D1
- verify the storefront and admin are reading jackets from D1, not Supabase

6. Smoke test against real services

- test all five trackers through the deployed frontend
- verify pricing matches the existing Ecom With Yasir behavior
- verify admin override writes affect only this project
- verify wholesale shipping overrides work
- verify Account Building remains read-only
- verify sign-up, sign-in, forgot password, reset password, `Pay Later`, and `Pay Now` against the live shared Supabase project
- verify user and admin order history only show `site_key = 'elevate_supply'`

## What Is Not Missing From The Plan

These items were intentionally left out of the original phase and are not blockers for calling the plan implemented:

- a full order backend
- a full account-management backend
- a separate Supabase project for this site
- a separate PayPal or Google Form edge-function stack for this site

## Bottom Line

The implementation work from the plan is done in code and passes local verification.

What remains is environment access, deployment, migration, and live-system verification work:

- finish Cloudflare OAuth on the correct account and deploy the worker
- reconnect Supabase MCP to the shared project so the migration and PayPal edge-function update can be applied
- bind/configure D1 and final env vars
- run the Jackets import
- test against live upstream services and the shared Supabase checkout backend
