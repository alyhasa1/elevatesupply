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
    <div className="min-h-screen bg-white pt-20 pb-16 sm:pt-24">
      <div className="container mx-auto max-w-7xl px-4">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-stone-500">
          <Link to="/catalog" className="flex items-center gap-1 hover:text-rose-700">
            <ArrowLeft className="h-4 w-4" /> Catalog
          </Link>
          <span className="text-stone-300">/</span>
          <Link to={`/catalog?tracker=${product.trackerId}`} className="hover:text-rose-700">
            {product.trackerName}
          </Link>
          <span className="text-stone-300">/</span>
          <span className="max-w-[260px] truncate text-stone-900 sm:max-w-[320px]">{product.title}</span>
        </nav>

        <div className="mb-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-white p-4 sm:p-8">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.title}
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-stone-200 via-stone-100 to-white" />
              )}
            </div>

            {activeGallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {activeGallery.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`aspect-square overflow-hidden rounded-xl border p-2 transition-colors ${
                      activeImage === image ? "border-rose-400 bg-rose-50" : "border-stone-200 bg-white"
                    }`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                  {product.trackerName}
                </Badge>
                <Badge variant="secondary">{getAvailabilityLabel(activeAvailability)}</Badge>
              </div>
              <div className="text-sm text-stone-500">Listing ID: {product.listingId}</div>
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">{product.title}</h1>

            <div className="mb-8 rounded-2xl border border-stone-100 bg-[#faf9f8] p-5 sm:p-6">
              <div className="mb-2 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-bold text-stone-900 sm:text-4xl">
                  {formatCurrency(selectedVariation.displayPrice, selectedVariation.currency)}
                </span>
              </div>
              <div className="text-sm text-stone-500">
                Base price: {formatCurrency(selectedVariation.basePrice, selectedVariation.currency)}
                {product.shippingPrice
                  ? ` | Shipping component: ${formatCurrency(product.shippingPrice, product.currency)}`
                  : ""}
              </div>
              {Object.keys(activeSelectedOptions).length > 0 && (
                <div className="mt-3 text-sm text-stone-600">
                  Selected:{" "}
                  {Object.entries(activeSelectedOptions)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" | ")}
                </div>
              )}
            </div>

            {variationOptionGroups.length > 0 && (
              <div className="mb-8 space-y-5">
                <h3 className="text-sm font-semibold text-stone-900">Choose options</h3>
                {variationOptionGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <div className="text-sm font-medium text-stone-700">{group.key}</div>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const isActive = activeSelectedOptions[group.key] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
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
                            className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                              isActive
                                ? "border-rose-400 bg-rose-50 text-rose-800"
                                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                  {selectedVariation.name} | {getAvailabilityLabel(activeAvailability)}
                </div>
              </div>
            )}

            {variationOptionGroups.length === 0 && product.variations.length > 1 && (
              <div className="mb-8">
                <h3 className="mb-3 text-sm font-semibold text-stone-900">Variations</h3>
                <div className="space-y-3">
                  {product.variations.map((variation) => (
                    <button
                      key={variation.id}
                      type="button"
                      className={`flex w-full flex-col gap-3 rounded-xl border px-4 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between ${
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
                        <div className="font-medium text-stone-900">{variation.name}</div>
                        <div className="text-xs text-stone-500">
                          {Object.entries(extractSelectedOptions(variation.selects))
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" | ")}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-semibold text-stone-900">
                          {formatCurrency(variation.displayPrice, variation.currency)}
                        </div>
                        <div className="text-xs text-stone-500">{getAvailabilityLabel(variation.availability)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 flex flex-col gap-3">
              {session ? (
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-rose-600 text-base font-bold text-white hover:bg-rose-700"
                  onClick={() => setCheckoutOpen(true)}
                  disabled={activeAvailability !== "in_stock" || product.availability === "ended"}
                >
                  Checkout This Item
                </Button>
              ) : (
                <Link to="/auth/sign-in">
                  <Button size="lg" className="h-12 w-full rounded-full bg-rose-600 text-base font-bold text-white hover:bg-rose-700">
                    Sign In To Checkout
                  </Button>
                </Link>
              )}

              {canViewSourceListing ? (
                <a href={product.url || "#"} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="outline" className="h-12 w-full rounded-full text-base font-bold">
                    View Source Listing <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : null}
            </div>

            <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <Truck className="h-5 w-5 text-stone-900" />
                <span className="font-medium">Handling:</span> {product.handlingNote || "Standard handling applies"}
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <ShieldCheck className="h-5 w-5 text-stone-900" />
                <span className="font-medium">Tracker:</span> {product.trackerName}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-12">
          <h2 className="mb-6 text-2xl font-bold text-stone-900">Product Notes</h2>
          <div className="space-y-4 rounded-xl border border-stone-200 bg-[#faf9f8] p-6">
            <p className="leading-relaxed text-stone-700">
              {product.description || "No extra product description has been added for this tracker item yet."}
            </p>
            <div className="text-sm text-stone-500">
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
