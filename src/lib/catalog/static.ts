import type { CatalogProduct } from "./types";
import { calculateTrackerDisplayPrice } from "./pricing";
import { getTrackerDefinition } from "./trackers";

export function createAccountBuildingProduct(): CatalogProduct {
  const tracker = getTrackerDefinition("account_building");
  const basePrice = 3.3;
  const images = [
    "https://i.ebayimg.com/images/g/rV4AAeSwFG5pYs2n/s-l1600.png",
    "https://i.ebayimg.com/images/g/AGQAAeSwq4dpYs2n/s-l1600.png",
    "https://i.ebayimg.com/images/g/LLcAAeSwvEFpYs2n/s-l1600.png",
    "https://i.ebayimg.com/images/g/HjYAAeSwzlJpYs2n/s-l1600.png",
    "https://i.ebayimg.com/images/g/sKwAAeSwvLZpYs2n/s-l1600.png",
  ];

  return {
    id: "account_building:277641681347",
    trackerId: tracker.id,
    trackerName: tracker.name,
    listingId: "277641681347",
    title: "Iphone Cable Short 1FT/30CM Nylon Braided Iphone Charger Cable",
    description:
      "Fixed single product used for account-building orders. This item stays read-only in v1.",
    sku: "277641681347",
    currency: "GBP",
    basePrice,
    displayPrice: calculateTrackerDisplayPrice("account_building", basePrice),
    shippingPrice: 0,
    image: images[0] ?? null,
    images,
    availability: "in_stock",
    url: "https://www.ebay.co.uk/itm/277641681347",
    handlingNote: "Dispatched within 2 business days.",
    updatedAt: null,
    variations: [
      {
        id: "277641681347_standard",
        listingId: "277641681347",
        varId: "standard",
        name: "Standard",
        basePrice,
        displayPrice: calculateTrackerDisplayPrice("account_building", basePrice),
        currency: "GBP",
        availability: "in_stock",
        selects: { Variant: "Standard" },
        projectOverrideBasePrice: null,
      },
    ],
    projectOverrideBasePrice: null,
    projectOverrideShippingPrice: null,
    adminEditable: false,
  };
}
