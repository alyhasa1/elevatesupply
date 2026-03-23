import assert from "node:assert/strict";
import test from "node:test";

import { buildAdminCatalogPage } from "./adminCatalog";
import type { CatalogProduct, CatalogSnapshot } from "./types";

function makeProduct(overrides: Partial<CatalogProduct>): CatalogProduct {
  return {
    id: `${overrides.trackerId || "tims_textile"}:${overrides.listingId || "demo"}`,
    trackerId: "tims_textile",
    trackerName: "Tims Textile Stock",
    listingId: "demo",
    title: "Demo Product",
    description: "",
    sku: "demo",
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
    variations: [],
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
    makeProduct({ listingId: "TT-1", title: "Blue Duvet", trackerId: "tims_textile", trackerName: "Tims Textile Stock" }),
    makeProduct({ listingId: "TT-2", title: "Grey Duvet", trackerId: "tims_textile", trackerName: "Tims Textile Stock" }),
    makeProduct({ listingId: "TK-1", title: "TikTok Lamp", trackerId: "tiktok_ds", trackerName: "TikTok DS Stock" }),
    makeProduct({ listingId: "WH-1", title: "Wholesale Mug", trackerId: "wholesale_items", trackerName: "Wholesale Items Stock" }),
    makeProduct({ listingId: "PJ-1", title: "Pakistani Jacket Navy", trackerId: "pakistani_jackets", trackerName: "Pakistani Jackets Stock" }),
  ],
};

test("buildAdminCatalogPage filters by tracker and search before paginating", () => {
  const page = buildAdminCatalogPage(snapshot, {
    tracker: "tims_textile",
    q: "duvet",
    page: "1",
    pageSize: "1",
  });

  assert.equal(page.total, 2);
  assert.equal(page.products.length, 1);
  assert.equal(page.products[0]?.listingId, "TT-1");
  assert.equal(page.totalPages, 2);
  assert.equal(page.query.tracker, "tims_textile");
  assert.equal(page.query.q, "duvet");
});

test("buildAdminCatalogPage clamps invalid paging and returns the last real page", () => {
  const page = buildAdminCatalogPage(snapshot, {
    page: "999",
    pageSize: "2",
  });

  assert.equal(page.page, 3);
  assert.equal(page.pageSize, 2);
  assert.equal(page.products.length, 1);
  assert.equal(page.products[0]?.listingId, "PJ-1");
  assert.equal(page.hasPreviousPage, true);
  assert.equal(page.hasNextPage, false);
});
