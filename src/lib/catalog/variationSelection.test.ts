import assert from "node:assert/strict";
import test from "node:test";

import { buildVariationOptionGroups, resolveVariationSelection } from "./variationSelection";
import type { CatalogProduct, CatalogVariation } from "./types";

function makeVariation(id: string, selects: Record<string, string>, overrides: Partial<CatalogVariation> = {}): CatalogVariation {
  return {
    id,
    listingId: "LIST-1",
    varId: id,
    name: Object.values(selects).join(" / "),
    basePrice: 10,
    displayPrice: 10.61,
    currency: "GBP",
    availability: "in_stock",
    selects,
    heroImage: null,
    projectOverrideBasePrice: null,
    ...overrides,
  };
}

const product: CatalogProduct = {
  id: "tims_textile:LIST-1",
  trackerId: "tims_textile",
  trackerName: "Textile stock",
  listingId: "LIST-1",
  title: "Variation Demo",
  description: "",
  sku: "LIST-1",
  currency: "GBP",
  basePrice: 10,
  displayPrice: 10.61,
  shippingPrice: null,
  image: null,
  images: [],
  availability: "in_stock",
  url: null,
  handlingNote: null,
  updatedAt: "2026-03-23T00:00:00.000Z",
  variations: [
    makeVariation("red-s", { Colour: "Red", colour_signal: "mostPopular", Size: "S" }),
    makeVariation("red-m", { Colour: "Red", Size: "M" }),
    makeVariation("blue-m", { Colour: "Blue", Size: "M" }),
  ],
  projectOverrideBasePrice: null,
  projectOverrideShippingPrice: null,
  adminEditable: true,
};

test("buildVariationOptionGroups groups real option keys and ignores signal metadata", () => {
  const groups = buildVariationOptionGroups(product.variations);

  assert.deepEqual(groups, [
    { key: "Colour", values: ["Blue", "Red"] },
    { key: "Size", values: ["M", "S"] },
  ]);
});

test("resolveVariationSelection keeps selection on a real variation when an invalid combination is requested", () => {
  const result = resolveVariationSelection(product, {
    Colour: "Blue",
    Size: "S",
  }, "Colour");

  assert.equal(result.variation.id, "blue-m");
  assert.deepEqual(result.selectedOptions, {
    Colour: "Blue",
    Size: "M",
  });
});
