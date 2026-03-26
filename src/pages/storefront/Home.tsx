import { Link } from "react-router-dom";
import { ArrowRight, Clock, Search, ShoppingCart, TrendingUp, Truck } from "lucide-react";

import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHomeCatalog } from "@/lib/catalog/publicHooks";
import { TRACKERS } from "@/lib/catalog/trackers";

export default function Home() {
  const { data, status, error } = useHomeCatalog();
  const trackers = data.trackers.length > 0 ? data.trackers : TRACKERS;

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f8] overflow-x-hidden">
      <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-stone-900 to-stone-950 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://assets.architecturaldigest.in/photos/62026064b5d9eefa7e4e2ddf/master/pass/How%20to%20furnish%20your%20home%20on%20a%20budget.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute -right-40 -top-40 h-[680px] w-[680px] rounded-full bg-rose-900/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-rose-950/40 blur-[100px]" />

        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="mb-6 rounded-full border-rose-800/50 bg-rose-950/50 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-rose-200 backdrop-blur-md"
              >
                Premium Fulfilment
              </Badge>
              <h1 className="mb-5 text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
                Wholesale Supply Built for{" "}
                <span className="bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text font-semibold text-transparent">
                  Dropshippers.
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-base font-light leading-relaxed text-stone-300 sm:text-lg">
                Elevate Supply helps dropshippers sell our inventory on their own platforms with automated stock and
                price syncing, plus reliable fulfilment within 2 working days, making it easy for beginners to get
                started.
              </p>
              <div className="mb-10 flex flex-col gap-3 sm:flex-row">
                <Link to="/catalog" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-14 w-full rounded-full bg-rose-700 px-8 text-base text-white shadow-[0_0_40px_-10px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] hover:bg-rose-600 sm:w-auto"
                  >
                    Browse Catalog
                  </Button>
                </Link>
                <Link to="/auth/create-account" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 w-full rounded-full border-stone-700 px-8 text-base text-stone-100 backdrop-blur-sm hover:bg-stone-800 hover:text-white sm:w-auto"
                  >
                    Apply for Account
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm font-medium text-stone-400 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> MOQ 1 Standard
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 24-48h Fulfilment
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Real-time Inventory
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Direct Pricing
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-stone-800/50 shadow-2xl transition-transform duration-700 hover:rotate-0 lg:rotate-2">
                <img
                  src="https://www.pnwbushcraft.com/cdn/shop/articles/Discovering_Excellence_Our_Favorite_Outdoor_Gear_Companies_1200x.png?v=1703363903"
                  alt="Premium products"
                  className="h-full w-full object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

                <div className="absolute bottom-8 left-6 right-6 rounded-xl border border-stone-700/50 bg-stone-900/80 p-6 shadow-2xl backdrop-blur-md lg:-rotate-2">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium uppercase tracking-wider text-stone-300">Live Inventory</div>
                    <TrendingUp className="h-5 w-5 text-rose-400" />
                  </div>
                  <div className="mb-2 text-3xl font-semibold text-white">{data.liveCount} products tracked</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-rose-300">
                    <ArrowRight className="h-4 w-4" />
                    {status === "ready"
                      ? "Current catalog is live now"
                      : status === "loading"
                        ? "Syncing latest stock"
                        : "Needs attention"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-12 bg-rose-700" />
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-700">Stock Categories</span>
              </div>
              <h2 className="mb-4 text-3xl font-light tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
                <span>Shop by </span>
                <span className="bg-gradient-to-r from-rose-700 to-rose-500 bg-clip-text font-semibold text-transparent">
                  Category
                </span>
              </h2>
            </div>
          </div>

          <div className="grid auto-rows-[280px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {trackers.map((tracker, index) => (
              <CategoryCard key={tracker.id} category={tracker} isLarge={index === 0} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f8] py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Live Catalog</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900">Featured Products</h2>
             
            </div>
            <Link to="/catalog" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-full border-stone-300 px-6 text-stone-700 hover:bg-stone-50 sm:w-auto">
                View All
              </Button>
            </Link>
          </div>

          {status === "loading" && <div className="text-stone-500">Loading products...</div>}
          {status === "error" && <div className="text-rose-700">{error || "Catalog could not be loaded."}</div>}
          {status === "ready" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {data.featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-stone-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">Fresh Updates</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-stone-900">Recently Updated Products</h2>
              <p className="max-w-2xl text-base text-stone-600 sm:text-lg">
                The latest listings refreshed from the worker-backed catalog in the last 24 hours.
              </p>
            </div>
            <Link to="/catalog" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-full border-stone-300 px-6 text-stone-700 hover:bg-stone-50 sm:w-auto">
                View All
              </Button>
            </Link>
          </div>

          {status === "loading" && <div className="text-stone-500">Loading updates...</div>}
          {status === "error" && <div className="text-rose-700">{error || "Catalog could not be loaded."}</div>}
          {status === "ready" && data.recentProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {data.recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : status === "ready" ? (
            <div className="text-stone-500">No recently updated products are available yet.</div>
          ) : null}
        </div>
      </section>

      <section className="relative overflow-hidden bg-stone-950 py-20 text-white sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://officeservicecompany.com/wp-content/uploads/2020/11/office_supplies-min-1024x684.jpg')] bg-cover bg-center opacity-5 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">Streamlined Operations</h2>
            <p className="text-base font-light leading-relaxed text-stone-400 sm:text-lg">
              We handle the logistics so you can focus on marketing and sales. Our operational workflow is built for
              speed, reliability, and scale.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            <div className="absolute left-[15%] right-[15%] top-16 z-0 hidden h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent md:block" />

            <div className="group relative z-10 text-center">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-stone-800 bg-stone-900 shadow-2xl transition-colors duration-500 group-hover:border-rose-800 sm:h-32 sm:w-32">
                <Search className="h-10 w-10 text-rose-500 sm:h-12 sm:w-12" />
              </div>
              <h3 className="mb-4 text-2xl font-semibold">1. Browse & List</h3>
              <p className="px-2 text-base font-light leading-relaxed text-stone-400">
                Discover live products from the catalog and post the listings you want into your own selling platform.
              </p>
            </div>

            <div className="group relative z-10 text-center">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-stone-800 bg-stone-900 shadow-2xl transition-colors duration-500 group-hover:border-rose-800 sm:h-32 sm:w-32">
                <ShoppingCart className="h-10 w-10 text-rose-500 sm:h-12 sm:w-12" />
              </div>
              <h3 className="mb-4 text-2xl font-semibold">2. Receive Orders</h3>
              <p className="px-2 text-base font-light leading-relaxed text-stone-400">
                Your customers place orders on your storefront and you place the order with us.
              </p>
            </div>

            <div className="group relative z-10 text-center">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-stone-800 bg-stone-900 shadow-2xl transition-colors duration-500 group-hover:border-rose-800 sm:h-32 sm:w-32">
                <Truck className="h-10 w-10 text-rose-500 sm:h-12 sm:w-12" />
              </div>
              <h3 className="mb-4 text-2xl font-semibold">3. We Fulfil</h3>
              <p className="px-2 text-base font-light leading-relaxed text-stone-400">
                We pick, pack, and ship directly to your customer with reliable handling and status tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-rose-950 py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://c02.purpledshub.com/uploads/sites/45/2025/09/small-kitchen-idea.jpg?webp=1&w=1200')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border border-rose-900/50 bg-stone-950/60 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10 md:p-16">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">Stay Ahead of the Market</h2>
            <p className="mx-auto mb-10 max-w-2xl text-base font-light text-rose-200/80 sm:text-lg">
              Join our network to receive inventory updates, sourcing insights, and early access to new premium product
              drops.
            </p>

            <form className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Business email address"
                className="h-14 flex-1 rounded-full border border-stone-700 bg-stone-900/80 px-6 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-600"
                required
              />
              <Button
                type="submit"
                className="h-14 rounded-full bg-rose-700 px-10 text-base font-semibold text-white shadow-lg shadow-rose-900/20 transition-all hover:scale-[1.02] hover:bg-rose-600"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-6 text-xs uppercase tracking-wider text-stone-500">We respect your inbox. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
