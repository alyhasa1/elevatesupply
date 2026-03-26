import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { TrackerDefinition } from "@/lib/catalog/types";

interface CategoryCardProps {
  category: TrackerDefinition;
  isLarge?: boolean;
}

export function CategoryCard({ category, isLarge = false }: CategoryCardProps) {
  return (
    <Link
      to={`/catalog?tracker=${category.id}`}
      className={`group flex h-full min-h-[280px] relative overflow-hidden rounded-2xl ${
        isLarge ? "md:col-span-2 md:row-span-2 md:min-h-[576px]" : "col-span-1 row-span-1"
      } shadow-sm hover:shadow-2xl hover:shadow-rose-900/20 transition-all duration-500 bg-stone-100 border border-stone-200`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 transition-transform duration-1000 group-hover:scale-105"></div>
      <div className="absolute inset-0 bg-rose-900/10 mix-blend-overlay"></div>

      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            {category.statusText}
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:-rotate-45 transition-all" />
          </div>
        </div>

        <div>
          <h3 className={`${isLarge ? "text-3xl lg:text-4xl" : "text-xl"} font-semibold text-white mb-3 tracking-tight`}>
            {category.name}
          </h3>
          <p className={`text-stone-300 font-light ${isLarge ? "text-base max-w-md" : "text-sm"} line-clamp-3`}>
            {category.description}
          </p>

          <div className="mt-6 flex items-center text-rose-300 font-medium text-sm group-hover:text-rose-400 transition-colors">
            Open Tracker <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
