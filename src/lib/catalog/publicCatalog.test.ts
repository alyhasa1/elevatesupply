import assert from "node:assert/strict";
import test from "node:test";

import { buildHomeCatalogPayload, buildPublicCatalogPage } from "./publicCatalog";
import type { CatalogProduct, CatalogSnapshot, CatalogVariation } from "./types";

function makeVariation(id: string): CatalogVariation {
  return {
    id,
    listingId: id,
    varId: id,
    name: id,
    basePrice: 10,
    displayPrice: 10.61,
    currency: "GBP",
    availability: "in_stock",
    selects: {},
    heroImage: null,
    projectOverrideBasePrice: null,
  };
}

function makeProduct(
  listingId: string,
  overrides: Partial<CatalogProduct> = {},
): CatalogProduct {
  return {
    id: `tims_textile:${listingId}`,
    trackerId: "tims_textile",
    trackerName: "Tims Textile Stock",
    listingId,
    title: `Product ${listingId}`,
    description: "",
    sku: listingId,
    currency: "GBP",
    basePrice: 10,
    displayPrice: 10.61,
    shippingPrice: null,
    image: `https://example.com/${listingId}.jpg`,
    images: [`https://example.com/${listingId}.jpg`],
    availability: "in_stock",
    url: `https://example.com/${listingId}`,
    handlingNote: null,
    updatedAt: "2026-03-23T00:00:00.000Z",
    variations: [makeVariation(`${listingId}-v1`)],
    projectOverrideBasePrice: null,
    projectOverrideShippingPrice: null,
    adminEditable: true,
    ...overrides,
  };
}

const snapshot: CatalogSnapshot = {
  trackers: [],
  updatedAt: "2026-03-23T00:00:00.000Z",
  products: [
    makeProduct("1", { title: "Alpha", availability: "in_stock" }),
    makeProduct("2", { title: "Bravo", availability: "out_of_stock", trackerId: "wholesale_items", trackerName: "Wholesale Items Stock" }),
    makeProduct("3", { title: "Charlie", availability: "ended", trackerId: "tiktok_ds", trackerName: "TikTok DS Stock" }),
    makeProduct("4", { title: "Delta", availability: "in_stock", trackerId: "pakistani_jackets", trackerName: "Pakistani Jackets Stock" }),
  ],
};

test("buildPublicCatalogPage filters by tracker, search, and availability before paginating", () => {
  const page = buildPublicCatalogPage(snapshot, {
    tracker: "all",
    q: "a",
    availability: "in_stock",
    page: 1,
    pageSize: 1,
  });

  assert.equal(page.total, 2);
  assert.equal(page.products.length, 1);
  assert.equal(page.products[0]?.title, "Alpha");
  assert.equal(page.totalPages, 2);
  assert.equal(page.hasNextPage, true);
  assert.equal(page.query.availability, "in_stock");
});

test("buildPublicCatalogPage clamps page bounds and keeps ended as a distinct filter", () => {
  const page = buildPublicCatalogPage(snapshot, {
    tracker: "tiktok_ds",
    q: "",
    availability: "ended",
    page: 4,
    pageSize: 24,
  });

  assert.equal(page.page, 1);
  assert.equal(page.total, 1);
  assert.equal(page.products[0]?.listingId, "3");
  assert.equal(page.hasPreviousPage, false);
  assert.equal(page.hasNextPage, false);
});

test("buildHomeCatalogPayload returns a curated storefront slice and live count", () => {
  const payload = buildHomeCatalogPayload(snapshot);

  assert.equal(payload.featuredProducts.length, 4);
  assert.equal(payload.recentProducts.length, 4);
  assert.equal(payload.liveCount, 2);
  assert.equal(payload.updatedAt, snapshot.updatedAt);
});

test("public catalog payloads do not expose admin-only override fields", () => {
  const page = buildPublicCatalogPage(snapshot, {
    tracker: "all",
    q: "",
    availability: "all",
    page: 1,
    pageSize: 24,
  });
  const payload = buildHomeCatalogPayload(snapshot);

  const publicProduct = page.products[0];
  const publicVariation = publicProduct?.variations[0];
  const featuredProduct = payload.featuredProducts[0];

  assert.equal(Object.hasOwn(publicProduct || {}, "projectOverrideBasePrice"), false);
  assert.equal(Object.hasOwn(publicProduct || {}, "projectOverrideShippingPrice"), false);
  assert.equal(Object.hasOwn(publicProduct || {}, "adminEditable"), false);
  assert.equal(Object.hasOwn(publicVariation || {}, "projectOverrideBasePrice"), false);
  assert.equal(Object.hasOwn(featuredProduct || {}, "projectOverrideBasePrice"), false);
  assert.equal(Object.hasOwn(featuredProduct || {}, "projectOverrideShippingPrice"), false);
  assert.equal(Object.hasOwn(featuredProduct || {}, "adminEditable"), false);
});
