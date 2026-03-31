import type { TrackerId } from "@/lib/catalog/types";

export type OrderSource =
  | "ebay_stock"
  | "tiktok_stock"
  | "wholesale_stock"
  | "account_building_stock"
  | "jackets_stock";

export function trackerIdToOrderSource(trackerId: TrackerId): OrderSource {
  switch (trackerId) {
    case "tims_textile":
      return "ebay_stock";
    case "tiktok_ds":
      return "tiktok_stock";
    case "wholesale_items":
      return "wholesale_stock";
    case "account_building":
      return "account_building_stock";
  }
}
