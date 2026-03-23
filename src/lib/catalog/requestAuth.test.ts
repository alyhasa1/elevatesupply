import assert from "node:assert/strict";
import test from "node:test";

import { buildCatalogAuthHeaders } from "./requestAuth";

test("buildCatalogAuthHeaders adds a bearer token when present", () => {
  assert.deepEqual(buildCatalogAuthHeaders("abc123"), {
    Authorization: "Bearer abc123",
  });
});

test("buildCatalogAuthHeaders returns empty headers without a token", () => {
  assert.deepEqual(buildCatalogAuthHeaders(""), {});
  assert.deepEqual(buildCatalogAuthHeaders(null), {});
});
