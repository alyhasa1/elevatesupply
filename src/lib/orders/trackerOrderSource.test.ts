import assert from "node:assert/strict";
import test from "node:test";

import { trackerIdToOrderSource } from "./trackerOrderSource";

test("trackerIdToOrderSource maps the five trackers to shared order_source values", () => {
  assert.equal(trackerIdToOrderSource("tims_textile"), "ebay_stock");
  assert.equal(trackerIdToOrderSource("tiktok_ds"), "tiktok_stock");
  assert.equal(trackerIdToOrderSource("wholesale_items"), "wholesale_stock");
  assert.equal(trackerIdToOrderSource("pakistani_jackets"), "jackets_stock");
  assert.equal(trackerIdToOrderSource("account_building"), "account_building_stock");
});
