import type { Availability, CatalogProduct } from "./types";

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

export function getAvailabilityLabel(availability: Availability): string {
  switch (availability) {
    case "ended":
      return "Ended";
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
