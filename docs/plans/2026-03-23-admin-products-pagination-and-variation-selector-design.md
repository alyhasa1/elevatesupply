# Admin Products Pagination And Variation Selector Design

**Context**

The admin products page currently loads the full catalog snapshot into the browser and filters it client-side. That is too heavy once the worker returns thousands of products. The storefront product page also renders all variations as one flat list, which is harder to use than grouped option selectors.

**Approved Scope**

- Add true server-side pagination, search, and tracker filtering for `/admin/products` only.
- Keep the existing shared storefront catalog snapshot flow for the public site.
- Update the storefront product detail page only so variations are selected through grouped option selectors similar to eBay.

**Admin Products Design**

- Add a dedicated paginated response shape for admin products.
- Add a worker route that accepts `page`, `pageSize`, `q`, and `tracker` query params.
- Filter and paginate on the worker after building the snapshot, then return only the current page plus paging metadata.
- Keep admin writes on the existing patch endpoints.
- Move the admin products screen off the shared `useCatalog().products` array and onto a page-local paginated loader so each refresh only requests one page.

**Storefront Product Detail Design**

- Build grouped variation selectors from variation `selects` fields while ignoring metadata keys like `*_signal`.
- Track the currently selected option values instead of only a raw variation id.
- Resolve the selected options to the closest real variation so every selector combination maps to an actual purchasable variation.
- Use the resolved variation to drive price, availability, and checkout payload.

**Testing**

- Add pure tests for worker-side admin catalog filtering and pagination behavior.
- Add pure tests for grouped variation selector behavior and invalid-combination fallback.
