import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, ShieldCheck, Truck } from "lucide-react";

import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getAvailabilityLabel } from "@/lib/catalog/format";
import { useCatalog } from "@/lib/catalog/context";
import { trackerIdToOrderSource } from "@/lib/orders/trackerOrderSource";
import { buildVariationOptionGroups, resolveVariationSelection } from "@/lib/catalog/variationSelection";

export default function ProductDetail() {
  const { trackerId, listingId } = useParams<{ trackerId: string; listingId: string }>();
  const { products, status } = useCatalog();
  const { session } = useAuth();
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const product = products.find(
    (entry) => entry.trackerId === trackerId && entry.listingId === decodeURIComponent(listingId || ""),
  );

  useEffect(() => {
    setSelectedVariationId(product?.variations[0]?.id || null);
    if (product?.variations.length) {
      setSelectedOptions(resolveVariationSelection(product, {}).selectedOptions);
    } else {
      setSelectedOptions({});
    }
  }, [product]);

  const variationOptionGroups = useMemo(
    () => buildVariationOptionGroups(product?.variations || []),
    [product?.variations],
  );

  if (status === "loading") {
    return <div className="min-h-screen bg-white pt-24 px-4">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/catalog">
            <Button>Return to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const groupedSelection =
    variationOptionGroups.length > 0 && product.variations.length > 0
      ? resolveVariationSelection(product, selectedOptions)
      : null;

  const selectedVariation =
    groupedSelection?.variation ||
    product.variations.find((variation) => variation.id === selectedVariationId) ||
    product.variations[0] || {
      id: `${product.listingId}_standard`,
      listingId: product.listingId,
      varId: "standard",
      name: "Standard",
      basePrice: product.basePrice,
      displayPrice: product.displayPrice,
      currency: product.currency,
      availability: product.availability,
      selects: {},
      projectOverrideBasePrice: null,
    };
  const activeSelectedOptions =
    groupedSelection?.selectedOptions ||
    Object.fromEntries(
      Object.entries(selectedVariation.selects).filter(([key, value]) => !key.endsWith("_signal") && Boolean(value)),
    );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <nav className="flex items-center gap-2 text-sm text-stone-500 mb-6 font-medium">
          <Link to="/catalog" className="hover:text-rose-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Catalog
          </Link>
          <span className="text-stone-300">/</span>
          <Link to={`/catalog?tracker=${product.trackerId}`} className="hover:text-rose-700">
            {product.trackerName}
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 truncate max-w-[300px]">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square bg-white rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center p-8">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white rounded-xl" />
              )}
            </div>

            {product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(0, 4).map((image) => (
                  <div key={image} className="aspect-square rounded-lg border-2 overflow-hidden p-2 border-stone-200">
                    <img src={image} alt="" className="w-full h-full object-contain opacity-80" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="uppercase tracking-[0.2em] text-[10px]">
                  {product.trackerName}
                </Badge>
                <Badge variant="secondary">{getAvailabilityLabel(product.availability)}</Badge>
              </div>
              <div className="text-sm text-stone-500">Listing ID: {product.listingId}</div>
            </div>

            <h1 className="text-3xl font-bold text-stone-900 mb-4 leading-tight">{product.title}</h1>

            <div className="bg-[#faf9f8] p-6 rounded-xl border border-stone-100 mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-stone-900">
                  {formatCurrency(selectedVariation.displayPrice, selectedVariation.currency)}
                </span>
              </div>
              <div className="text-sm text-stone-500">
                Base price: {formatCurrency(selectedVariation.basePrice, selectedVariation.currency)}
                {product.shippingPrice ? ` | Shipping component: ${formatCurrency(product.shippingPrice, product.currency)}` : ""}
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
              <div className="mb-8 space-y-4">
                <h3 className="text-sm font-semibold text-stone-900">Choose Options</h3>
                {variationOptionGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <label className="block text-sm font-medium text-stone-700">{group.key}</label>
                    <select
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900"
                      value={activeSelectedOptions[group.key] || ""}
                      onChange={(event) => {
                        const nextSelection = resolveVariationSelection(
                          product,
                          {
                            ...activeSelectedOptions,
                            [group.key]: event.target.value,
                          },
                          group.key,
                        );
                        setSelectedOptions(nextSelection.selectedOptions);
                      }}
                    >
                      {group.values.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                  {selectedVariation.name} | {getAvailabilityLabel(selectedVariation.availability)}
                </div>
              </div>
            )}

            {variationOptionGroups.length === 0 && product.variations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Variations</h3>
                <div className="space-y-3">
                  {product.variations.map((variation) => (
                    <button
                      key={variation.id}
                      type="button"
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 gap-4 text-left transition-colors ${
                        selectedVariation.id === variation.id
                          ? "border-rose-300 bg-rose-50"
                          : "border-stone-200 bg-stone-50"
                      }`}
                      onClick={() => setSelectedVariationId(variation.id)}
                    >
                      <div>
                        <div className="font-medium text-stone-900">{variation.name}</div>
                        <div className="text-xs text-stone-500">
                          {Object.entries(variation.selects)
                            .filter(([key, value]) => !key.endsWith("_signal") && Boolean(value))
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" | ")}
                        </div>
                      </div>
                      <div className="text-right">
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

            <div className="flex flex-col gap-3 mb-8">
              {session ? (
                <Button
                  size="lg"
                  className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-base"
                  onClick={() => setCheckoutOpen(true)}
                  disabled={selectedVariation.availability !== "in_stock" || product.availability === "ended"}
                >
                  Checkout This Item
                </Button>
              ) : (
                <Link to="/auth/sign-in">
                  <Button size="lg" className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-base">
                    Sign In To Checkout
                  </Button>
                </Link>
              )}

              {product.url ? (
                <a href={product.url} target="_blank" rel="noreferrer">
                  <Button size="lg" variant="outline" className="w-full h-12 rounded-full font-bold text-base">
                    View Source Listing <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              ) : null}
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <Truck className="w-5 h-5 text-stone-900" />
                <span className="font-medium">Handling:</span> {product.handlingNote || "Standard handling applies"}
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <ShieldCheck className="w-5 h-5 text-stone-900" />
                <span className="font-medium">Tracker:</span> {product.trackerName}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-12 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-stone-900">Product Notes</h2>
          <div className="p-6 bg-[#faf9f8] border border-stone-200 rounded-xl space-y-4">
            <p className="text-stone-700 leading-relaxed">
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
          image: product.image,
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
