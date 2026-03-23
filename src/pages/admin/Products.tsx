import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Edit3, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getAvailabilityLabel } from "@/lib/catalog/format";
import {
  createEmptyAdminCatalogPage,
  fetchAdminCatalogPage,
  patchJacketListing,
  patchJacketVariation,
  patchListingPriceOverride,
  patchShippingOverride,
  patchVariationPriceOverride,
} from "@/lib/catalog/api";
import { TRACKERS } from "@/lib/catalog/trackers";
import type { AdminCatalogPage, CatalogProduct, TrackerId } from "@/lib/catalog/types";
import { useAuth } from "@/contexts/AuthContext";

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

const PAGE_SIZE_OPTIONS = [12, 24, 48];

function getVisibleRange(pageData: AdminCatalogPage) {
  if (pageData.total === 0) return { start: 0, end: 0 };
  const start = (pageData.page - 1) * pageData.pageSize + 1;
  const end = Math.min(pageData.total, start + pageData.products.length - 1);
  return { start, end };
}

export default function Products() {
  const { session, user, isAdmin } = useAuth();
  const [pageData, setPageData] = useState<AdminCatalogPage>(createEmptyAdminCatalogPage());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedTracker, setSelectedTracker] = useState<"all" | TrackerId>("all");
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const canAdminWrite = Boolean(session?.access_token && isAdmin);

  const loadPage = async (page = currentPage, preserveData = pageData.products.length > 0) => {
    if (!session?.access_token || !isAdmin) {
      setError("Admin sign-in is required before loading product data.");
      setStatus("error");
      return;
    }

    if (preserveData) {
      setIsFetching(true);
    } else {
      setStatus("loading");
    }

    try {
      const nextPage = await fetchAdminCatalogPage(session.access_token, {
        page,
        pageSize,
        q: deferredSearchTerm.trim(),
        tracker: selectedTracker,
      });

      startTransition(() => {
        setPageData(nextPage);
      });
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin catalog");
      setStatus("error");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    void loadPage(currentPage, pageData.products.length > 0);
  }, [session?.access_token, isAdmin, deferredSearchTerm, selectedTracker, pageSize, currentPage]);

  const visibleRange = useMemo(() => getVisibleRange(pageData), [pageData]);

  const runAction = async (key: string, action: () => Promise<void>, successMessage: string) => {
    setBusyKey(key);
    setMessage(null);
    try {
      await action();
      await loadPage(currentPage, true);
      setMessage(successMessage);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-slate-500">Manage project-local pricing for live trackers and edit Pakistani Jackets directly in D1.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => {
            void runAction("refresh", () => loadPage(currentPage, true), "Catalog refreshed.");
          }}
          disabled={busyKey === "refresh"}
        >
          <RefreshCw className="w-4 h-4" /> Refresh snapshot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signed-in Admin Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Authenticated as {user?.email || "unknown user"}.</p>
          <p>
            Worker writes now use your shared Supabase session automatically.{" "}
            {canAdminWrite ? "Admin write access is ready." : "Admin write access is not available."}
          </p>
          {pageData.updatedAt !== new Date(0).toISOString() && (
            <p>Current page snapshot updated {new Date(pageData.updatedAt).toLocaleString()}.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by product title, listing ID, or tracker..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              <Badge
                variant={selectedTracker === "all" ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => {
                  setSelectedTracker("all");
                  setCurrentPage(1);
                }}
              >
                All
              </Badge>
              {TRACKERS.map((tracker) => (
                <Badge
                  key={tracker.id}
                  variant={selectedTracker === tracker.id ? "default" : "secondary"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => {
                    setSelectedTracker(tracker.id);
                    setCurrentPage(1);
                  }}
                >
                  {tracker.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 text-sm text-slate-500">
            <div>
              {status === "ready"
                ? `Showing ${visibleRange.start}-${visibleRange.end} of ${pageData.total} products`
                : "Preparing product page..."}
              {deferredSearchTerm !== searchTerm ? " Updating search..." : ""}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <span>Per page</span>
                <select
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <span>
                Page {pageData.page} of {pageData.totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {status === "loading" && <div className="text-slate-500">Loading catalog page...</div>}
      {status === "error" && <div className="text-rose-700">{error || "Catalog could not be loaded."}</div>}
      {isFetching && status === "ready" && <div className="text-slate-500">Updating current page...</div>}

      <div className="space-y-4">
        {pageData.products.map((product) => (
          <ProductEditor
            key={product.id}
            product={product}
            busyKey={busyKey}
            onRunAction={runAction}
            saveListingPrice={async (payload) => {
              if (!session?.access_token) throw new Error("Admin sign-in is required before saving changes.");
              await patchListingPriceOverride(session.access_token, payload);
            }}
            saveVariationPrice={async (payload) => {
              if (!session?.access_token) throw new Error("Admin sign-in is required before saving changes.");
              await patchVariationPriceOverride(session.access_token, payload);
            }}
            saveShippingPrice={async (payload) => {
              if (!session?.access_token) throw new Error("Admin sign-in is required before saving changes.");
              await patchShippingOverride(session.access_token, payload);
            }}
            saveJacketListing={async (listingId, payload) => {
              if (!session?.access_token) throw new Error("Admin sign-in is required before saving changes.");
              await patchJacketListing(session.access_token, listingId, payload);
            }}
            saveJacketVariation={async (variationId, payload) => {
              if (!session?.access_token) throw new Error("Admin sign-in is required before saving changes.");
              await patchJacketVariation(session.access_token, variationId, payload);
            }}
          />
        ))}
      </div>

      {status === "ready" && pageData.products.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
          No products match the current search or tracker filter.
        </div>
      )}

      {status === "ready" && pageData.total > 0 && (
        <Card>
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              Showing {visibleRange.start}-{visibleRange.end} of {pageData.total} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!pageData.hasPreviousPage || isFetching}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>
              <div className="text-sm font-medium text-slate-700 min-w-[110px] text-center">
                Page {pageData.page} / {pageData.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={!pageData.hasNextPage || isFetching}
                onClick={() => setCurrentPage((page) => Math.min(pageData.totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ProductEditorProps {
  product: CatalogProduct;
  busyKey: string | null;
  onRunAction: (key: string, action: () => Promise<void>, successMessage: string) => Promise<void>;
  saveListingPrice: (payload: {
    trackerId: CatalogProduct["trackerId"];
    listingId: string;
    basePrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveVariationPrice: (payload: {
    trackerId: CatalogProduct["trackerId"];
    listingId: string;
    variationId: string;
    basePrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveShippingPrice: (payload: { listingId: string; shippingPrice?: number; clearOverride?: boolean }) => Promise<void>;
  saveJacketListing: (listingId: string, payload: Record<string, unknown>) => Promise<void>;
  saveJacketVariation: (variationId: string, payload: Record<string, unknown>) => Promise<void>;
}

function ProductEditor({
  product,
  busyKey,
  onRunAction,
  saveListingPrice,
  saveVariationPrice,
  saveShippingPrice,
  saveJacketListing,
  saveJacketVariation,
}: ProductEditorProps) {
  const isReadOnly = product.trackerId === "account_building";

  return (
    <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="list-none cursor-pointer px-6 py-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-white" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{product.trackerName}</Badge>
                <Badge variant="outline">{getAvailabilityLabel(product.availability)}</Badge>
                {isReadOnly && <Badge variant="outline">Read only</Badge>}
              </div>
              <div className="font-semibold text-slate-900">{product.title}</div>
              <div className="text-sm text-slate-500">
                {product.listingId} • {product.variations.length > 0 ? `${product.variations.length} variations` : "Single item"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-1">Public</div>
              <div className="font-semibold text-slate-900">{formatCurrency(product.displayPrice, product.currency)}</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-1">Base</div>
              <div className="font-semibold text-slate-900">{formatCurrency(product.basePrice, product.currency)}</div>
            </div>
            <div>
              <div className="text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-1">Shipping</div>
              <div className="font-semibold text-slate-900">
                {product.shippingPrice ? formatCurrency(product.shippingPrice, product.currency) : "n/a"}
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <Edit3 className="w-4 h-4" />
              Expand
            </div>
          </div>
        </div>
      </summary>

      <div className="px-6 pb-6 space-y-6 border-t border-slate-100">
        {product.trackerId !== "pakistani_jackets" && !isReadOnly && (
          <div className="grid xl:grid-cols-2 gap-4 pt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Listing Price Override</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form
                  className="flex gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${product.id}:listing`,
                      () =>
                        saveListingPrice({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          basePrice: Number(formData.get("basePrice") || 0),
                        }),
                      `Updated listing price for ${product.title}.`,
                    );
                  }}
                >
                  <Input
                    name="basePrice"
                    type="number"
                    step="0.01"
                    defaultValue={String(product.projectOverrideBasePrice ?? product.basePrice)}
                  />
                  <Button type="submit" disabled={busyKey === `${product.id}:listing`}>
                    Save
                  </Button>
                </form>
                <Button
                  variant="outline"
                  onClick={() => {
                    void onRunAction(
                      `${product.id}:listing-clear`,
                      () =>
                        saveListingPrice({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          clearOverride: true,
                        }),
                      `Cleared listing price override for ${product.title}.`,
                    );
                  }}
                  disabled={busyKey === `${product.id}:listing-clear`}
                >
                  Clear Listing Override
                </Button>
              </CardContent>
            </Card>

            {product.trackerId === "wholesale_items" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Wholesale Shipping Override</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form
                    className="flex gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      void onRunAction(
                        `${product.id}:shipping`,
                        () =>
                          saveShippingPrice({
                            listingId: product.listingId,
                            shippingPrice: Number(formData.get("shippingPrice") || 0),
                          }),
                        `Updated shipping override for ${product.title}.`,
                      );
                    }}
                  >
                    <Input
                      name="shippingPrice"
                      type="number"
                      step="0.01"
                      defaultValue={String(product.projectOverrideShippingPrice ?? product.shippingPrice ?? 0)}
                    />
                    <Button type="submit" disabled={busyKey === `${product.id}:shipping`}>
                      Save
                    </Button>
                  </form>
                  <Button
                    variant="outline"
                    onClick={() => {
                      void onRunAction(
                        `${product.id}:shipping-clear`,
                        () =>
                          saveShippingPrice({
                            listingId: product.listingId,
                            clearOverride: true,
                          }),
                        `Cleared shipping override for ${product.title}.`,
                      );
                    }}
                    disabled={busyKey === `${product.id}:shipping-clear`}
                  >
                    Clear Shipping Override
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {product.variations.length > 0 && product.trackerId !== "pakistani_jackets" && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Variation Price Overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.variations.map((variation) => (
                <form
                  key={variation.id}
                  className="grid lg:grid-cols-[1.5fr_180px_auto_auto] gap-3 items-center border border-slate-100 rounded-xl p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${variation.id}:save`,
                      () =>
                        saveVariationPrice({
                          trackerId: product.trackerId,
                          listingId: product.listingId,
                          variationId: variation.id,
                          basePrice: Number(formData.get("basePrice") || 0),
                        }),
                      `Updated variation price for ${variation.name}.`,
                    );
                  }}
                >
                  <div>
                    <div className="font-medium text-slate-900">{variation.name}</div>
                    <div className="text-xs text-slate-500">
                      {Object.entries(variation.selects)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" • ")}
                    </div>
                  </div>
                  <Input
                    name="basePrice"
                    type="number"
                    step="0.01"
                    defaultValue={String(variation.projectOverrideBasePrice ?? variation.basePrice)}
                  />
                  <Button type="submit" disabled={busyKey === `${variation.id}:save`}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyKey === `${variation.id}:clear`}
                    onClick={() => {
                      void onRunAction(
                        `${variation.id}:clear`,
                        () =>
                          saveVariationPrice({
                            trackerId: product.trackerId,
                            listingId: product.listingId,
                            variationId: variation.id,
                            clearOverride: true,
                          }),
                        `Cleared variation override for ${variation.name}.`,
                      );
                    }}
                  >
                    Clear
                  </Button>
                </form>
              ))}
            </CardContent>
          </Card>
        )}

        {product.trackerId === "pakistani_jackets" && (
          <>
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pakistani Jacket Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid lg:grid-cols-2 gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    void onRunAction(
                      `${product.id}:jacket-listing`,
                      () =>
                        saveJacketListing(product.listingId, {
                          title: String(formData.get("title") || ""),
                          description: String(formData.get("description") || ""),
                          image: String(formData.get("image") || ""),
                          url: String(formData.get("url") || ""),
                          base_price: Number(formData.get("basePrice") || 0),
                          ended: parseCheckbox(formData.get("ended")),
                          out_of_stock: parseCheckbox(formData.get("outOfStock")),
                        }),
                      `Updated jacket listing ${product.title}.`,
                    );
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <Input name="title" defaultValue={product.title} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Base price</label>
                    <Input name="basePrice" type="number" step="0.01" defaultValue={String(product.basePrice)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Image</label>
                    <Input name="image" defaultValue={product.image || ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Source URL</label>
                    <Input name="url" defaultValue={product.url || ""} />
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      name="description"
                      defaultValue={product.description}
                      rows={6}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input name="outOfStock" type="checkbox" defaultChecked={product.availability === "out_of_stock"} />
                    Out of stock
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input name="ended" type="checkbox" defaultChecked={product.availability === "ended"} />
                    Ended
                  </label>
                  <div className="lg:col-span-2">
                    <Button type="submit" disabled={busyKey === `${product.id}:jacket-listing`}>
                      Save Jacket Listing
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {product.variations.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Jacket Variations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.variations.map((variation) => (
                    <form
                      key={variation.id}
                      className="grid lg:grid-cols-[1fr_180px_auto] gap-3 items-center border border-slate-100 rounded-xl p-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        void onRunAction(
                          `${variation.id}:jacket-variation`,
                          () =>
                            saveJacketVariation(variation.id, {
                              name: String(formData.get("name") || ""),
                              base_price: Number(formData.get("basePrice") || 0),
                              out_of_stock: parseCheckbox(formData.get("outOfStock")),
                            }),
                          `Updated jacket variation ${variation.name}.`,
                        );
                      }}
                    >
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input name="name" defaultValue={variation.name} />
                        <Input name="basePrice" type="number" step="0.01" defaultValue={String(variation.basePrice)} />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input name="outOfStock" type="checkbox" defaultChecked={variation.availability === "out_of_stock"} />
                        Out of stock
                      </label>
                      <Button type="submit" disabled={busyKey === `${variation.id}:jacket-variation`}>
                        Save
                      </Button>
                    </form>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {isReadOnly && (
          <Card className="border-slate-200">
            <CardContent className="pt-6 text-sm text-slate-600">
              Account Building stays a fixed single product in v1, so this tracker is intentionally read-only.
            </CardContent>
          </Card>
        )}
      </div>
    </details>
  );
}
