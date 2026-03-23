import assert from "node:assert/strict";
import test from "node:test";

import { SITE_KEY, isElevateOrderSiteKey, withElevateSiteKey } from "./siteScope";

test("withElevateSiteKey stamps payloads with the elevate site key", () => {
  assert.deepEqual(withElevateSiteKey({ listing_id: "abc123" }), {
    listing_id: "abc123",
    site_key: "elevate_supply",
  });
});

test("isElevateOrderSiteKey only accepts elevate rows", () => {
  assert.equal(SITE_KEY, "elevate_supply");
  assert.equal(isElevateOrderSiteKey("elevate_supply"), true);
  assert.equal(isElevateOrderSiteKey("ecomwithyasir"), false);
  assert.equal(isElevateOrderSiteKey(null), false);
});
