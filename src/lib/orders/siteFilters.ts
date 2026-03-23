import { SITE_KEY } from "@/lib/siteScope";

export function filterElevateOrders<T extends { site_key?: string | null }>(rows: T[]) {
  return rows.filter((row) => row.site_key === SITE_KEY);
}
