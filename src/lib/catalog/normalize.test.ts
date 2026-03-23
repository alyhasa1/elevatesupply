import assert from "node:assert/strict";
import test from "node:test";

import {
  getAvailability,
  makeListingKey,
  makeVariationKey,
  normalizeLiveCatalogProduct,
  type LiveCatalogOverrideMaps,
} from "./normalize";

test("getAvailability treats ended as the highest priority state", () => {
  assert.equal(
    getAvailability({
      ended: true,
      outOfStock: false,
      variations: [{ out_of_stock: false }, { out_of_stock: false }],
    }),
    "ended",
  );
});

test("getAvailability returns out_of_stock when every variation is unavailable", () => {
  assert.equal(
    getAvailability({
      ended: false,
      outOfStock: false,
      variations: [{ out_of_stock: true }, { out_of_stock: true }],
    }),
    "out_of_stock",
  );
});

test("normalizeLiveCatalogProduct applies project-local overrides without mutating the source model", () => {
  const overrides: LiveCatalogOverrideMaps = {
    listingPriceOverrides: new Map([[makeListingKey("wholesale_items", "A-1"), 14]]),
    listingShippingOverrides: new Map([[makeListingKey("wholesale_items", "A-1"), 4]]),
    variationPriceOverrides: new Map([[makeVariationKey("wholesale_items", "A-1_blue"), 16]]),
  };

  const product = normalizeLiveCatalogProduct(
    "wholesale_items",
    {
      listing_id: "A-1",
      title: "Wholesale Demo",
      price: 11,
      currency: "GBP",
      image: "https://example.com/a.jpg",
      images: ["https://example.com/a.jpg"],
      url: "https://example.com/a",
      handling_time: "Dispatched within 2 business days",
      shipping_price: 2,
      ended: false,
      out_of_stock: false,
      updated_at: "2026-03-19T00:00:00.000Z",
      variations: [
        {
          id: "A-1_blue",
          listing_id: "A-1",
          var_id: "blue",
          price: 12,
          currency: "GBP",
          out_of_stock: false,
          selects: { Colour: "Blue" },
        },
      ],
    },
    overrides,
  );

  assert.equal(product.basePrice, 14);
  assert.equal(product.shippingPrice, 4);
  assert.equal(product.displayPrice, 19.36);
  assert.equal(product.variations[0]?.basePrice, 16);
  assert.equal(product.variations[0]?.displayPrice, 21.42);
  assert.equal(product.variations[0]?.name, "Blue");
  assert.equal(product.trackerId, "wholesale_items");
});

test("normalizeLiveCatalogProduct normalizes symbol currencies to ISO currency codes", () => {
  const overrides: LiveCatalogOverrideMaps = {
    listingPriceOverrides: new Map(),
    listingShippingOverrides: new Map(),
    variationPriceOverrides: new Map(),
  };

  const product = normalizeLiveCatalogProduct(
    "wholesale_items",
    {
      listing_id: "A-2",
      title: "Wholesale Currency Demo",
      price: 10,
      currency: "£",
      image: null,
      images: [],
      url: null,
      shipping_price: 1,
      ended: false,
      out_of_stock: false,
      variations: [
        {
          id: "A-2_red",
          listing_id: "A-2",
          var_id: "red",
          price: 11,
          currency: "£",
          out_of_stock: false,
          selects: { Colour: "Red" },
        },
      ],
    },
    overrides,
  );

  assert.equal(product.currency, "GBP");
  assert.equal(product.variations[0]?.currency, "GBP");
});
