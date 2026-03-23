import assert from "node:assert/strict";
import test from "node:test";

import { applyCatalogContentOverrides } from "./contentOverrides";
import type { CatalogProduct, CatalogVariation, ListingContentOverride, VariationMediaOverrideMap } from "./types";

function makeVariation(id: string, overrides: Partial<CatalogVariation> = {}): CatalogVariation {
  return {
    id,
    listingId: "LIST-1",
    varId: id,
    name: id,
    basePrice: 10,
    displayPrice: 10.61,
    currency: "GBP",
    availability: "in_stock",
    selects: {},
    heroImage: null,
    projectOverrideBasePrice: null,
    ...overrides,
  };
}

const product: CatalogProduct = {
  id: "wholesale_items:LIST-1",
  trackerId: "wholesale_items",
  trackerName: "Wholesale Items Stock",
  listingId: "LIST-1",
  title: "Overlay Demo",
  description: "Source description",
  sku: "LIST-1",
  currency: "GBP",
  basePrice: 10,
  displayPrice: 13.18,
  shippingPrice: 2,
  image: "https://example.com/source.jpg",
  images: ["https://example.com/source.jpg", "https://example.com/source-2.jpg"],
  availability: "in_stock",
  url: "https://example.com/source-listing",
  handlingNote: null,
  updatedAt: "2026-03-23T00:00:00.000Z",
  variations: [
    makeVariation("LIST-1-red"),
    makeVariation("LIST-1-blue"),
  ],
  projectOverrideBasePrice: null,
  projectOverrideShippingPrice: null,
  adminEditable: true,
};

test("applyCatalogContentOverrides applies listing overrides, variation hero images, and hides wholesale public urls", () => {
  const listingOverride: ListingContentOverride = {
    trackerId: "wholesale_items",
    listingId: "LIST-1",
    description: "Admin description",
    image: "https://example.com/admin-cover.jpg",
    images: ["https://example.com/admin-cover.jpg", "https://example.com/admin-gallery.jpg"],
  };
  const variationOverrides: VariationMediaOverrideMap = new Map([
    ["wholesale_items:LIST-1-red", { heroImage: "https://example.com/red.jpg" }],
  ]);

  const merged = applyCatalogContentOverrides(product, listingOverride, variationOverrides, { publicView: true });

  assert.equal(merged.description, "Admin description");
  assert.equal(merged.image, "https://example.com/admin-cover.jpg");
  assert.deepEqual(merged.images, [
    "https://example.com/admin-cover.jpg",
    "https://example.com/admin-gallery.jpg",
  ]);
  assert.equal(merged.variations[0]?.heroImage, "https://example.com/red.jpg");
  assert.equal(merged.variations[1]?.heroImage, null);
  assert.equal(merged.url, null);
});

test("applyCatalogContentOverrides falls back to source data when no overrides are present", () => {
  const merged = applyCatalogContentOverrides(product, null, new Map(), { publicView: false });

  assert.equal(merged.description, product.description);
  assert.equal(merged.image, product.image);
  assert.deepEqual(merged.images, product.images);
  assert.equal(merged.url, product.url);
});
