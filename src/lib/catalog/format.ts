import type { Availability, CatalogProduct } from "./types";

export type DetailAvailability = Availability | "partial_stock";

const currencyAliases: Record<string, string> = {
  "£": "GBP",
  gbp: "GBP",
  "$": "USD",
  usd: "USD",
  "€": "EUR",
  eur: "EUR",
};

export function normalizeCurrencyCode(currency: string | null | undefined, fallback = "GBP"): string {
  const raw = currency?.trim();
  if (!raw) return fallback;

  const alias = currencyAliases[raw] || currencyAliases[raw.toLowerCase()];
  const normalized = alias || raw.toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : fallback;
}

export function formatCurrency(value: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: normalizeCurrencyCode(currency),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getProductDetailAvailability(
  product: Pick<CatalogProduct, "availability" | "variations">,
): DetailAvailability {
  if (product.availability === "ended") {
    return "ended";
  }

  if (product.variations.length === 0) {
    return product.availability;
  }

  const hasAvailableVariation = product.variations.some((variation) => variation.availability === "in_stock");
  const hasUnavailableVariation = product.variations.some((variation) => variation.availability !== "in_stock");

  if (hasAvailableVariation && hasUnavailableVariation) {
    return "partial_stock";
  }

  return hasAvailableVariation ? "in_stock" : "out_of_stock";
}

export function getAvailabilityLabel(availability: DetailAvailability): string {
  switch (availability) {
    case "ended":
      return "Ended";
    case "partial_stock":
      return "Partial stock";
    case "out_of_stock":
      return "Out of stock";
    case "in_stock":
    default:
      return "In stock";
  }
}

export function isUpdatedWithinHours(product: CatalogProduct, hours: number): boolean {
  if (!product.updatedAt) return false;
  const updatedAt = Date.parse(product.updatedAt);
  if (Number.isNaN(updatedAt)) return false;
  return Date.now() - updatedAt <= hours * 60 * 60 * 1000;
}
