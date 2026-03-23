import { filterElevateOrders } from "./siteFilters";

export function summarizeElevateOrders(
  rows: Array<{ site_key?: string | null; total: number; status: string }>,
) {
  const filtered = filterElevateOrders(rows);
  const byStatus = filtered.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.status] = (accumulator[row.status] || 0) + 1;
    return accumulator;
  }, {});

  return {
    totalOrders: filtered.length,
    totalValue: filtered.reduce((sum, row) => sum + Number(row.total), 0),
    byStatus,
  };
}
