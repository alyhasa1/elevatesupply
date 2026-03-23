# Elevate Supply Auth and Checkout Design

## Goal
- Add the `ecomwithyasir` Supabase auth and checkout flow to this site without polluting this site's catalog pricing data.
- Keep the existing Cloudflare worker and D1 setup for catalog, pricing, and Pakistani Jackets.
- Reuse the existing Supabase edge functions for PayPal and Google Form submission so we do not rebuild the payment backend.

## Approved Direction
- Use the same Supabase project as `ecomwithyasir` for auth and checkout.
- Keep this site's catalog and admin pricing isolated in `workers/elevate-catalog-worker` and its D1 database.
- Keep this site's orders logically separate inside the shared Supabase project by tagging them with `site_key = 'elevate_supply'`.

## Architecture

### Auth
- This repo will add the same Supabase client and auth flow pattern used in `ecomwithyasir`.
- Frontend login, sign-up, password reset, and session persistence will live in this repo.
- Admin route protection in this repo should use the same Supabase `admin_users.is_admin` model as the parent app.

### Catalog And Admin Pricing
- `workers/elevate-catalog-worker` stays the backend for this site's catalog reads and project-local price overrides.
- The worker should stop relying on a separate `ADMIN_USER_IDS` allowlist and instead verify the Supabase bearer token, then confirm `admin_users.is_admin = true` using server-side Supabase access.
- Frontend admin requests should automatically attach the logged-in user's bearer token to catalog worker admin routes so we can remove manual token entry.

### Orders And Checkout
- Orders for this site will be stored in the same `user_orders` table used by `ecomwithyasir`, but each row created from this site must include `site_key = 'elevate_supply'`.
- `order_source` should stay compatible with the parent app so the existing Google Form routing keeps working:
  - `tims_textile` -> `ebay_stock`
  - `tiktok_ds` -> `tiktok_stock`
  - `wholesale_items` -> `wholesale_stock`
  - `pakistani_jackets` -> `jackets_stock`
  - `account_building` -> `account_building_stock`
- Checkout behavior should match the parent app:
  - `Pay Now` creates the PayPal order first, captures it, then creates the `user_orders` row and submits the Google Form.
  - `Pay Later` creates the `user_orders` row immediately and submits the Google Form immediately.
- We should also port the order-history flow that lets the signed-in user review their own orders and complete later payment actions.

### Edge Function Reuse
- Reuse the existing `paypal-create-order`, `paypal-capture-order`, `submit-google-form`, and `submit-tiktok-stock-form` edge functions.
- `submit-google-form` and `submit-tiktok-stock-form` can be reused unchanged because they only need order payload data.
- `paypal-capture-order` can be reused unchanged because it looks up the authenticated user and updates `user_orders`.
- `paypal-create-order` should be enhanced in a backward-compatible way to accept an optional branding payload so the PayPal checkout window can show this site's branding instead of always showing `Ecom With Yasir`.

## Data Model Changes

### Shared Supabase
- Add a `site_key text not null default 'ecomwithyasir'` column to `public.user_orders`.
- Backfill existing rows to `ecomwithyasir`.
- Add an index that supports `site_key` plus user/admin order queries.
- Do not create a second orders table unless we later decide to fully fork the checkout backend.

### This Repo
- Add a local constant for `SITE_KEY = 'elevate_supply'`.
- Add order helpers that always write and query the shared `user_orders` table through that `site_key`.
- Keep `Account Building` checkout enabled but product editing disabled.

## Frontend Scope

### New Flows To Add Here
- Sign in
- Create account
- Forgot password
- Reset password
- Auth-aware storefront header state
- Protected admin routes
- Product checkout modal or drawer
- PayPal return page
- User order history page filtered to `site_key = 'elevate_supply'`
- Admin orders page filtered to `site_key = 'elevate_supply'`

### Explicitly Out Of Scope For This Phase
- Moving catalog data out of the Cloudflare worker
- Rebuilding PayPal logic from scratch
- Rebuilding Google Form submission logic from scratch
- Porting the full parent `Payments` claim workflow unless checkout work reveals a hard dependency
- Changing how the three upstream stock workers ingest and sync data

## Deployment And Environment
- Before deployment, log out of the currently active Cloudflare account and log into the correct one.
- The worker needs the shared Supabase project URL plus server-side credentials for admin verification.
- The frontend needs the shared Supabase public URL and anon key, plus the deployed catalog worker URL.

## Risks And Mitigations
- Shared backend risk: this site could accidentally show mixed order history.
  - Mitigation: make `site_key` required in every insert and every query path we add in this repo.
- Checkout branding risk: PayPal currently uses the parent site's brand string.
  - Mitigation: add optional request-driven branding to `paypal-create-order` with safe defaults for the parent app.
- Admin auth drift risk: frontend admin state and worker admin checks could disagree.
  - Mitigation: use the same Supabase `admin_users.is_admin` source of truth in both places.
- Scope creep risk: porting all parent account/payment surfaces would slow down delivery.
  - Mitigation: limit this phase to auth, checkout, order history, and admin order visibility.

## Success Criteria
- A user can sign up, sign in, reset password, and stay signed in on this site.
- A signed-in user can place `Pay Now` and `Pay Later` orders from this site's product pages.
- Google Form submission keeps working through the existing edge functions.
- PayPal checkout keeps working through the existing edge functions.
- Orders created from this site can be queried cleanly with `site_key = 'elevate_supply'`.
- Admin users can manage catalog pricing through the worker using their Supabase login instead of manual token entry.
