import type { AdminCatalogPage, CatalogProduct, CatalogSnapshot, TrackerId } from "./types";

export interface AdminCatalogQueryInput {
  page?: number | string | null;
  pageSize?: number | string | null;
  q?: string | null;
  tracker?: string | null;
}

export const DEFAULT_ADMIN_PAGE_SIZE = 24;
const MAX_ADMIN_PAGE_SIZE = 60;

function toPositiveInt(value: number | string | null | undefined, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

function toTrackerFilter(value: string | null | undefined): TrackerId | "all" {
  switch (value) {
    case "tims_textile":
    case "tiktok_ds":
    case "wholesale_items":
    case "pakistani_jackets":
    case "account_building":
      return value;
    default:
      return "all";
  }
}

export function normalizeAdminCatalogQuery(input: AdminCatalogQueryInput) {
  return {
    page: toPositiveInt(input.page, 1),
    pageSize: Math.min(toPositiveInt(input.pageSize, DEFAULT_ADMIN_PAGE_SIZE), MAX_ADMIN_PAGE_SIZE),
    q: String(input.q || "").trim().toLowerCase(),
    tracker: toTrackerFilter(input.tracker),
  };
}

export function filterAdminCatalogProducts(
  products: CatalogProduct[],
  query: ReturnType<typeof normalizeAdminCatalogQuery>,
): CatalogProduct[] {
  return products.filter((product) => {
    const matchesTracker = query.tracker === "all" || product.trackerId === query.tracker;
    if (!matchesTracker) return false;
    if (!query.q) return true;

    return (
      product.title.toLowerCase().includes(query.q) ||
      product.listingId.toLowerCase().includes(query.q) ||
      product.trackerName.toLowerCase().includes(query.q)
    );
  });
}

export function buildAdminCatalogPage(snapshot: CatalogSnapshot, input: AdminCatalogQueryInput): AdminCatalogPage {
  const query = normalizeAdminCatalogQuery(input);
  const filtered = filterAdminCatalogProducts(snapshot.products, query);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    trackers: snapshot.trackers,
    updatedAt: snapshot.updatedAt,
    products: filtered.slice(start, start + query.pageSize),
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    query: {
      page,
      pageSize: query.pageSize,
      q: query.q,
      tracker: query.tracker,
    },
  };
}
