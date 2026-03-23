import type {
  CatalogProduct,
  ListingContentOverride,
  VariationMediaOverrideMap,
} from "./types";

interface ApplyContentOverrideOptions {
  publicView: boolean;
}

export function buildVariationMediaOverrideKey(trackerId: CatalogProduct["trackerId"], variationId: string): string {
  return `${trackerId}:${variationId}`;
}

export function applyCatalogContentOverrides(
  product: CatalogProduct,
  listingOverride: ListingContentOverride | null,
  variationOverrides: VariationMediaOverrideMap,
  options: ApplyContentOverrideOptions,
): CatalogProduct {
  const description = listingOverride?.description ?? product.description;
  const image = listingOverride?.image ?? product.image;
  const images =
    listingOverride?.images && listingOverride.images.length > 0
      ? listingOverride.images
      : product.images;

  return {
    ...product,
    description,
    image,
    images,
    url: options.publicView && product.trackerId === "wholesale_items" ? null : product.url,
    variations: product.variations.map((variation) => ({
      ...variation,
      heroImage: variationOverrides.get(buildVariationMediaOverrideKey(product.trackerId, variation.id))?.heroImage ?? variation.heroImage ?? null,
    })),
  };
}
