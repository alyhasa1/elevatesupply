import { calculateTrackerDisplayPrice } from "./pricing";
import { normalizeCurrencyCode } from "./format";
import { getTrackerDefinition } from "./trackers";
import type {
  Availability,
  BaseListingRecord,
  BaseVariationRecord,
  CatalogProduct,
  CatalogVariation,
  TrackerId,
} from "./types";

export interface LiveCatalogOverrideMaps {
  listingPriceOverrides: Map<string, number>;
  variationPriceOverrides: Map<string, number>;
  listingShippingOverrides: Map<string, number>;
}

export function makeListingKey(trackerId: TrackerId, listingId: string): string {
  return `${trackerId}:${listingId}`;
}

export function makeVariationKey(trackerId: TrackerId, variationId: string): string {
  return `${trackerId}:${variationId}`;
}

export function asBoolean(value: boolean | number | null | undefined): boolean {
  return value === true || value === 1;
}

export function deriveVariationName(variation: Pick<BaseVariationRecord, "name" | "selects">): string {
  if (variation.name?.trim()) return variation.name.trim();
  const values = Object.entries(variation.selects || {})
    .filter(([key, value]) => !key.toLowerCase().includes("signal") && value)
    .map(([, value]) => value.trim())
    .filter(Boolean);
  return values.join(" / ");
}

export function getAvailability(input: {
  ended?: boolean | number | null;
  outOfStock?: boolean | number | null;
  variations?: Array<{ out_of_stock?: boolean | number | null }> | null;
}): Availability {
  if (asBoolean(input.ended)) return "ended";

  const variations = input.variations || [];
  if (variations.length > 0) {
    return variations.every((variation) => asBoolean(variation.out_of_stock)) ? "out_of_stock" : "in_stock";
  }

  return asBoolean(input.outOfStock) ? "out_of_stock" : "in_stock";
}

export function normalizeVariation(
  trackerId: TrackerId,
  variation: BaseVariationRecord,
  shippingPrice: number,
  overrideBasePrice: number | null,
): CatalogVariation {
  const sourceBasePrice = Number(variation.price) || 0;
  const basePrice = overrideBasePrice ?? sourceBasePrice;
  const name = deriveVariationName(variation) || variation.var_id;

  return {
    id: variation.id,
    listingId: variation.listing_id,
    varId: variation.var_id,
    name,
    basePrice,
    displayPrice: calculateTrackerDisplayPrice(trackerId, basePrice, shippingPrice),
    currency: normalizeCurrencyCode(variation.currency),
    availability: asBoolean(variation.out_of_stock) ? "out_of_stock" : "in_stock",
    selects: variation.selects || (name ? { Name: name } : {}),
    heroImage: variation.image || null,
    projectOverrideBasePrice: overrideBasePrice,
  };
}

export function normalizeLiveCatalogProduct<TVariation extends BaseVariationRecord>(
  trackerId: TrackerId,
  listing: BaseListingRecord<TVariation>,
  overrides: LiveCatalogOverrideMaps,
): CatalogProduct {
  const tracker = getTrackerDefinition(trackerId);
  const listingKey = makeListingKey(trackerId, listing.listing_id);
  const sourceShippingPrice = Number(listing.shipping_price) || 0;
  const shippingPrice =
    overrides.listingShippingOverrides.get(listingKey) ?? sourceShippingPrice;
  const projectOverrideBasePrice = overrides.listingPriceOverrides.get(listingKey) ?? null;
  const variations = (listing.variations || []).map((variation) =>
    normalizeVariation(
      trackerId,
      variation,
      shippingPrice,
      overrides.variationPriceOverrides.get(makeVariationKey(trackerId, variation.id)) ?? null,
    ),
  );

  const variationBasePrice =
    variations.length > 0 ? Math.min(...variations.map((variation) => variation.basePrice)) : null;
  const sourceBasePrice = Number(listing.price) || 0;
  const basePrice = projectOverrideBasePrice ?? variationBasePrice ?? sourceBasePrice;

  return {
    id: `${trackerId}:${listing.listing_id}`,
    trackerId,
    trackerName: tracker.name,
    listingId: listing.listing_id,
    title: listing.title,
    description: listing.description || "",
    sku: listing.listing_id,
    currency: normalizeCurrencyCode(listing.currency),
    basePrice,
    displayPrice: calculateTrackerDisplayPrice(trackerId, basePrice, shippingPrice),
    shippingPrice,
    image: listing.image || listing.images?.[0] || null,
    images: listing.images || (listing.image ? [listing.image] : []),
    availability: getAvailability({
      ended: listing.ended,
      outOfStock: listing.out_of_stock,
      variations: listing.variations,
    }),
    url: listing.url || null,
    handlingNote: listing.handling_time || null,
    updatedAt: listing.updated_at || listing.scraped_at || null,
    variations,
    projectOverrideBasePrice,
    projectOverrideShippingPrice: overrides.listingShippingOverrides.get(listingKey) ?? null,
    adminEditable: trackerId !== "account_building",
  };
}

export function normalizeJacketCatalogProduct<TVariation extends BaseVariationRecord>(
  listing: BaseListingRecord<TVariation>,
): CatalogProduct {
  const trackerId: TrackerId = "pakistani_jackets";
  const tracker = getTrackerDefinition(trackerId);
  const variations = (listing.variations || []).map((variation) =>
    normalizeVariation(trackerId, variation, 0, null),
  );
  const variationBasePrice =
    variations.length > 0 ? Math.min(...variations.map((variation) => variation.basePrice)) : null;
  const sourceBasePrice = Number(listing.price) || 0;
  const basePrice = variationBasePrice ?? sourceBasePrice;

  return {
    id: `${trackerId}:${listing.listing_id}`,
    trackerId,
    trackerName: tracker.name,
    listingId: listing.listing_id,
    title: listing.title,
    description: listing.description || "",
    sku: listing.listing_id,
    currency: normalizeCurrencyCode(listing.currency),
    basePrice,
    displayPrice: calculateTrackerDisplayPrice(trackerId, basePrice),
    shippingPrice: Number(listing.shipping_price) || 0,
    image: listing.image || listing.images?.[0] || null,
    images: listing.images || (listing.image ? [listing.image] : []),
    availability: getAvailability({
      ended: listing.ended,
      outOfStock: listing.out_of_stock,
      variations: listing.variations,
    }),
    url: listing.url || null,
    handlingNote: listing.handling_time || null,
    updatedAt: listing.updated_at || listing.scraped_at || null,
    variations,
    projectOverrideBasePrice: null,
    projectOverrideShippingPrice: null,
    adminEditable: true,
  };
}
