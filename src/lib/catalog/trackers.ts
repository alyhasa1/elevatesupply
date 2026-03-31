import type { TrackerDefinition } from "./types";

export const TRACKERS: TrackerDefinition[] = [
  {
    id: "tims_textile",
    name: "Textile stock",
    slug: "tims-textile-stock",
    description: "Live stock from the Tims Textile tracker with project-specific pricing on top.",
    statusText: "Live",
    bgImage: "https://cdn.mos.cms.futurecdn.net/LuN43AwybGsJxE99bsY4rP.jpg"
  },
  {
    id: "tiktok_ds",
    name: "TikTok DS Stock",
    slug: "tiktok-ds-stock",
    description: "TikTok dropshipping source listings with the existing 50p uplift and PayPal fee behavior.",
    statusText: "Live",
    bgImage: "https://cloudfront-us-east-1.images.arcpublishing.com/opb/JK7C7DSEFN7GFVHLDAXZAK3N5I.jpg"
  },
  {
    id: "wholesale_items",
    name: "Wholesale Items Stock",
    slug: "wholesale-items-stock",
    description: "Wholesale inventory with per-listing shipping and project-local pricing overrides.",
    statusText: "Live",
    bgImage: "https://www.marthastewart.com/thmb/5-tU9WNL8xWSktJJuW1ny9cRBqQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ms-natural-cleaners-b420e0ed9b14456b9f37e4cdf7029b84.jpg"
  },
  {
    id: "account_building",
    name: "Account Building Stock",
    slug: "account-building-stock",
    description: "One fixed low-cost item kept for account-building orders.",
    statusText: "Live",
    bgImage: "https://cdn.thewirecutter.com/wp-content/media/2022/12/lightningcables-2048px-2471.jpg?width=2048&quality=60&crop=2048:1365&auto=webp"
  },
];

export const TRACKER_NAME_MAP = new Map(TRACKERS.map((tracker) => [tracker.id, tracker.name]));

export function getTrackerDefinition(trackerId: TrackerDefinition["id"]): TrackerDefinition {
  return TRACKERS.find((tracker) => tracker.id === trackerId) ?? TRACKERS[0];
}
