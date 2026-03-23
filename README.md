
## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set these frontend environment variables in `.env`:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
   `VITE_ELEVATE_CATALOG_API_URL`
3. Run the app:
   `npm run dev`

## Shared Backend Notes

- Frontend auth and checkout use the shared `ecomwithyasir` Supabase project.
- Catalog reads and admin price writes go through `workers/elevate-catalog-worker`.
- Orders created from this site must be tagged with `site_key = elevate_supply`.
- The worker also needs:
  `SUPABASE_SERVICE_ROLE_KEY` as a Wrangler secret
  a real D1 `database_id`
  the production `ALLOWED_ORIGINS` value

## Deploy Frontend

1. Set the build command to `npm run build`.
2. Set the publish directory to `dist`.
3. Add the frontend environment variables in your hosting provider.
4. Deploy the site. SPA redirects are handled by `netlify.toml`.
