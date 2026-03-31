# UI Improvements & Policies — 2026-03-31

## Summary
Constrained main layouts, implemented policy pages, updated the footer, and redesigned the category cards. Also removed the Pakistani Jackets stock tracker.

## Changes

### `src/layouts/StorefrontLayout.tsx`
- Constrained main site layout to a more focused view by adding `max-w-7xl` to container classes in header, sub-header, and footer.
- Updated the footer's "About" section text with the company information.
- Added social media links (YouTube, Instagram) to the footer using `lucide-react` icons.
- Updated "Company" links in the footer to link to the new policy pages.

### `src/pages/storefront/policies/`
- Created `Terms.tsx`, `Privacy.tsx`, and `Returns.tsx` using the provided legal texts from `src/lib/catalog/policies page text.txt`.
- Formatted the pages with modern prose typography and styling.

### `src/App.tsx`
- Added the new policy routes (`/terms`, `/privacy`, `/returns`).

### `src/lib/catalog/trackers.ts` & `types.ts`
- Added `bgImage` field to the `TrackerDefinition`.
- Sourced background images for Textile, TikTok DS, Wholesale Items, and Account Building stocks.
- **Removed** `pakistani_jackets` from the trackers list and `TrackerId` type definition.

### `workers/elevate-catalog-worker/src/index.ts`
- Removed all hardcoded proxy references and content override handling for `pakistani_jackets`.

### `src/components/CategoryCard.tsx`
- Redesigned the cards to display the background image using `bg-cover bg-center` with a gradient overlay.
- Removed the "Live" badge, tracker description, and "Open Tracker" call-to-action link as requested.
- Focused the card strictly on the Tracker Name with a hover zoom effect.
