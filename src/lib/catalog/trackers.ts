import type { TrackerDefinition } from "./types";

export const TRACKERS: TrackerDefinition[] = [
  {
    id: "tims_textile",
    name: "Tims Textile Stock",
    slug: "tims-textile-stock",
    description: "Live stock from the Tims Textile tracker with project-specific pricing on top.",
    statusText: "Live",
  },
  {
    id: "tiktok_ds",
    name: "TikTok DS Stock",
    slug: "tiktok-ds-stock",
    description: "TikTok dropshipping source listings with the existing 50p uplift and PayPal fee behavior.",
    statusText: "Live",
  },
  {
    id: "wholesale_items",
    name: "Wholesale Items Stock",
    slug: "wholesale-items-stock",
    description: "Wholesale inventory with per-listing shipping and project-local pricing overrides.",
    statusText: "Live",
  },
  {
    id: "pakistani_jackets",
    name: "Pakistani Jackets Stock",
    slug: "pakistani-jackets-stock",
    description: "Pakistani jackets owned by this project in D1 and editable by admins.",
    statusText: "Live",
  },
  {
    id: "account_building",
    name: "Account Building Stock",
    slug: "account-building-stock",
    description: "One fixed low-cost item kept for account-building orders.",
    statusText: "Live",
  },
];

export const TRACKER_NAME_MAP = new Map(TRACKERS.map((tracker) => [tracker.id, tracker.name]));

export function getTrackerDefinition(trackerId: TrackerDefinition["id"]): TrackerDefinition {
  return TRACKERS.find((tracker) => tracker.id === trackerId) ?? TRACKERS[0];
}
