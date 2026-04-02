import { Link } from "react-router-dom";
import type { TrackerDefinition } from "@/lib/catalog/types";

interface CategoryCardProps {
  category: TrackerDefinition;
  isLarge?: boolean;
  isWide?: boolean;
}

export function CategoryCard({ category, isLarge = false, isWide = false }: CategoryCardProps) {
  const hasBg = Boolean(category.bgImage);

  const spanClasses = isLarge
    ? "md:col-span-2 md:row-span-2 md:min-h-[576px]"
    : isWide
      ? "sm:col-span-2 col-span-1 row-span-1"
      : "col-span-1 row-span-1";

  return (
    <Link
      to={`/catalog?tracker=${category.id}`}
      className={`group flex h-full min-h-[280px] relative overflow-hidden rounded-2xl ${spanClasses} shadow-sm hover:shadow-2xl hover:shadow-orange-900/20 transition-all duration-500 border border-stone-200 ${
        hasBg ? "bg-stone-900" : "bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950"
      }`}
    >
      {hasBg && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: `url('${category.bgImage}')` }}
        />
      )}
      <div className={`absolute inset-0 ${hasBg ? "bg-gradient-to-t from-stone-950/80 via-stone-900/30 to-stone-900/5" : "bg-gradient-to-t from-stone-950/60 to-transparent"}`} />

      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className={`${isLarge ? "text-3xl lg:text-4xl" : "text-xl"} font-semibold text-white tracking-tight drop-shadow-md`}>
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
