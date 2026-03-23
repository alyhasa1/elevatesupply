export function buildCatalogAuthHeaders(token: string | null | undefined): Record<string, string> {
  const value = token?.trim();
  if (!value) return {};
  return {
    Authorization: `Bearer ${value}`,
  };
}
