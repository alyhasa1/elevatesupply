import assert from "node:assert/strict";
import test from "node:test";

import { formatCurrency, getAvailabilityLabel, getProductDetailAvailability, normalizeCurrencyCode } from "./format";

test("normalizeCurrencyCode maps common pound representations to GBP", () => {
  assert.equal(normalizeCurrencyCode("\u00a3"), "GBP");
  assert.equal(normalizeCurrencyCode("gbp"), "GBP");
  assert.equal(normalizeCurrencyCode(" GBP "), "GBP");
});

test("formatCurrency accepts symbol currencies without throwing", () => {
  assert.equal(formatCurrency(12.5, "\u00a3"), "\u00a312.50");
  assert.equal(formatCurrency(12.5, "GBP"), "\u00a312.50");
});

test("getAvailabilityLabel supports the detail-page partial stock label", () => {
  assert.equal(getAvailabilityLabel("partial_stock"), "Partial stock");
});

test("getProductDetailAvailability returns partial_stock when variations are mixed", () => {
  assert.equal(
    getProductDetailAvailability({
      availability: "in_stock",
      variations: [{ availability: "in_stock" } as any, { availability: "out_of_stock" } as any],
    }),
    "partial_stock",
  );
});
