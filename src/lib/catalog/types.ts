export type TrackerId =
  | "tims_textile"
  | "tiktok_ds"
  | "wholesale_items"
  | "pakistani_jackets"
  | "account_building";

export type Availability = "in_stock" | "out_of_stock" | "ended";
export type CatalogAvailabilityFilter = "all" | Availability;

export interface TrackerDefinition {
  id: TrackerId;
  name: string;
  slug: string;
  description: string;
  statusText: string;
}

export interface CatalogVariation {
  id: string;
  listingId: string;
  varId: string;
  name: string;
  basePrice: number;
  displayPrice: number;
  currency: string;
  availability: Availability;
  selects: Record<string, string>;
  heroImage: string | null;
  projectOverrideBasePrice?: number | null;
}

export interface CatalogProduct {
  id: string;
  trackerId: TrackerId;
  trackerName: string;
  listingId: string;
  title: string;
  description: string;
  sku: string;
  currency: string;
  basePrice: number;
  displayPrice: number;
  shippingPrice: number | null;
  image: string | null;
  images: string[];
  availability: Availability;
  url: string | null;
  handlingNote: string | null;
  updatedAt: string | null;
  variations: CatalogVariation[];
  projectOverrideBasePrice?: number | null;
  projectOverrideShippingPrice?: number | null;
  adminEditable?: boolean;
}

export interface CatalogSnapshot {
  trackers: TrackerDefinition[];
  products: CatalogProduct[];
  updatedAt: string;
}

export interface HomeCatalogPayload {
  trackers: TrackerDefinition[];
  featuredProducts: CatalogProduct[];
  recentProducts: CatalogProduct[];
  liveCount: number;
  updatedAt: string;
}

export interface PublicCatalogPageQuery {
  page: number;
  pageSize: number;
  q: string;
  tracker: TrackerId | "all";
  availability: CatalogAvailabilityFilter;
}

export interface PublicCatalogPage {
  trackers: TrackerDefinition[];
  products: CatalogProduct[];
  updatedAt: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  query: PublicCatalogPageQuery;
}

export interface AdminCatalogPageQuery {
  page: number;
  pageSize: number;
  q: string;
  tracker: TrackerId | "all";
}

export interface AdminCatalogPage {
  trackers: TrackerDefinition[];
  products: CatalogProduct[];
  updatedAt: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  query: AdminCatalogPageQuery;
}

export interface BaseVariationRecord {
  id: string;
  listing_id: string;
  var_id: string;
  price: number;
  currency?: string | null;
  out_of_stock?: boolean | number | null;
  selects?: Record<string, string> | null;
  name?: string | null;
  image?: string | null;
}

export interface BaseListingRecord<TVariation extends BaseVariationRecord = BaseVariationRecord> {
  listing_id: string;
  title: string;
  price: number;
  currency?: string | null;
  image?: string | null;
  images?: string[] | null;
  url?: string | null;
  description?: string | null;
  handling_time?: string | null;
  shipping_price?: number | null;
  ended?: boolean | number | null;
  out_of_stock?: boolean | number | null;
  updated_at?: string | null;
  scraped_at?: string | null;
  variations?: TVariation[] | null;
}

export interface ListingContentOverride {
  trackerId: TrackerId;
  listingId: string;
  description?: string | null;
  image?: string | null;
  images?: string[] | null;
}

export interface VariationMediaOverride {
  trackerId: TrackerId;
  listingId: string;
  variationId: string;
  heroImage?: string | null;
}

export type VariationMediaOverrideMap = Map<string, Pick<VariationMediaOverride, "heroImage">>;
