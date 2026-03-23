import assert from "node:assert/strict";
import test from "node:test";

import { formatCurrency, normalizeCurrencyCode } from "./format";

test("normalizeCurrencyCode maps common pound representations to GBP", () => {
  assert.equal(normalizeCurrencyCode("£"), "GBP");
  assert.equal(normalizeCurrencyCode("gbp"), "GBP");
  assert.equal(normalizeCurrencyCode(" GBP "), "GBP");
});

test("formatCurrency accepts symbol currencies without throwing", () => {
  assert.equal(formatCurrency(12.5, "£"), "£12.50");
  assert.equal(formatCurrency(12.5, "GBP"), "£12.50");
});
