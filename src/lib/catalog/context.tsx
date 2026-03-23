import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  createEmptySnapshot,
  fetchCatalogSnapshot,
  patchJacketListing,
  patchJacketVariation,
  patchListingPriceOverride,
  patchShippingOverride,
  patchVariationPriceOverride,
} from "./api";
import type { CatalogProduct, CatalogSnapshot, TrackerId } from "./types";

type Status = "idle" | "loading" | "ready" | "error";

interface CatalogContextValue {
  snapshot: CatalogSnapshot;
  products: CatalogProduct[];
  status: Status;
  error: string | null;
  canAdminWrite: boolean;
  refresh: () => Promise<void>;
  saveListingPrice: (payload: {
    trackerId: TrackerId;
    listingId: string;
    basePrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveVariationPrice: (payload: {
    trackerId: TrackerId;
    listingId: string;
    variationId: string;
    basePrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveShippingPrice: (payload: {
    listingId: string;
    shippingPrice?: number;
    clearOverride?: boolean;
  }) => Promise<void>;
  saveJacketListing: (listingId: string, payload: Record<string, unknown>) => Promise<void>;
  saveJacketVariation: (variationId: string, payload: Record<string, unknown>) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: PropsWithChildren) {
  const { session, isAdmin } = useAuth();
  const [snapshot, setSnapshot] = useState<CatalogSnapshot>(createEmptySnapshot());
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setStatus((current) => (current === "ready" ? "ready" : "loading"));
    try {
      const nextSnapshot = await fetchCatalogSnapshot();
      setSnapshot(nextSnapshot);
      setError(null);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalog");
      setStatus("error");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const requireAdminToken = () => {
    if (!session?.access_token || !isAdmin) {
      throw new Error("Admin sign-in is required before saving changes.");
    }
  };

  const afterWrite = async () => {
    await refresh();
  };

  const value: CatalogContextValue = {
    snapshot,
    products: snapshot.products,
    status,
    error,
    canAdminWrite: Boolean(session?.access_token && isAdmin),
    refresh,
    saveListingPrice: async (payload) => {
      requireAdminToken();
      await patchListingPriceOverride(session!.access_token, payload);
      await afterWrite();
    },
    saveVariationPrice: async (payload) => {
      requireAdminToken();
      await patchVariationPriceOverride(session!.access_token, payload);
      await afterWrite();
    },
    saveShippingPrice: async (payload) => {
      requireAdminToken();
      await patchShippingOverride(session!.access_token, payload);
      await afterWrite();
    },
    saveJacketListing: async (listingId, payload) => {
      requireAdminToken();
      await patchJacketListing(session!.access_token, listingId, payload);
      await afterWrite();
    },
    saveJacketVariation: async (variationId, payload) => {
      requireAdminToken();
      await patchJacketVariation(session!.access_token, variationId, payload);
      await afterWrite();
    },
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used inside CatalogProvider");
  }
  return context;
}
