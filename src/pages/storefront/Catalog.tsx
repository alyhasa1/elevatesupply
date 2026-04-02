import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCatalogPage } from "@/lib/catalog/publicHooks";
import { TRACKERS } from "@/lib/catalog/trackers";
import type { CatalogAvailabilityFilter, TrackerId } from "@/lib/catalog/types";

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
const AVAILABILITY_FILTERS: Array<{ value: CatalogAvailabilityFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "ended", label: "Ended" },
];

function parsePositiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseTracker(value: string | null): TrackerId | "all" {
  return TRACKERS.some((tracker) => tracker.id === value) ? (value as TrackerId) : "all";
}

function parseAvailability(value: string | null): CatalogAvailabilityFilter {
  return value === "in_stock" || value === "out_of_stock" || value === "ended" ? value : "all";
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tracker = parseTracker(searchParams.get("tracker"));
  const availability = parseAvailability(searchParams.get("availability"));
  const q = searchParams.get("q") || "";
  const page = parsePositiveNumber(searchParams.get("page"), 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(parsePositiveNumber(searchParams.get("pageSize"), 24) as (typeof PAGE_SIZE_OPTIONS)[number])
    ? (parsePositiveNumber(searchParams.get("pageSize"), 24) as (typeof PAGE_SIZE_OPTIONS)[number])
    : 24;

  const { data, status, error } = useCatalogPage({
    tracker,
    availability,
    q,
    page,
    pageSize,
  });

  const visibleRange = useMemo(() => {
    if (data.total === 0) return { start: 0, end: 0 };
    const start = (data.page - 1) * data.pageSize + 1;
    const end = Math.min(data.total, start + data.products.length - 1);
    return { start, end };
  }, [data.page, data.pageSize, data.products.length, data.total]);

  const updateParams = (patch: Record<string, string | null>, resetPage = false) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    if (resetPage) {
      next.delete("page");
    }

    setSearchParams(next);
  };

  return (
    <div className="bg-[#faf9f8] py-8 sm:py-12">
      <div className="container mx-auto space-y-6 px-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="mb-3 text-3xl font-semibold text-stone-900 sm:text-4xl">Our Stock</h1>
          </div>
          <div className="w-full max-w-xl">
            <Input
              value={q}
              onChange={(event) => updateParams({ q: event.target.value.trim() ? event.target.value : null }, true)}
              placeholder="Search by title, tracker, or listing ID"
              className="h-12 rounded-2xl border-stone-200 bg-white"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => updateParams({ tracker: null }, true)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                tracker === "all"
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              All Products
            </button>
            {TRACKERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => updateParams({ tracker: entry.id }, true)}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  tracker === entry.id
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                }`}
              >
                {entry.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => updateParams({ availability: filter.value === "all" ? null : filter.value }, true)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    availability === filter.value
                      ? "bg-orange-700 text-white"
                      : "border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 text-sm text-stone-500">
              <span>Per page</span>
              <select
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900"
                value={pageSize}
                onChange={(event) => updateParams({ pageSize: event.target.value }, true)}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {status === "ready" && (
          <div className="text-sm text-stone-500">
            {data.total > 0
              ? `Showing ${visibleRange.start}-${visibleRange.end} of ${data.total} products`
              : "No products found"}
          </div>
        )}

        {status === "loading" && <div className="text-stone-500">Loading catalog...</div>}
        {status === "error" && <div className="text-orange-700">{error || "Catalog could not be loaded."}</div>}

        {status === "ready" && data.products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {status === "ready" && data.products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center text-stone-500">
            No products match the current tracker, availability, or search filter.
          </div>
        )}

        {status === "ready" && data.totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm text-stone-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing {visibleRange.start}-{visibleRange.end} of {data.total} products
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                disabled={!data.hasPreviousPage}
                onClick={() => updateParams({ page: String(Math.max(1, data.page - 1)) })}
              >
                Previous
              </Button>
              <div className="min-w-[120px] text-center font-medium text-stone-700">
                Page {data.page} of {data.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={!data.hasNextPage}
                onClick={() => updateParams({ page: String(Math.min(data.totalPages, data.page + 1)) })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
