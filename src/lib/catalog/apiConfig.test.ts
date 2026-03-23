import assert from "node:assert/strict";
import test from "node:test";

import { buildCatalogApiUrl, MISSING_CATALOG_API_BASE_ERROR, normalizeCatalogApiBase } from "./apiConfig";

test("normalizeCatalogApiBase trims whitespace and trailing slashes", () => {
  assert.equal(normalizeCatalogApiBase(" https://catalog.example.com/// "), "https://catalog.example.com");
});

test("buildCatalogApiUrl joins the base URL and path", () => {
  assert.equal(
    buildCatalogApiUrl("https://catalog.example.com/", "/catalog"),
    "https://catalog.example.com/catalog",
  );
  assert.equal(
    buildCatalogApiUrl("https://catalog.example.com", "products/tims_textile/123"),
    "https://catalog.example.com/products/tims_textile/123",
  );
});

test("buildCatalogApiUrl throws a clear error when the base URL is missing", () => {
  assert.throws(() => buildCatalogApiUrl("", "/catalog"), new Error(MISSING_CATALOG_API_BASE_ERROR));
});
