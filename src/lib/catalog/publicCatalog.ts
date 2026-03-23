import { TRACKERS } from "./trackers";
import type {
  CatalogAvailabilityFilter,
  CatalogProduct,
  CatalogVariation,
  CatalogSnapshot,
  HomeCatalogPayload,
  PublicCatalogPage,
  PublicCatalogPageQuery,
  TrackerId,
} from "./types";
import { isUpdatedWithinHours } from "./format";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 48;

function normalizePage(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function normalizePageSize(value: number | string | null | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(parsed)));
}

function normalizeTracker(value: string | null | undefined): TrackerId | "all" {
  return TRACKERS.some((tracker) => tracker.id === value) ? (value as TrackerId) : "all";
}

function normalizeAvailability(value: string | null | undefined): CatalogAvailabilityFilter {
  return value === "in_stock" || value === "out_of_stock" || value === "ended" ? value : "all";
}

function matchesSearch(product: CatalogProduct, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    product.title.toLowerCase().includes(needle) ||
    product.listingId.toLowerCase().includes(needle) ||
    product.trackerName.toLowerCase().includes(needle)
  );
}

function filterProducts(products: CatalogProduct[], query: PublicCatalogPageQuery): CatalogProduct[] {
  return products.filter((product) => {
    if (query.tracker !== "all" && product.trackerId !== query.tracker) return false;
    if (query.availability !== "all" && product.availability !== query.availability) return false;
    return matchesSearch(product, query.q);
  });
}

function toPublicCatalogVariation(variation: CatalogVariation): CatalogVariation {
  const { projectOverrideBasePrice: _projectOverrideBasePrice, ...publicVariation } = variation;
  return publicVariation;
}

export function toPublicCatalogProduct(product: CatalogProduct): CatalogProduct {
  const {
    projectOverrideBasePrice: _projectOverrideBasePrice,
    projectOverrideShippingPrice: _projectOverrideShippingPrice,
    adminEditable: _adminEditable,
    variations,
    ...publicProduct
  } = product;

  return {
    ...publicProduct,
    variations: variations.map((variation) => toPublicCatalogVariation(variation)),
  };
}

export function toPublicCatalogSnapshot(snapshot: CatalogSnapshot): CatalogSnapshot {
  return {
    ...snapshot,
    products: snapshot.products.map((product) => toPublicCatalogProduct(product)),
  };
}

export function normalizePublicCatalogQuery(input: Partial<PublicCatalogPageQuery>): PublicCatalogPageQuery {
  return {
    page: normalizePage(input.page),
    pageSize: normalizePageSize(input.pageSize),
    q: typeof input.q === "string" ? input.q.trim() : "",
    tracker: normalizeTracker(input.tracker),
    availability: normalizeAvailability(input.availability),
  };
}

export function buildPublicCatalogPage(
  snapshot: CatalogSnapshot,
  input: Partial<PublicCatalogPageQuery>,
): PublicCatalogPage {
  const query = normalizePublicCatalogQuery(input);
  const filtered = filterProducts(snapshot.products, query);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  const products = filtered.slice(start, start + query.pageSize);

  return {
    trackers: snapshot.trackers,
    updatedAt: snapshot.updatedAt,
    products: products.map((product) => toPublicCatalogProduct(product)),
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    query: {
      ...query,
      page,
    },
  };
}

export function buildHomeCatalogPayload(snapshot: CatalogSnapshot): HomeCatalogPayload {
  const featuredProducts = snapshot.products.slice(0, 4);
  const recentProducts = snapshot.products.filter((product) => isUpdatedWithinHours(product, 24));
  const fallbackPool = snapshot.products.filter((product) => !featuredProducts.some((entry) => entry.id === product.id));
  const secondaryProducts = [...recentProducts, ...fallbackPool].filter(
    (product, index, array) => array.findIndex((entry) => entry.id === product.id) === index,
  );

  return {
    trackers: snapshot.trackers,
    featuredProducts: featuredProducts.map((product) => toPublicCatalogProduct(product)),
    recentProducts: secondaryProducts.slice(0, 4).map((product) => toPublicCatalogProduct(product)),
    liveCount: snapshot.products.filter((product) => product.availability === "in_stock").length,
    updatedAt: snapshot.updatedAt,
  };
}
