import type { CatalogProduct, CatalogVariation } from "./types";

export interface VariationOptionGroup {
  key: string;
  values: string[];
}

export interface ResolvedVariationSelection {
  variation: CatalogVariation;
  selectedOptions: Record<string, string>;
}

const SIGNAL_SUFFIX = "_signal";

function extractSelectableOptions(variation: CatalogVariation): Record<string, string> {
  return Object.fromEntries(
    Object.entries(variation.selects).filter(([key, value]) => !key.endsWith(SIGNAL_SUFFIX) && Boolean(value)),
  );
}

function scoreVariation(
  variation: CatalogVariation,
  desiredOptions: Record<string, string>,
  preferredKey?: string,
): number {
  const options = extractSelectableOptions(variation);
  let score = 0;

  for (const [key, value] of Object.entries(desiredOptions)) {
    if (options[key] === value) {
      score += key === preferredKey ? 100 : 1;
    }
  }

  return score;
}

function isVariationInStock(variation: CatalogVariation): boolean {
  return variation.availability === "in_stock";
}

export function buildVariationOptionGroups(variations: CatalogVariation[]): VariationOptionGroup[] {
  const groups = new Map<string, Set<string>>();

  for (const variation of variations) {
    for (const [key, value] of Object.entries(extractSelectableOptions(variation))) {
      const next = groups.get(key) || new Set<string>();
      next.add(value);
      groups.set(key, next);
    }
  }

  return [...groups.entries()]
    .map(([key, values]) => ({ key, values: [...values].sort((left, right) => left.localeCompare(right)) }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

export function resolveVariationSelection(
  product: CatalogProduct,
  desiredOptions: Record<string, string>,
  preferredKey?: string,
): ResolvedVariationSelection {
  const fallbackVariation = product.variations[0];
  if (!fallbackVariation) {
    throw new Error("resolveVariationSelection requires at least one variation");
  }

  let bestVariation = fallbackVariation;
  let bestScore = scoreVariation(fallbackVariation, desiredOptions, preferredKey);

  for (const variation of product.variations) {
    const score = scoreVariation(variation, desiredOptions, preferredKey);
    if (score > bestScore || (score === bestScore && isVariationInStock(variation) && !isVariationInStock(bestVariation))) {
      bestVariation = variation;
      bestScore = score;
    }
  }

  return {
    variation: bestVariation,
    selectedOptions: extractSelectableOptions(bestVariation),
  };
}

export function canSelectVariationOption(
  product: CatalogProduct,
  desiredOptions: Record<string, string>,
  key: string,
  value: string,
): boolean {
  if (product.availability === "ended" || product.variations.length === 0) {
    return false;
  }

  const resolvedSelection = resolveVariationSelection(
    product,
    {
      ...desiredOptions,
      [key]: value,
    },
    key,
  );

  return (
    resolvedSelection.selectedOptions[key] === value &&
    resolvedSelection.variation.availability === "in_stock"
  );
}
