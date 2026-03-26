import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getAvailabilityLabel } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/lib/catalog/types";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full bg-white rounded-[16px] border-stone-100 shadow-sm hover:shadow-md transition-all duration-300">
      <Link
        to={`/product/${product.trackerId}/${encodeURIComponent(product.listingId)}`}
        className="relative aspect-square bg-stone-50 overflow-hidden block m-1.5 rounded-xl"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 via-stone-100 to-white" />
        )}
      </Link>

      <CardContent className="p-4 pt-3 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-1.5 gap-2">
          <span className="text-[10px] text-stone-500 font-medium">{product.listingId}</span>
          <span className="text-[9px] font-bold tracking-wider text-rose-700 uppercase text-right truncate">
            {product.trackerName}
          </span>
        </div>

        <Link
          to={`/product/${product.trackerId}/${encodeURIComponent(product.listingId)}`}
          className="hover:text-rose-700 transition-colors"
        >
          <h3 className="text-sm font-semibold text-stone-900 mb-3 line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto space-y-3">
          <div className="p-3 bg-[#faf9f8] rounded-xl border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <div className="text-[9px] text-stone-500 mb-0.5 font-bold uppercase tracking-wider">Live Price</div>
              <div className="font-bold text-lg text-stone-900 leading-none">
                {formatCurrency(product.displayPrice, product.currency)}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-600 bg-white px-2 py-1 rounded-lg font-medium border border-stone-100 shadow-sm whitespace-nowrap self-start sm:self-auto">
              <ArrowUpRight className="w-3 h-3 shrink-0" />
              {product.variations.length > 0 ? `${product.variations.length} options` : "Single item"}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-medium text-stone-500">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                product.availability === "in_stock" ? "bg-[#00c885]" : "bg-rose-500"
              }`}
            ></div>
            {getAvailabilityLabel(product.availability)}
          </div>
        </div>
      </CardContent>

      <div className="p-4 pt-0 mt-auto">
        <Link to={`/product/${product.trackerId}/${encodeURIComponent(product.listingId)}`} className="w-full block">
          <Button className="w-full bg-[#1c1917] hover:bg-stone-800 text-white rounded-xl h-9 font-medium text-xs">
            View Product
          </Button>
        </Link>
      </div>
    </Card>
  );
}
