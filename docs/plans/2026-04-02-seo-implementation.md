# SEO Implementation — 2 April 2026

## Changes
- Added `react-helmet-async` dependency
- Created `src/components/SEO.tsx` — reusable SEO component with OG, Twitter, JSON-LD
- Created `public/robots.txt` — allows all search/AI bots, blocks admin/auth
- Created `public/sitemap.xml` — all public pages for Google submission
- Updated `index.html` — base meta tags, OG defaults, Twitter defaults
- Updated `src/main.tsx` — wrapped app with HelmetProvider
- Updated `netlify.toml` — robots/sitemap routing, security & cache headers
- Updated Home, Catalog, ProductDetail, Terms, Privacy, Returns with SEO component

## Google Submission
1. Go to Google Search Console → add `elevatesupply.uk`
2. Submit sitemap: `https://elevatesupply.uk/sitemap.xml`
