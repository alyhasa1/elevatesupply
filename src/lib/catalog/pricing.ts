import type { TrackerId } from "./types";

export function calculatePayPalInclusiveAmount(baseAmountGbp: number): number {
  const base = Number(baseAmountGbp);
  if (!Number.isFinite(base) || base <= 0) return 0;
  const newPrice = (base + 0.3) / 0.971;
  return Number(newPrice.toFixed(2));
}

export function calculateTrackerDisplayPrice(
  trackerId: TrackerId,
  basePrice: number,
  shippingPrice: number | null = null,
): number {
  const base = Number(basePrice) || 0;
  const shipping = Number(shippingPrice) || 0;

  switch (trackerId) {
    case "tiktok_ds":
      return calculatePayPalInclusiveAmount(base + 0.5);
    case "wholesale_items":
      return calculatePayPalInclusiveAmount(base + shipping + 0.5);
    case "tims_textile":
    case "pakistani_jackets":
    case "account_building":
    default:
      return calculatePayPalInclusiveAmount(base);
  }
}
