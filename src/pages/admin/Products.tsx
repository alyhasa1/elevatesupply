import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { AdminProductEditor } from "@/components/admin/AdminProductEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  createEmptyAdminCatalogPage,
  fetchAdminCatalogPage,
  patchJacketListing,
  patchJacketVariation,
  patchListingContent,
  patchListingPriceOverride,
  patchShippingOverride,
  patchVariationHeroImage,
  patchVariationPriceOverride,
} from "@/lib/catalog/api";
import { TRACKERS } from "@/lib/catalog/trackers";
import type { AdminCatalogPage, CatalogProduct, TrackerId } from "@/lib/catalog/types";

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
  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedTracker, setSelectedTracker] = useState<"all" | TrackerId>("all");
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);

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

  const withSession = <T,>(callback: (token: string) => Promise<T>) => {
    if (!session?.access_token) {
      throw new Error("Admin sign-in is required before saving changes.");
    }
    return callback(session.access_token);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-slate-500">
            Manage project-local pricing, descriptions, and variation media while keeping live source data intact.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 self-start text-slate-600 sm:self-auto"
          onClick={() => {
            void runAction("refresh", () => loadPage(currentPage, true), "Catalog refreshed.");
          }}
          disabled={busyKey === "refresh"}
        >
          <RefreshCw className="h-4 w-4" /> Refresh snapshot
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
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar lg:pb-0">
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
          <div className="flex flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {status === "ready"
                ? `Showing ${visibleRange.start}-${visibleRange.end} of ${pageData.total} products`
                : "Preparing product page..."}
              {deferredSearchTerm !== searchTerm ? " Updating search..." : ""}
            </div>
            <div className="flex flex-wrap items-center gap-3">
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

      {message ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>
      ) : null}
      {status === "loading" && <div className="text-slate-500">Loading catalog page...</div>}
      {status === "error" && <div className="text-orange-700">{error || "Catalog could not be loaded."}</div>}
      {isFetching && status === "ready" && <div className="text-slate-500">Updating current page...</div>}

      <div className="space-y-4">
        {pageData.products.map((product) => (
          <AdminProductEditor
            key={`${pageData.updatedAt}:${product.id}`}
            product={product}
            busyKey={busyKey}
            onRunAction={runAction}
            saveListingPrice={async (payload) => {
              await withSession((token) => patchListingPriceOverride(token, payload));
            }}
            saveVariationPrice={async (payload) => {
              await withSession((token) => patchVariationPriceOverride(token, payload));
            }}
            saveShippingPrice={async (payload) => {
              await withSession((token) => patchShippingOverride(token, payload));
            }}
            saveListingContent={async (payload) => {
              await withSession((token) => patchListingContent(token, payload));
            }}
            saveVariationHeroImage={async (payload) => {
              await withSession((token) => patchVariationHeroImage(token, payload));
            }}
            saveJacketListing={async (listingId, payload) => {
              await withSession((token) => patchJacketListing(token, listingId, payload));
            }}
            saveJacketVariation={async (variationId, payload) => {
              await withSession((token) => patchJacketVariation(token, variationId, payload));
            }}
          />
        ))}
      </div>

      {status === "ready" && pageData.products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
          No products match the current search or tracker filter.
        </div>
      ) : null}

      {status === "ready" && pageData.total > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row">
            <div className="text-sm text-slate-500">
              Showing {visibleRange.start}-{visibleRange.end} of {pageData.total} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!pageData.hasPreviousPage || isFetching}
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <div className="min-w-[110px] text-center text-sm font-medium text-slate-700">
                Page {pageData.page} / {pageData.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={!pageData.hasNextPage || isFetching}
                onClick={() => setCurrentPage((value) => Math.min(pageData.totalPages, value + 1))}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
