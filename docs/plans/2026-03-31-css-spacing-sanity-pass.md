# CSS Spacing & Sanity Pass — 2026-03-31

## Summary
Cleaned up inconsistent spacing, padding, and CSS foundations across the storefront.

## Changes

### `src/index.css`
- Added `@theme` block with brand color tokens (`--color-brand-*`) and surface tokens
- Added `@layer base` with:
  - Smooth scroll on `html`
  - Antialiased text rendering (`-webkit-font-smoothing`, `-moz-osx-font-smoothing`, `text-rendering`)
  - Brand-colored `::selection` highlight
  - `overflow-x: hidden` on `body` (prevents horizontal scroll globally)
  - Consistent `*:focus-visible` outlines using brand color
  - `img { max-width: 100%; height: auto }` safety net

### `src/layouts/StorefrontLayout.tsx`
- Added `overflow-x-hidden` to root wrapper (layout-level protection)
- Changed footer from `mt-12` to `mt-auto` (uses flexbox to push footer down naturally)

### `src/pages/storefront/Home.tsx`
- Removed redundant `min-h-screen`, `bg-[#faf9f8]`, and `overflow-x-hidden` from wrapper div (all provided by StorefrontLayout)

### `src/pages/storefront/Catalog.tsx`
- Normalized page padding: `pt-12 pb-8 sm:pt-16` → `py-8 sm:py-12`
- Fixed horizontal padding: `px-6` → `px-4` (matches layout container)
- Widened section gap: `space-y-2` (8px, too cramped) → `space-y-6` (24px, proper breathing)

### `src/pages/storefront/ProductDetail.tsx`
- Normalized page padding: `pt-14 pb-8 sm:pt-16 sm:pb-12` → `py-8 sm:py-12`
- Fixed horizontal padding: `px-3 sm:px-4` → `px-4` (consistent)
- Removed `min-h-screen` from main view, loading state, and not-found state
- Not-found state uses `py-16 sm:py-24` for vertical centering space

### `src/pages/storefront/OrderHistory.tsx`
- Normalized page padding: `pt-24 pb-16` (96px top was excessive) → `py-8 sm:py-12`
- Removed `min-h-screen` (layout handles it)

## Design Decisions
- Standardized all storefront pages to `py-8 sm:py-12` (32px / 48px) for consistent vertical rhythm
- All containers use `px-4` horizontal padding
- `min-h-screen` only lives in `StorefrontLayout`, not duplicated in pages
- `overflow-x-hidden` only lives in layout root + body CSS, not per-page
- Footer uses `mt-auto` instead of fixed `mt-12` margin
