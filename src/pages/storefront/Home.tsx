import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, ShoppingCart, TrendingUp, Truck } from "lucide-react";

import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import SEO, { buildOrganizationSchema, buildWebSiteSchema, buildFAQSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCatalogPage, useHomeCatalog } from "@/lib/catalog/publicHooks";
import { TRACKERS } from "@/lib/catalog/trackers";

export default function Home() {
  const { data, status, error } = useHomeCatalog();
  const activeTrackers = useMemo(() => {
    const apiTrackers = data?.trackers || [];
    if (apiTrackers.length === 0) return TRACKERS;
    // Map API trackers to local definitions to preserve bgImage and ensure we only show valid trackers
    return apiTrackers
      .map(apiTracker => {
        const localTracker = TRACKERS.find(t => t.id === apiTracker.id);
        if (!localTracker) return null;
        return { ...apiTracker, bgImage: localTracker.bgImage };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [data?.trackers]);

  const { data: featuredData, status: featuredStatus, error: featuredError } = useCatalogPage({
    page: 1,
    pageSize: 24,
    q: "",
    tracker: "all",
    availability: "all",
  });

  const allFeaturedProducts = useMemo(() => {
    if (!featuredData?.products) return [];
    const textile = featuredData.products.filter((p) => p.trackerId === "tims_textile");
    const others = featuredData.products.filter((p) => p.trackerId !== "tims_textile");
    return [...textile, ...others];
  }, [featuredData?.products]);

  return (
    <div className="flex flex-col">
      <SEO
        canonical="/"
        jsonLd={[
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          buildFAQSchema([
            {
              question: "What is Elevate Supply?",
              answer: "Elevate Supply is a UK wholesale dropshipping platform that helps dropshippers sell inventory on their own platforms with automated stock and price syncing, plus reliable fulfilment within 2 working days.",
            },
            {
              question: "How does dropshipping work with Elevate Supply?",
              answer: "Browse our live catalog, list products on your selling platform, receive orders from your customers, and we handle picking, packing, and shipping directly to your customer with status tracking.",
            },
            {
              question: "How fast is Elevate Supply fulfilment?",
              answer: "We provide reliable fulfilment within 2 working days, with status tracking on every order.",
            },
          ]),
        ]}
      />
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-transparent" />
        <div className="absolute -right-40 -top-40 h-[680px] w-[680px] rounded-full bg-orange-900/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-orange-950/40 blur-[100px]" />

        <div className="container max-w-7xl relative z-10 mx-auto px-4 py-14 sm:py-18 lg:py-24">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-orange-800/50 bg-orange-950/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-orange-200 backdrop-blur-md"
            >
              Premium Fulfilment
            </Badge>
            <h1 className="mb-4 text-3xl font-light leading-[1.05] tracking-tight sm:text-4xl lg:text-6xl">
              Wholesale Supply Built for{" "}
              <span className="bg-gradient-to-r from-orange-200 to-orange-400 bg-clip-text font-semibold text-transparent">
                Dropshippers.
              </span>
            </h1>
            <p className="mb-6 max-w-xl text-base font-light leading-relaxed text-stone-300">
              Elevate Supply helps dropshippers sell our inventory on their own platforms with automated stock and
              price syncing, plus reliable fulfilment within 2 working days, making it easy for beginners to get
              started.
            </p>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/catalog" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-orange-700 px-6 text-base text-white shadow-[0_0_40px_-10px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] hover:bg-orange-600 sm:w-auto"
                >
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-10 bg-orange-700" />
                <span className="text-xs font-semibold uppercase tracking-widest text-orange-700">Stock Categories</span>
              </div>
              <h2 className="mb-3 text-2xl font-light tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
                <span>Shop by </span>
                <span className="bg-gradient-to-r from-orange-700 to-orange-500 bg-clip-text font-semibold text-transparent">
                  Category
                </span>
              </h2>
            </div>
          </div>

          <div className="grid auto-rows-[280px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {activeTrackers.map((tracker, index) => (
              <CategoryCard
                key={tracker.id}
                category={tracker}
                isLarge={index === 0}
                isWide={index === activeTrackers.length - 1 && index !== 0}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f8] py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Live Catalog</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-stone-900">Featured Products</h2>
            </div>
            <Link to="/catalog?tracker=tims_textile" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full rounded-full border-stone-300 px-6 text-stone-700 hover:bg-stone-50 sm:w-auto">
                View All
              </Button>
            </Link>
          </div>

          {featuredStatus === "loading" && <div className="text-stone-500">Loading products...</div>}
          {featuredStatus === "error" && <div className="text-orange-700">{featuredError || "Catalog could not be loaded."}</div>}
          {featuredStatus === "ready" && allFeaturedProducts.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {allFeaturedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Link to="/catalog">
                  <Button className="h-12 rounded-full bg-orange-700 px-8 text-base text-white shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] hover:bg-orange-600">
                    Browse All Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-stone-50 py-16 text-stone-900 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[url('https://officeservicecompany.com/wp-content/uploads/2020/11/office_supplies-min-1024x684.jpg')] bg-cover bg-center opacity-[0.03] mix-blend-multiply" />
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-stone-200/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-400/5 blur-[100px]" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl text-stone-900">Streamlined Operations</h2>
            <p className="text-base font-light leading-relaxed text-stone-600">
              We handle the logistics so you can focus on marketing and sales. Our operational workflow is built for
              speed, reliability, and scale.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            <div className="absolute left-[15%] right-[15%] top-14 z-0 hidden h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent md:block" />

            <div className="group relative z-10 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-stone-200 bg-white shadow-xl shadow-stone-900/5 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-orange-200 group-hover:shadow-orange-900/10 sm:h-28 sm:w-28">
                <Search className="h-9 w-9 text-stone-400 transition-all duration-500 group-hover:scale-110 group-hover:text-orange-600 sm:h-10 sm:w-10" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-stone-900">1. Browse & List</h3>
              <p className="text-base font-light leading-relaxed text-stone-600">
                Discover live products from the catalog and post the listings you want into your own selling platform.
              </p>
            </div>

            <div className="group relative z-10 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-stone-200 bg-white shadow-xl shadow-stone-900/5 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-orange-200 group-hover:shadow-orange-900/10 sm:h-28 sm:w-28">
                <ShoppingCart className="h-9 w-9 text-stone-400 transition-all duration-500 group-hover:scale-110 group-hover:text-orange-600 sm:h-10 sm:w-10" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-stone-900">2. Receive Orders</h3>
              <p className="text-base font-light leading-relaxed text-stone-600">
                Your customers place orders on your storefront and you place the order with us.
              </p>
            </div>

            <div className="group relative z-10 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-stone-200 bg-white shadow-xl shadow-stone-900/5 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-orange-200 group-hover:shadow-orange-900/10 sm:h-28 sm:w-28">
                <Truck className="h-9 w-9 text-stone-400 transition-all duration-500 group-hover:scale-110 group-hover:text-orange-600 sm:h-10 sm:w-10" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-stone-900">3. We Fulfil</h3>
              <p className="text-base font-light leading-relaxed text-stone-600">
                We pick, pack, and ship directly to your customer with reliable handling and status tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-orange-950 py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[url('https://c02.purpledshub.com/uploads/sites/45/2025/09/small-kitchen-idea.jpg?webp=1&w=1200')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-2xl border border-orange-900/50 bg-stone-950/60 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8 md:p-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">Stay Ahead of the Market</h2>
            <p className="mx-auto mb-8 max-w-2xl text-base font-light text-orange-200/80">
              Join our network to receive inventory updates, sourcing insights, and early access to new premium product
              drops.
            </p>

            <form className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Business email address"
                className="h-12 flex-1 rounded-full border border-stone-700 bg-stone-900/80 px-5 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
                required
              />
              <Button
                type="submit"
                className="h-12 rounded-full bg-orange-700 px-8 text-base font-semibold text-white shadow-lg shadow-orange-900/20 transition-all hover:scale-[1.02] hover:bg-orange-600"
              >
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">We respect your inbox. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
