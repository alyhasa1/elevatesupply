import { TRACKERS } from "./trackers";
import { buildCatalogApiUrl, normalizeCatalogApiBase } from "./apiConfig";
import { buildCatalogAuthHeaders } from "./requestAuth";
import type { AdminCatalogPage, CatalogProduct, CatalogSnapshot, TrackerId } from "./types";

const API_BASE = normalizeCatalogApiBase(import.meta.env.VITE_ELEVATE_CATALOG_API_URL);

function buildUrl(path: string): string {
  return buildCatalogApiUrl(API_BASE, path);
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const message = await response.text();
    throw new Error(`Catalog API returned a non-JSON response from ${url}: ${message.slice(0, 160)}`);
  }

  return (await response.json()) as T;
}

export function createEmptySnapshot(): CatalogSnapshot {
  return {
    trackers: TRACKERS,
    products: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export function createEmptyAdminCatalogPage(): AdminCatalogPage {
  return {
    trackers: TRACKERS,
    products: [],
    updatedAt: new Date(0).toISOString(),
    total: 0,
    page: 1,
    pageSize: 24,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    query: {
      page: 1,
      pageSize: 24,
      q: "",
      tracker: "all",
    },
  };
}

export async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  return requestJson<CatalogSnapshot>("/catalog");
}

export async function fetchAdminCatalogPage(
  token: string,
  params: {
    page?: number;
    pageSize?: number;
    q?: string;
    tracker?: TrackerId | "all";
  },
): Promise<AdminCatalogPage> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.q) searchParams.set("q", params.q);
  if (params.tracker && params.tracker !== "all") searchParams.set("tracker", params.tracker);

  const suffix = searchParams.toString();
  return requestJson<AdminCatalogPage>(
    `/admin/catalog${suffix ? `?${suffix}` : ""}`,
    withBearer(token, { method: "GET" }),
  );
}

export async function fetchCatalogProduct(
  trackerId: TrackerId,
  listingId: string,
): Promise<CatalogProduct> {
  return requestJson<CatalogProduct>(`/products/${trackerId}/${encodeURIComponent(listingId)}`);
}

function withBearer(token: string, init: RequestInit): RequestInit {
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...buildCatalogAuthHeaders(token),
      ...(init.headers || {}),
    },
  };
}

export async function patchListingPriceOverride(
  token: string,
  payload: { trackerId: TrackerId; listingId: string; basePrice?: number; clearOverride?: boolean },
) {
  return requestJson<{ success: boolean; product: CatalogProduct | null }>(
    "/admin/prices/listing",
    withBearer(
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function patchVariationPriceOverride(
  token: string,
  payload: {
    trackerId: TrackerId;
    listingId: string;
    variationId: string;
    basePrice?: number;
    clearOverride?: boolean;
  },
) {
  return requestJson<{ success: boolean; product: CatalogProduct | null }>(
    "/admin/prices/variation",
    withBearer(
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function patchShippingOverride(
  token: string,
  payload: { listingId: string; shippingPrice?: number; clearOverride?: boolean },
) {
  return requestJson<{ success: boolean; product: CatalogProduct | null }>(
    "/admin/prices/shipping",
    withBearer(
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function patchJacketListing(
  token: string,
  listingId: string,
  payload: Record<string, unknown>,
) {
  return requestJson<{ success: boolean; product: CatalogProduct | null }>(
    `/admin/jackets/listings/${encodeURIComponent(listingId)}`,
    withBearer(
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function patchJacketVariation(
  token: string,
  variationId: string,
  payload: Record<string, unknown>,
) {
  return requestJson<{ success: boolean; variationId: string }>(
    `/admin/jackets/variations/${encodeURIComponent(variationId)}`,
    withBearer(
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),
  );
}
