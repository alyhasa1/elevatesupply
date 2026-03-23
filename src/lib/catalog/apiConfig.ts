export const MISSING_CATALOG_API_BASE_ERROR =
  "VITE_ELEVATE_CATALOG_API_URL is not configured. Set it to the deployed elevate-catalog-worker URL.";

export function normalizeCatalogApiBase(value: string | null | undefined): string {
  return (value || "").trim().replace(/\/+$/, "");
}

export function buildCatalogApiUrl(base: string | null | undefined, path: string): string {
  const normalizedBase = normalizeCatalogApiBase(base);
  if (!normalizedBase) {
    throw new Error(MISSING_CATALOG_API_BASE_ERROR);
  }

  return `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
}
