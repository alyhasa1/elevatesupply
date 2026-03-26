import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, ShieldCheck, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getAvailabilityLabel } from "@/lib/catalog/format";
import { useCatalogProduct } from "@/lib/catalog/publicHooks";
import { buildVariationOptionGroups, resolveVariationSelection } from "@/lib/catalog/variationSelection";
import { trackerIdToOrderSource } from "@/lib/orders/trackerOrderSource";

function extractSelectedOptions(selects: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(selects).filter(([key, value]) => !key.endsWith("_signal") && Boolean(value)),
  );
}

function buildActiveGallery(primaryImage: string | null, images: string[]) {
  return [primaryImage, ...images].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);
}

export default function ProductDetail() {
  const { trackerId, listingId } = useParams<{ trackerId: string; listingId: string }>();
  const decodedListingId = listingId ? decodeURIComponent(listingId) : undefined;
  const { product, status, error } = useCatalogProduct(trackerId, decodedListingId);
  const { session } = useAuth();

  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const variationOptionGroups = useMemo(
    () => buildVariationOptionGroups(product?.variations || []),
    [product?.variations],
  );

  useEffect(() => {
    if (!product) {
      setSelectedVariationId(null);
      setSelectedOptions({});
      setActiveImage(null);
      return;
    }

    if (product.variations.length > 0) {
      const initialSelection = resolveVariationSelection(product, {});
      setSelectedVariationId(initialSelection.variation.id);
      setSelectedOptions(initialSelection.selectedOptions);
    } else {
      setSelectedVariationId(null);
      setSelectedOptions({});
    }
  }, [product]);

  const groupedSelection =
    product && variationOptionGroups.length > 0 && product.variations.length > 0
      ? resolveVariationSelection(product, selectedOptions)
      : null;

  const selectedVariation =
    groupedSelection?.variation ||
    product?.variations.find((variation) => variation.id === selectedVariationId) ||
    product?.variations[0] || {
      id: `${decodedListingId || "unknown"}_standard`,
      listingId: decodedListingId || "unknown",
      varId: "standard",
      name: "Standard",
      basePrice: product?.basePrice || 0,
      displayPrice: product?.displayPrice || 0,
      currency: product?.currency || "GBP",
      availability: product?.availability || "in_stock",
      selects: {},
      heroImage: null,
      projectOverrideBasePrice: null,
    };

  const activeSelectedOptions =
    groupedSelection?.selectedOptions || extractSelectedOptions(selectedVariation.selects);

  const activePrimaryImage = selectedVariation.heroImage || product?.image || null;
  const activeGallery = useMemo(
    () => buildActiveGallery(activePrimaryImage, product?.images || []),
    [activePrimaryImage, product?.images],
  );
  const activeAvailability = product?.availability === "ended" ? "ended" : selectedVariation.availability;
  const canViewSourceListing = Boolean(product?.url && product.trackerId !== "wholesale_items");

  useEffect(() => {
    setActiveImage(activeGallery[0] || null);
  }, [activeGallery]);

  if (status === "loading") {
    return <div className="min-h-screen bg-white px-4 pt-24">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f8] px-4">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Product Not Found</h2>
          <p className="mb-6 text-stone-500">{error || "The requested product could not be loaded."}</p>
          <Link to="/catalog">
            <Button>Return to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-14 pb-8 sm:pt-16 sm:pb-12">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500">
          <Link to="/catalog" className="flex items-center gap-1 hover:text-rose-700">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Catalog
          </Link>
          <span className="text-stone-300">/</span>
          <Link to={`/catalog?tracker=${product.trackerId}`} className="hover:text-rose-700 truncate max-w-[100px] sm:max-w-none">
            {product.trackerName}
          </Link>
          <span className="text-stone-300 hidden sm:inline">/</span>
          <span className="hidden sm:inline max-w-[260px] truncate text-stone-900 sm:max-w-[320px]">{product.title}</span>
        </nav>

        <div className="mb-6 sm:mb-8 flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="flex flex-col gap-3">
            {/* Main Image with Desktop Sidebar */}
            <div className="relative flex w-full">
              {/* Desktop vertical thumbnails - left side */}
              {activeGallery.length > 0 && (
                <div className="hidden sm:flex absolute left-0 top-0 bottom-0 w-16 lg:w-20 flex-col gap-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-200 hover:[&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-track]:bg-transparent">
                  {activeGallery.map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={`shrink-0 w-full aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        activeImage === image ? "border-rose-400 shadow-sm" : "border-transparent hover:border-stone-200"
                      }`}
                    >
                      <img src={image} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
              
              <div className={`relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-stone-200 bg-white min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] ${activeGallery.length > 0 ? "sm:ml-[76px] lg:ml-[92px]" : ""}`}>
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.title}
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-stone-200 via-stone-100 to-white" />
                )}
              </div>
            </div>
            
            {/* Mobile thumbnails - below image */}
            {activeGallery.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:hidden">
                {activeGallery.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`shrink-0 w-16 h-16 rounded-lg border-2 transition-all overflow-hidden ${
                      activeImage === image ? "border-rose-400 shadow-sm" : "border-transparent hover:border-stone-200"
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                  {product.trackerName}
                </Badge>
                <Badge variant="secondary" className="text-[9px] sm:text-xs">{getAvailabilityLabel(activeAvailability)}</Badge>
              </div>
              <div className="text-xs sm:text-sm text-stone-500">ID: {product.listingId}</div>
            </div>

            <h1 className="mb-3 sm:mb-4 text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-stone-900">{product.title}</h1>

            <div className="mb-4 sm:mb-5 rounded-lg sm:rounded-xl border border-stone-100 bg-[#faf9f8] p-3 sm:p-4 lg:p-5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-stone-900">
                  {formatCurrency(selectedVariation.displayPrice, selectedVariation.currency)}
                </span>
              </div>
           
              {Object.keys(activeSelectedOptions).length > 0 && (
                <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-600">
                  Selected:{" "}
                  {Object.entries(activeSelectedOptions)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" | ")}
                </div>
              )}
            </div>

            {variationOptionGroups.length > 0 && (
              <div className="mb-4 sm:mb-5 space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-semibold text-stone-900">Choose options</h3>
                {variationOptionGroups.map((group) => (
                  <div key={group.key} className="space-y-1.5 sm:space-y-2">
                    <label htmlFor={`select-${group.key}`} className="text-xs sm:text-sm font-medium text-stone-700">
                      {group.key}
                    </label>
                    <div className="relative">
                      <select
                        id={`select-${group.key}`}
                        value={activeSelectedOptions[group.key] || group.values[0] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const nextSelection = resolveVariationSelection(
                            product,
                            {
                              ...activeSelectedOptions,
                              [group.key]: value,
                            },
                            group.key,
                          );
                          setSelectedOptions(nextSelection.selectedOptions);
                          setSelectedVariationId(nextSelection.variation.id);
                        }}
                        className="w-full appearance-none rounded-lg sm:rounded-xl border border-stone-200 bg-white px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm font-medium text-stone-700 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      >
                        {group.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-4 text-stone-500">
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-md sm:rounded-lg border border-stone-200 bg-stone-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-stone-600">
                  {selectedVariation.name} | {getAvailabilityLabel(activeAvailability)}
                </div>
              </div>
            )}

            {variationOptionGroups.length === 0 && product.variations.length > 1 && (
              <div className="mb-4 sm:mb-5">
                <h3 className="mb-2 text-xs sm:text-sm font-semibold text-stone-900">Variations</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {product.variations.map((variation) => (
                    <button
                      key={variation.id}
                      type="button"
                      className={`flex w-full flex-col gap-1.5 rounded-md sm:rounded-lg border px-2.5 sm:px-3 py-2 sm:py-2.5 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
                        selectedVariation.id === variation.id
                          ? "border-rose-300 bg-rose-50"
                          : "border-stone-200 bg-stone-50"
                      }`}
                      onClick={() => {
                        setSelectedVariationId(variation.id);
                        setSelectedOptions(extractSelectedOptions(variation.selects));
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium text-stone-900">{variation.name}</div>
                        <div className="text-[10px] sm:text-xs text-stone-500">
                          {Object.entries(extractSelectedOptions(variation.selects))
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" | ")}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-semibold text-stone-900">
                          {formatCurrency(variation.displayPrice, variation.currency)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-stone-500">{getAvailabilityLabel(variation.availability)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 sm:mb-5 flex flex-col gap-2">
              {session ? (
                <Button
                  size="lg"
                  className="h-11 sm:h-12 w-full rounded-full bg-rose-600 text-sm sm:text-base font-bold text-white hover:bg-rose-700"
                  onClick={() => setCheckoutOpen(true)}
                  disabled={activeAvailability !== "in_stock" || product.availability === "ended"}
                >
                  Checkout This Item
                </Button>
              ) : (
                <Link to="/auth/sign-in">
                  <Button size="lg" className="h-11 sm:h-12 w-full rounded-full bg-rose-600 text-sm sm:text-base font-bold text-white hover:bg-rose-700">
                    Sign In To Checkout
                  </Button>
                </Link>
              )}

              {canViewSourceListing ? (
                <a href={product.url || "#"} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="outline" className="h-11 sm:h-12 w-full rounded-full text-sm sm:text-base font-bold">
                    View Source Listing <ExternalLink className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </a>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:space-y-2 rounded-md sm:rounded-lg border border-stone-200 bg-stone-50 p-2.5 sm:p-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-stone-900" />
                <span className="font-medium">Handling:</span> {product.handlingNote || "Standard handling applies"}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-stone-900" />
                <span className="font-medium">Tracker:</span> {product.trackerName}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-stone-200 pt-6 sm:pt-8">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-stone-900">Product Notes</h2>
          <div className="space-y-2 sm:space-y-3 rounded-lg sm:rounded-xl border border-stone-200 bg-[#faf9f8] p-3 sm:p-4">
            <div className="leading-relaxed text-stone-700 whitespace-pre-wrap text-xs sm:text-sm">
              {product.description || "No extra product description has been added for this tracker item yet."}
            </div>
            <div className="text-xs sm:text-sm text-stone-500">
              Updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "No timestamp available"}
            </div>
          </div>
        </div>
      </div>

      <OrderFormModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={{
          listing_id: product.listingId,
          title: product.title,
          image: selectedVariation.heroImage || product.image,
          url: product.url,
          currency: product.currency,
        }}
        variation={{
          id: selectedVariation.id,
          var_id: selectedVariation.varId,
          name: selectedVariation.name,
          displayPrice: selectedVariation.displayPrice,
          selects: selectedVariation.selects,
        }}
        orderSource={trackerIdToOrderSource(product.trackerId)}
      />
    </div>
  );
}
