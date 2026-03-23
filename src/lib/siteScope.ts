export const SITE_KEY = "elevate_supply";

export function withElevateSiteKey<T extends Record<string, unknown>>(value: T) {
  return {
    ...value,
    site_key: SITE_KEY,
  };
}

export function isElevateOrderSiteKey(value: unknown): value is typeof SITE_KEY {
  return value === SITE_KEY;
}
