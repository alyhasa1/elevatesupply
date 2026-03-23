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
    <Card className="overflow-hidden flex flex-col h-full bg-white rounded-[20px] border-stone-100 shadow-sm hover:shadow-md transition-all duration-300">
      <Link
        to={`/product/${product.trackerId}/${encodeURIComponent(product.listingId)}`}
        className="relative aspect-[4/5] bg-stone-50 overflow-hidden block m-2 rounded-2xl"
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

      <CardContent className="p-5 pt-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-2 gap-4">
          <span className="text-[11px] text-stone-500 font-medium">{product.listingId}</span>
          <span className="text-[10px] font-bold tracking-wider text-rose-700 uppercase text-right">
            {product.trackerName}
          </span>
        </div>

        <Link
          to={`/product/${product.trackerId}/${encodeURIComponent(product.listingId)}`}
          className="hover:text-rose-700 transition-colors"
        >
          <h3 className="text-[15px] font-semibold text-stone-900 mb-5 line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-[#faf9f8] rounded-xl border border-stone-100 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-stone-500 mb-0.5 font-bold uppercase tracking-wider">Live Price</div>
              <div className="font-bold text-[22px] text-stone-900 leading-none">
                {formatCurrency(product.displayPrice, product.currency)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-white px-2.5 py-1.5 rounded-lg font-medium border border-stone-100 shadow-sm">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {product.variations.length > 0 ? `${product.variations.length} options` : "Single item"}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                product.availability === "in_stock" ? "bg-[#00c885]" : "bg-rose-500"
              }`}
            ></div>
            {getAvailabilityLabel(product.availability)}
          </div>
        </div>
      </CardContent>

      <div className="p-5 pt-0 mt-auto">
        <Link to={`/product/${product.trackerId}/${encodeURIComponent(product.listingId)}`} className="w-full block">
          <Button className="w-full bg-[#1c1917] hover:bg-stone-800 text-white rounded-xl h-11 font-medium text-sm">
            View Product
          </Button>
        </Link>
      </div>
    </Card>
  );
}
