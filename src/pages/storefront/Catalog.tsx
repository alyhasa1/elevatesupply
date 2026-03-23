import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { useCatalog } from "@/lib/catalog/context";
import { TRACKERS } from "@/lib/catalog/trackers";

export default function Catalog() {
  const { products, status, error } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTracker = searchParams.get("tracker") || "all";
  const search = searchParams.get("q") || "";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesTracker = activeTracker === "all" || product.trackerId === activeTracker;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        product.title.toLowerCase().includes(query) ||
        product.listingId.toLowerCase().includes(query) ||
        product.trackerName.toLowerCase().includes(query);

      return matchesTracker && matchesSearch;
    });
  }, [activeTracker, products, search]);

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-24 pb-16">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold text-stone-900 mb-3">Catalog</h1>
            <p className="text-stone-600 text-lg">
              One normalized view over the five tracker families, with no extra categories and no leftover pricing noise.
            </p>
          </div>
          <div className="w-full max-w-md">
            <Input
              value={search}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams);
                if (event.target.value.trim()) {
                  next.set("q", event.target.value);
                } else {
                  next.delete("q");
                }
                setSearchParams(next);
              }}
              placeholder="Search by title, tracker, or listing ID"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("tracker");
              setSearchParams(next);
            }}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeTracker === "all"
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
            }`}
          >
            All Products
          </button>
          {TRACKERS.map((tracker) => (
            <button
              key={tracker.id}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("tracker", tracker.id);
                setSearchParams(next);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeTracker === tracker.id
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              }`}
            >
              {tracker.name}
            </button>
          ))}
        </div>

        {status === "loading" && <div className="text-stone-500">Loading catalog...</div>}
        {status === "error" && <div className="text-rose-700">{error || "Catalog could not be loaded."}</div>}

        {status === "ready" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {status === "ready" && filteredProducts.length === 0 && (
          <div className="text-center py-24 text-stone-500">No products match the current tracker or search filter.</div>
        )}
      </div>
    </div>
  );
}
