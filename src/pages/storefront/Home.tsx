import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { useCatalog } from "@/lib/catalog/context";
import { TRACKERS } from "@/lib/catalog/trackers";
import { isUpdatedWithinHours } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/lib/catalog/types";

function buildHomeProductGroups(products: CatalogProduct[]) {
  const featuredProducts = products.slice(0, 4);
  const recentProducts = products.filter((product) => isUpdatedWithinHours(product, 24));
  const fallbackPool = products.filter((product) => !featuredProducts.some((entry) => entry.id === product.id));
  const secondaryProducts = [...recentProducts, ...fallbackPool].filter(
    (product, index, array) => array.findIndex((entry) => entry.id === product.id) === index,
  );

  return {
    featuredProducts,
    recentProducts: secondaryProducts.slice(0, 4),
  };
}

export default function Home() {
  const { products, status, error } = useCatalog();
  const { featuredProducts, recentProducts } = buildHomeProductGroups(products);
  const liveCount = products.filter((product) => product.availability === "in_stock").length;

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f8]">
      <section className="relative bg-stone-950 text-white overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-stone-900 to-stone-950 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://assets.architecturaldigest.in/photos/62026064b5d9eefa7e4e2ddf/master/pass/How%20to%20furnish%20your%20home%20on%20a%20budget.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-rose-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-rose-950/40 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="mb-8 rounded-full px-4 py-1.5 bg-rose-950/50 text-rose-200 border-rose-800/50 backdrop-blur-md uppercase tracking-widest text-[10px] font-semibold"
              >
                Premium Fulfilment
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-6 leading-[1.1]">
                Wholesale Supply Built for{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-rose-400">
                  Dropshippers.
                </span>
              </h1>
              <p className="text-lg text-stone-300 mb-10 max-w-xl leading-relaxed font-light">
                Elevate Supply helps dropshippers sell our inventory on their own platforms with automated stock and
                price syncing, plus reliable fulfilment within 2 working days, making it easy for beginners to get
                started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/catalog">
                  <Button
                    size="lg"
                    className="bg-rose-700 hover:bg-rose-600 text-white h-14 px-8 text-base rounded-full shadow-[0_0_40px_-10px_rgba(225,29,72,0.4)] transition-all hover:scale-105"
                  >
                    Browse Catalog
                  </Button>
                </Link>
                <Link to="/auth/create-account">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-stone-700 text-stone-100 hover:bg-stone-800 hover:text-white h-14 px-8 text-base rounded-full backdrop-blur-sm"
                  >
                    Apply for Account
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm font-medium text-stone-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> MOQ 1 Standard
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 24-48h Fulfilment
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Real-time Inventory
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Direct Pricing
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-stone-800/50 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                <img
                  src="https://www.pnwbushcraft.com/cdn/shop/articles/Discovering_Excellence_Our_Favorite_Outdoor_Gear_Companies_1200x.png?v=1703363903"
                  alt="Premium products"
                  className="w-full h-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent"></div>

                <div className="absolute bottom-8 left-8 right-8 bg-stone-900/80 backdrop-blur-md border border-stone-700/50 rounded-xl p-6 transform -rotate-2 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-stone-300 text-sm font-medium uppercase tracking-wider">Live Inventory</div>
                    <TrendingUp className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-3xl font-semibold text-white mb-2">{liveCount} products tracked</div>
                  <div className="flex items-center gap-2 text-rose-300 text-sm font-medium">
                    <ArrowRight className="w-4 h-4" />
                    {status === "ready" ? "Current catalog is live now" : status === "loading" ? "Syncing latest stock" : "Needs attention"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-rose-700"></div>
                <span className="font-semibold text-rose-700 tracking-widest uppercase text-xs">Tracker Categories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-6">
                Shop by <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-rose-500">Tracker</span>
              </h2>
            </div>
            <Link to="/catalog">
              <Button
                variant="outline"
                className="text-stone-900 border-stone-300 hover:bg-stone-100 rounded-full px-8 h-12 hidden sm:flex font-medium transition-all hover:scale-105 shadow-sm"
              >
                View All Categories <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px]">
            {TRACKERS.map((tracker, index) => (
              <CategoryCard key={tracker.id} category={tracker} isLarge={index === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-y border-stone-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-rose-700" />
                <span className="font-bold text-rose-700 tracking-wider uppercase text-xs">Live Catalog</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 mb-4">Featured Products</h2>
              <p className="text-stone-600 max-w-2xl text-lg">
                Current live listings pulled into the catalog so you can browse the real products instead of mock data.
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline" className="hidden sm:flex border-stone-300 text-stone-700 hover:bg-stone-50 rounded-full px-6">
                View All
              </Button>
            </Link>
          </div>

          {status === "loading" && <div className="text-stone-500">Loading products...</div>}
          {status === "error" && <div className="text-rose-700">{error || "Catalog could not be loaded."}</div>}
          {status === "ready" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-[#faf9f8]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-stone-800" />
                <span className="font-bold text-stone-800 tracking-wider uppercase text-xs">Fresh Updates</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 mb-4">Recently Updated Products</h2>
              <p className="text-stone-600 max-w-2xl text-lg">
                The latest listings refreshed from the worker-backed catalog in the last 24 hours.
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline" className="hidden sm:flex border-stone-300 text-stone-700 hover:bg-stone-50 rounded-full px-6">
                View All
              </Button>
            </Link>
          </div>

          {status === "loading" && <div className="text-stone-500">Loading updates...</div>}
          {status === "error" && <div className="text-rose-700">{error || "Catalog could not be loaded."}</div>}
          {status === "ready" && recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : status === "ready" ? (
            <div className="text-stone-500">No recently updated products are available yet.</div>
          ) : null}
        </div>
      </section>

      <section className="py-32 bg-stone-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://officeservicecompany.com/wp-content/uploads/2020/11/office_supplies-min-1024x684.jpg')] opacity-5 mix-blend-overlay bg-cover bg-center"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Streamlined Operations</h2>
            <p className="text-stone-400 text-lg font-light leading-relaxed">
              We handle the logistics so you can focus on marketing and sales. Our operational workflow is built for
              speed, reliability, and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent z-0"></div>

            <div className="relative z-10 text-center group">
              <div className="w-32 h-32 mx-auto bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-8 shadow-2xl group-hover:border-rose-800 transition-colors duration-500">
                <Search className="w-12 h-12 text-rose-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Browse & List</h3>
              <p className="text-stone-400 text-base leading-relaxed font-light px-4">
                Discover live products from the catalog and post the listings you want into your own selling platform.
              </p>
            </div>

            <div className="relative z-10 text-center group">
              <div className="w-32 h-32 mx-auto bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-8 shadow-2xl group-hover:border-rose-800 transition-colors duration-500">
                <ShoppingCart className="w-12 h-12 text-rose-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. Receive Orders</h3>
              <p className="text-stone-400 text-base leading-relaxed font-light px-4">
                Your customers place orders on your storefront you place order with us.
              </p>
            </div>

            <div className="relative z-10 text-center group">
              <div className="w-32 h-32 mx-auto bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-8 shadow-2xl group-hover:border-rose-800 transition-colors duration-500">
                <Truck className="w-12 h-12 text-rose-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. We Fulfil</h3>
              <p className="text-stone-400 text-base leading-relaxed font-light px-4">
                We pick, pack, and ship directly to your customer with reliable handling and status tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-rose-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://c02.purpledshub.com/uploads/sites/45/2025/09/small-kitchen-idea.jpg?webp=1&w=1200')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-stone-950/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-900/50 p-10 md:p-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-6">Stay Ahead of the Market</h2>
            <p className="text-rose-200/80 mb-10 max-w-2xl mx-auto text-lg font-light">
              Join our network to receive inventory updates, sourcing insights, and early access to new premium product
              drops.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Business email address"
                className="flex-1 h-14 px-6 rounded-full bg-stone-900/80 border border-stone-700 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-600 transition-all"
                required
              />
              <Button
                type="submit"
                className="h-14 px-10 rounded-full bg-rose-700 hover:bg-rose-600 text-white font-semibold text-base shadow-lg shadow-rose-900/20 transition-all hover:scale-105"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-stone-500 mt-6 uppercase tracking-wider">We respect your inbox. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
