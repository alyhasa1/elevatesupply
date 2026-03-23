import {
  makeListingKey,
  makeVariationKey,
  normalizeJacketCatalogProduct,
  normalizeLiveCatalogProduct,
  type LiveCatalogOverrideMaps,
} from "../../../src/lib/catalog/normalize";
import type { AdminCatalogQueryInput } from "../../../src/lib/catalog/adminCatalog";
import { buildAdminCatalogPage } from "../../../src/lib/catalog/adminCatalog";
import { proxyCatalogProductImages, proxyCatalogSnapshotImages } from "../../../src/lib/catalog/imageProxy";
import { createAccountBuildingProduct } from "../../../src/lib/catalog/static";
import { TRACKERS, getTrackerDefinition } from "../../../src/lib/catalog/trackers";
import type { BaseListingRecord, BaseVariationRecord, CatalogProduct, CatalogSnapshot, TrackerId } from "../../../src/lib/catalog/types";

type D1Value = string | number | null;

interface D1PreparedStatement {
  bind(...values: D1Value[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface Env {
  DB: D1Database;
  TIMS_TEXTILE_API_URL: string;
  TIKTOK_DS_API_URL: string;
  WHOLESALE_ITEMS_API_URL: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS?: string;
}

type CloudflareFetchInit = RequestInit & {
  cf?: {
    cacheEverything?: boolean;
    cacheTtl?: number;
  };
};

interface UpstreamVariation extends BaseVariationRecord {
  selects?: Record<string, string> | null;
}

interface UpstreamListing extends BaseListingRecord<UpstreamVariation> {
  images?: string[] | null;
}

interface JacketVariationRow {
  id: string;
  listing_id: string;
  var_id: string;
  name?: string | null;
  base_price: number;
  currency?: string | null;
  out_of_stock?: boolean | number | null;
  selects?: string | Record<string, string> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface JacketListingRow {
  listing_id: string;
  title: string;
  description: string | null;
  image: string | null;
  images: string | null;
  url: string | null;
  currency: string | null;
  base_price: number;
  shipping_price: number | null;
  ended: number;
  out_of_stock: number;
  created_at: string | null;
  updated_at: string | null;
}

interface PriceOverrideRow {
  tracker_id: TrackerId;
  listing_id: string;
  base_price: number;
}

interface VariationOverrideRow {
  tracker_id: TrackerId;
  listing_id: string;
  variation_id: string;
  base_price: number;
}

interface ShippingOverrideRow {
  tracker_id: TrackerId;
  listing_id: string;
  shipping_price: number;
}

interface AdminUser {
  id: string;
  email?: string;
  user_metadata?: {
    is_admin?: boolean;
  };
}

interface AdminRow {
  is_admin?: boolean | null;
}

type LiveTrackerId = "tims_textile" | "tiktok_ds" | "wholesale_items";

const LIVE_TRACKERS: LiveTrackerId[] = ["tims_textile", "tiktok_ds", "wholesale_items"];

const TRACKER_BASE_URLS: Record<LiveTrackerId, (env: Env) => string> = {
  tims_textile: (env) => env.TIMS_TEXTILE_API_URL,
  tiktok_ds: (env) => env.TIKTOK_DS_API_URL,
  wholesale_items: (env) => env.WHOLESALE_ITEMS_API_URL,
};

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

function parseMaybeJson<T>(value: string | T | null | undefined, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toTrackerId(value: string): TrackerId | null {
  return TRACKERS.some((tracker) => tracker.id === value) ? (value as TrackerId) : null;
}

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const allowOrigin =
    allowedOrigins.length === 0 ? origin || "*" : allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin || "*",
    "Access-Control-Allow-Methods": "GET, PATCH, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function jsonResponse(request: Request, env: Env, body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...getCorsHeaders(request, env),
      ...(init.headers || {}),
    },
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

function toProxySafeUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

function withProxiedSnapshot(snapshot: CatalogSnapshot, request: Request): CatalogSnapshot {
  return proxyCatalogSnapshotImages(snapshot, request.url);
}

function withProxiedProduct(product: CatalogProduct, request: Request): CatalogProduct {
  return proxyCatalogProductImages(product, request.url);
}

async function verifyAdminRequest(request: Request, env: Env): Promise<AdminUser> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Missing bearer token" }), { status: 401 });
  }

  const response = await fetch(`${trimTrailingSlash(env.SUPABASE_URL)}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: authorization,
    },
  });

  if (!response.ok) {
    throw new Response(JSON.stringify({ error: "Invalid Supabase access token" }), { status: 401 });
  }

  const user = (await response.json()) as AdminUser;
  if (!user.id) {
    throw new Response(JSON.stringify({ error: "Missing Supabase user id" }), { status: 401 });
  }

  const adminLookup = await fetch(
    `${trimTrailingSlash(env.SUPABASE_URL)}/rest/v1/admin_users?select=is_admin&id=eq.${encodeURIComponent(user.id)}&limit=1`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!adminLookup.ok) {
    throw new Response(JSON.stringify({ error: "Failed to verify admin access" }), { status: 500 });
  }

  const adminRows = (await adminLookup.json()) as AdminRow[];
  const isAdmin = Boolean(adminRows[0]?.is_admin || user.user_metadata?.is_admin);

  if (!isAdmin) {
    throw new Response(JSON.stringify({ error: "Not authorized for admin writes" }), { status: 403 });
  }

  return user;
}

async function writeAuditLog(
  env: Env,
  user: AdminUser,
  action: string,
  trackerId: TrackerId | null,
  listingId: string | null,
  variationId: string | null,
  details: Record<string, unknown>,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO admin_audit_log (user_id, user_email, action, tracker_id, listing_id, variation_id, details)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  )
    .bind(user.id, user.email || null, action, trackerId, listingId, variationId, JSON.stringify(details))
    .run();
}

async function getOverrideMaps(env: Env): Promise<LiveCatalogOverrideMaps> {
  const [listingRows, variationRows, shippingRows] = await Promise.all([
    env.DB.prepare("SELECT tracker_id, listing_id, base_price FROM project_listing_price_overrides").all<PriceOverrideRow>(),
    env.DB.prepare(
      "SELECT tracker_id, listing_id, variation_id, base_price FROM project_variation_price_overrides",
    ).all<VariationOverrideRow>(),
    env.DB.prepare(
      "SELECT tracker_id, listing_id, shipping_price FROM project_listing_shipping_overrides",
    ).all<ShippingOverrideRow>(),
  ]);

  return {
    listingPriceOverrides: new Map(
      (listingRows.results || []).map((row) => [makeListingKey(row.tracker_id, row.listing_id), Number(row.base_price)]),
    ),
    variationPriceOverrides: new Map(
      (variationRows.results || []).map((row) => [
        makeVariationKey(row.tracker_id, row.variation_id),
        Number(row.base_price),
      ]),
    ),
    listingShippingOverrides: new Map(
      (shippingRows.results || []).map((row) => [makeListingKey(row.tracker_id, row.listing_id), Number(row.shipping_price)]),
    ),
  };
}

async function fetchLiveTrackerCatalog(
  trackerId: LiveTrackerId,
  env: Env,
  overrides: LiveCatalogOverrideMaps,
): Promise<CatalogProduct[]> {
  const listings = await fetchJson<UpstreamListing[]>(
    `${trimTrailingSlash(TRACKER_BASE_URLS[trackerId](env))}/listings`,
  );
  return listings.map((listing) => normalizeLiveCatalogProduct(trackerId, listing, overrides));
}

async function fetchJacketCatalog(env: Env): Promise<CatalogProduct[]> {
  const [listings, variations] = await Promise.all([
    env.DB.prepare("SELECT * FROM pakistani_jackets_listings ORDER BY updated_at DESC, title ASC").all<JacketListingRow>(),
    env.DB.prepare(
      "SELECT * FROM pakistani_jackets_variations ORDER BY listing_id ASC, updated_at DESC, name ASC",
    ).all<JacketVariationRow>(),
  ]);

  const variationMap = new Map<string, BaseVariationRecord[]>();
  for (const variation of variations.results || []) {
    const group = variationMap.get(variation.listing_id) || [];
    group.push({
      id: variation.id,
      listing_id: variation.listing_id,
      var_id: variation.var_id,
      name: variation.name || null,
      price: Number(variation.base_price) || 0,
      currency: variation.currency || "GBP",
      out_of_stock: variation.out_of_stock,
      selects: parseMaybeJson<Record<string, string>>(variation.selects, {}),
    });
    variationMap.set(variation.listing_id, group);
  }

  return (listings.results || []).map((listing) =>
    normalizeJacketCatalogProduct({
      listing_id: listing.listing_id,
      title: listing.title,
      description: listing.description || "",
      price: Number(listing.base_price) || 0,
      currency: listing.currency || "GBP",
      image: listing.image || null,
      images: parseMaybeJson<string[]>(listing.images, []),
      url: listing.url || null,
      shipping_price: listing.shipping_price ?? 0,
      ended: listing.ended,
      out_of_stock: listing.out_of_stock,
      updated_at: listing.updated_at || listing.created_at || null,
      variations: variationMap.get(listing.listing_id) || [],
    }),
  );
}

function sortProducts(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((left, right) => {
    const leftTracker = TRACKERS.findIndex((tracker) => tracker.id === left.trackerId);
    const rightTracker = TRACKERS.findIndex((tracker) => tracker.id === right.trackerId);
    if (leftTracker !== rightTracker) return leftTracker - rightTracker;
    const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
    const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;
    if (leftTime !== rightTime) return rightTime - leftTime;
    return left.title.localeCompare(right.title);
  });
}

async function buildSnapshot(env: Env): Promise<CatalogSnapshot> {
  const overrides = await getOverrideMaps(env);
  const [tims, tiktok, wholesale, jackets] = await Promise.all([
    fetchLiveTrackerCatalog("tims_textile", env, overrides),
    fetchLiveTrackerCatalog("tiktok_ds", env, overrides),
    fetchLiveTrackerCatalog("wholesale_items", env, overrides),
    fetchJacketCatalog(env),
  ]);

  return {
    trackers: TRACKERS,
    products: sortProducts([...tims, ...tiktok, ...wholesale, ...jackets, createAccountBuildingProduct()]),
    updatedAt: new Date().toISOString(),
  };
}

function findProduct(snapshot: CatalogSnapshot, trackerId: TrackerId, listingId: string): CatalogProduct | null {
  return snapshot.products.find((product) => product.trackerId === trackerId && product.listingId === listingId) || null;
}

async function upsertRow(env: Env, query: string, ...values: D1Value[]): Promise<void> {
  await env.DB.prepare(query).bind(...values).run();
}

async function deleteRow(env: Env, query: string, ...values: D1Value[]): Promise<void> {
  await env.DB.prepare(query).bind(...values).run();
}

async function updateJacketListing(env: Env, listingId: string, patch: Record<string, unknown>): Promise<void> {
  const updates: string[] = [];
  const values: D1Value[] = [];
  const push = (column: string, value: D1Value) => {
    updates.push(`${column} = ?${values.length + 1}`);
    values.push(value);
  };

  if (patch.title !== undefined) push("title", String(patch.title));
  if (patch.description !== undefined) push("description", String(patch.description || ""));
  if (patch.image !== undefined) push("image", patch.image ? String(patch.image) : null);
  if (patch.images !== undefined) push("images", JSON.stringify(Array.isArray(patch.images) ? patch.images : []));
  if (patch.url !== undefined) push("url", patch.url ? String(patch.url) : null);
  if (patch.currency !== undefined) push("currency", String(patch.currency || "GBP"));
  if (patch.base_price !== undefined) push("base_price", Number(patch.base_price) || 0);
  if (patch.ended !== undefined) push("ended", patch.ended ? 1 : 0);
  if (patch.out_of_stock !== undefined) push("out_of_stock", patch.out_of_stock ? 1 : 0);
  if (updates.length === 0) throw new Error("No jacket listing fields provided");

  push("updated_at", new Date().toISOString());
  values.push(listingId);
  await env.DB.prepare(
    `UPDATE pakistani_jackets_listings SET ${updates.join(", ")} WHERE listing_id = ?${values.length}`,
  )
    .bind(...values)
    .run();
}

async function updateJacketVariation(env: Env, variationId: string, patch: Record<string, unknown>): Promise<void> {
  const updates: string[] = [];
  const values: D1Value[] = [];
  const push = (column: string, value: D1Value) => {
    updates.push(`${column} = ?${values.length + 1}`);
    values.push(value);
  };

  if (patch.name !== undefined) push("name", String(patch.name || ""));
  if (patch.currency !== undefined) push("currency", String(patch.currency || "GBP"));
  if (patch.base_price !== undefined) push("base_price", Number(patch.base_price) || 0);
  if (patch.out_of_stock !== undefined) push("out_of_stock", patch.out_of_stock ? 1 : 0);
  if (patch.selects !== undefined) push("selects", JSON.stringify(patch.selects || {}));
  if (updates.length === 0) throw new Error("No jacket variation fields provided");

  push("updated_at", new Date().toISOString());
  values.push(variationId);
  await env.DB.prepare(
    `UPDATE pakistani_jackets_variations SET ${updates.join(", ")} WHERE id = ?${values.length}`,
  )
    .bind(...values)
    .run();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === "/health") return jsonResponse(request, env, { status: "ok", service: "elevate-catalog-worker" });
      if (path === "/trackers" && request.method === "GET") return jsonResponse(request, env, TRACKERS);
      if (path === "/catalog" && request.method === "GET") {
        return jsonResponse(request, env, withProxiedSnapshot(await buildSnapshot(env), request));
      }

      if (path === "/img" && request.method === "GET") {
        const target = toProxySafeUrl(url.searchParams.get("url") || "");
        if (!target) {
          return jsonResponse(request, env, { error: "Missing or invalid image URL" }, { status: 400 });
        }

        const upstreamRequest: CloudflareFetchInit = {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          },
          cf: {
            cacheTtl: 60 * 60 * 24,
            cacheEverything: true,
          },
        };

        const upstream = await fetch(target.toString(), upstreamRequest);

        if (!upstream.ok || !upstream.body) {
          return jsonResponse(request, env, { error: `Failed to fetch image: ${upstream.status}` }, { status: 502 });
        }

        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            ...getCorsHeaders(request, env),
            "Content-Type": upstream.headers.get("Content-Type") || "image/webp",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      }

      if (path === "/admin/catalog" && request.method === "GET") {
        await verifyAdminRequest(request, env);
        const snapshot = await buildSnapshot(env);
        const query: AdminCatalogQueryInput = {
          page: url.searchParams.get("page"),
          pageSize: url.searchParams.get("pageSize"),
          q: url.searchParams.get("q"),
          tracker: url.searchParams.get("tracker"),
        };
        return jsonResponse(request, env, buildAdminCatalogPage(snapshot, query));
      }

      if (path.startsWith("/catalog/") && request.method === "GET") {
        const trackerId = toTrackerId(path.replace("/catalog/", ""));
        if (!trackerId) return jsonResponse(request, env, { error: "Unknown tracker" }, { status: 404 });
        const snapshot = withProxiedSnapshot(await buildSnapshot(env), request);
        return jsonResponse(request, env, {
          ...snapshot,
          tracker: getTrackerDefinition(trackerId),
          products: snapshot.products.filter((product) => product.trackerId === trackerId),
        });
      }

      if (path.startsWith("/products/") && request.method === "GET") {
        const [, , trackerSegment, ...listingSegments] = path.split("/");
        const trackerId = toTrackerId(trackerSegment || "");
        const listingId = decodeURIComponent(listingSegments.join("/"));
        if (!trackerId || !listingId) return jsonResponse(request, env, { error: "Unknown product" }, { status: 404 });
        const snapshot = await buildSnapshot(env);
        const product = findProduct(snapshot, trackerId, listingId);
        return product
          ? jsonResponse(request, env, withProxiedProduct(product, request))
          : jsonResponse(request, env, { error: "Product not found" }, { status: 404 });
      }

      if (path === "/admin/prices/listing" && request.method === "PATCH") {
        const user = await verifyAdminRequest(request, env);
        const body = await parseJsonBody<{ trackerId: LiveTrackerId; listingId: string; basePrice?: number; clearOverride?: boolean }>(request);
        if (body.clearOverride) {
          await deleteRow(env, "DELETE FROM project_listing_price_overrides WHERE tracker_id = ?1 AND listing_id = ?2", body.trackerId, body.listingId);
        } else if (typeof body.basePrice === "number") {
          await upsertRow(
            env,
            `INSERT INTO project_listing_price_overrides (tracker_id, listing_id, base_price, updated_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(tracker_id, listing_id)
             DO UPDATE SET base_price = excluded.base_price, updated_at = excluded.updated_at`,
            body.trackerId,
            body.listingId,
            body.basePrice,
            new Date().toISOString(),
          );
        } else {
          return jsonResponse(request, env, { error: "Missing basePrice or clearOverride" }, { status: 400 });
        }
        await writeAuditLog(env, user, "project_listing_price_override", body.trackerId, body.listingId, null, body);
        const snapshot = await buildSnapshot(env);
        return jsonResponse(request, env, { success: true, product: findProduct(snapshot, body.trackerId, body.listingId) });
      }

      if (path === "/admin/prices/variation" && request.method === "PATCH") {
        const user = await verifyAdminRequest(request, env);
        const body = await parseJsonBody<{ trackerId: LiveTrackerId; listingId: string; variationId: string; basePrice?: number; clearOverride?: boolean }>(request);
        if (body.clearOverride) {
          await deleteRow(env, "DELETE FROM project_variation_price_overrides WHERE tracker_id = ?1 AND variation_id = ?2", body.trackerId, body.variationId);
        } else if (typeof body.basePrice === "number") {
          await upsertRow(
            env,
            `INSERT INTO project_variation_price_overrides (tracker_id, variation_id, listing_id, base_price, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(tracker_id, variation_id)
             DO UPDATE SET listing_id = excluded.listing_id, base_price = excluded.base_price, updated_at = excluded.updated_at`,
            body.trackerId,
            body.variationId,
            body.listingId,
            body.basePrice,
            new Date().toISOString(),
          );
        } else {
          return jsonResponse(request, env, { error: "Missing basePrice or clearOverride" }, { status: 400 });
        }
        await writeAuditLog(env, user, "project_variation_price_override", body.trackerId, body.listingId, body.variationId, body);
        const snapshot = await buildSnapshot(env);
        return jsonResponse(request, env, { success: true, product: findProduct(snapshot, body.trackerId, body.listingId) });
      }

      if (path === "/admin/prices/shipping" && request.method === "PATCH") {
        const user = await verifyAdminRequest(request, env);
        const body = await parseJsonBody<{ listingId: string; shippingPrice?: number; clearOverride?: boolean }>(request);
        if (body.clearOverride) {
          await deleteRow(env, "DELETE FROM project_listing_shipping_overrides WHERE tracker_id = ?1 AND listing_id = ?2", "wholesale_items", body.listingId);
        } else if (typeof body.shippingPrice === "number") {
          await upsertRow(
            env,
            `INSERT INTO project_listing_shipping_overrides (tracker_id, listing_id, shipping_price, updated_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(tracker_id, listing_id)
             DO UPDATE SET shipping_price = excluded.shipping_price, updated_at = excluded.updated_at`,
            "wholesale_items",
            body.listingId,
            body.shippingPrice,
            new Date().toISOString(),
          );
        } else {
          return jsonResponse(request, env, { error: "Missing shippingPrice or clearOverride" }, { status: 400 });
        }
        await writeAuditLog(env, user, "project_shipping_override", "wholesale_items", body.listingId, null, body);
        const snapshot = await buildSnapshot(env);
        return jsonResponse(request, env, { success: true, product: findProduct(snapshot, "wholesale_items", body.listingId) });
      }

      if (path.startsWith("/admin/jackets/listings/") && request.method === "PATCH") {
        const user = await verifyAdminRequest(request, env);
        const listingId = decodeURIComponent(path.replace("/admin/jackets/listings/", ""));
        const body = await parseJsonBody<Record<string, unknown>>(request);
        await updateJacketListing(env, listingId, body);
        await writeAuditLog(env, user, "pakistani_jackets_listing_update", "pakistani_jackets", listingId, null, body);
        const snapshot = await buildSnapshot(env);
        return jsonResponse(request, env, { success: true, product: findProduct(snapshot, "pakistani_jackets", listingId) });
      }

      if (path.startsWith("/admin/jackets/variations/") && request.method === "PATCH") {
        const user = await verifyAdminRequest(request, env);
        const variationId = decodeURIComponent(path.replace("/admin/jackets/variations/", ""));
        const body = await parseJsonBody<Record<string, unknown>>(request);
        await updateJacketVariation(env, variationId, body);
        await writeAuditLog(env, user, "pakistani_jackets_variation_update", "pakistani_jackets", null, variationId, body);
        return jsonResponse(request, env, { success: true, variationId });
      }

      if (path === "/admin/jackets/import" && request.method === "POST") {
        const user = await verifyAdminRequest(request, env);
        const body = await parseJsonBody<{ listings: Array<Record<string, unknown>> }>(request);
        let variations = 0;
        for (const rawListing of body.listings || []) {
          const listing = rawListing as Record<string, unknown>;
          await upsertRow(
            env,
            `INSERT INTO pakistani_jackets_listings (listing_id, title, description, image, images, url, currency, base_price, shipping_price, ended, out_of_stock, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
             ON CONFLICT(listing_id)
             DO UPDATE SET title = excluded.title, description = excluded.description, image = excluded.image, images = excluded.images, url = excluded.url, currency = excluded.currency, base_price = excluded.base_price, shipping_price = excluded.shipping_price, ended = excluded.ended, out_of_stock = excluded.out_of_stock, updated_at = excluded.updated_at`,
            String(listing.listing_id),
            String(listing.title || ""),
            String(listing.description || ""),
            listing.image ? String(listing.image) : null,
            JSON.stringify(Array.isArray(listing.images) ? listing.images : []),
            listing.url ? String(listing.url) : null,
            String(listing.currency || "GBP"),
            Number(listing.price) || 0,
            Number(listing.shipping_price) || 0,
            listing.ended ? 1 : 0,
            listing.out_of_stock ? 1 : 0,
            String(listing.updated_at || new Date().toISOString()),
          );

          const listingVariations = Array.isArray(listing.variations) ? listing.variations : [];
          for (const rawVariation of listingVariations) {
            const variation = rawVariation as Record<string, unknown>;
            variations += 1;
            await upsertRow(
              env,
              `INSERT INTO pakistani_jackets_variations (id, listing_id, var_id, name, currency, base_price, out_of_stock, selects, created_at, updated_at)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
               ON CONFLICT(id)
               DO UPDATE SET listing_id = excluded.listing_id, var_id = excluded.var_id, name = excluded.name, currency = excluded.currency, base_price = excluded.base_price, out_of_stock = excluded.out_of_stock, selects = excluded.selects, updated_at = excluded.updated_at`,
              String(variation.id),
              String(variation.listing_id || listing.listing_id),
              String(variation.var_id || ""),
              variation.name ? String(variation.name) : null,
              String(variation.currency || listing.currency || "GBP"),
              Number(variation.price) || 0,
              variation.out_of_stock ? 1 : 0,
              JSON.stringify(variation.selects || {}),
              String(variation.created_at || listing.updated_at || new Date().toISOString()),
              String(variation.updated_at || listing.updated_at || new Date().toISOString()),
            );
          }
        }

        await writeAuditLog(env, user, "pakistani_jackets_import", "pakistani_jackets", null, null, {
          listings: body.listings?.length || 0,
          variations,
        });
        return jsonResponse(request, env, { success: true, listings: body.listings?.length || 0, variations });
      }

      return jsonResponse(request, env, { error: "Not found" }, { status: 404 });
    } catch (error) {
      if (error instanceof Response) {
        return new Response(await error.text(), {
          status: error.status,
          headers: { ...jsonHeaders, ...corsHeaders },
        });
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      return jsonResponse(request, env, { error: message }, { status: 500 });
    }
  },
};
