import type { CatalogProduct, CatalogSnapshot } from "./types";

function normalizeBaseOrigin(baseUrl: string): URL {
  return new URL(baseUrl);
}

export function buildCatalogImageProxyUrl(baseUrl: string, imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  let parsedImageUrl: URL;
  try {
    parsedImageUrl = new URL(imageUrl);
  } catch {
    return imageUrl;
  }

  if (!["http:", "https:"].includes(parsedImageUrl.protocol)) {
    return imageUrl;
  }

  const baseOrigin = normalizeBaseOrigin(baseUrl).origin;
  if (parsedImageUrl.origin === baseOrigin && parsedImageUrl.pathname === "/img") {
    return imageUrl;
  }

  return `${baseOrigin}/img?url=${encodeURIComponent(parsedImageUrl.toString())}`;
}

export function proxyCatalogProductImages(product: CatalogProduct, baseUrl: string): CatalogProduct {
  return {
    ...product,
    image: buildCatalogImageProxyUrl(baseUrl, product.image),
    images: product.images.map((image) => buildCatalogImageProxyUrl(baseUrl, image)).filter(Boolean) as string[],
  };
}

export function proxyCatalogSnapshotImages(snapshot: CatalogSnapshot, baseUrl: string): CatalogSnapshot {
  return {
    ...snapshot,
    products: snapshot.products.map((product) => proxyCatalogProductImages(product, baseUrl)),
  };
}
