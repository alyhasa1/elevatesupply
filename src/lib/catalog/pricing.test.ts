import assert from "node:assert/strict";
import test from "node:test";

import {
  calculatePayPalInclusiveAmount,
  calculateTrackerDisplayPrice,
} from "./pricing";

test("calculatePayPalInclusiveAmount uses the existing Ecom With Yasir formula", () => {
  assert.equal(calculatePayPalInclusiveAmount(10), 10.61);
  assert.equal(calculatePayPalInclusiveAmount(3.3), 3.71);
  assert.equal(calculatePayPalInclusiveAmount(0), 0);
});

test("calculateTrackerDisplayPrice keeps each tracker pricing rule isolated", () => {
  assert.equal(calculateTrackerDisplayPrice("tims_textile", 10), 10.61);
  assert.equal(calculateTrackerDisplayPrice("tiktok_ds", 10), 11.12);
  assert.equal(calculateTrackerDisplayPrice("wholesale_items", 10, 2), 13.18);
  assert.equal(calculateTrackerDisplayPrice("pakistani_jackets", 10), 10.61);
  assert.equal(calculateTrackerDisplayPrice("account_building", 3.3), 3.71);
});
