import { useEffect, useState } from "react";

import {
  createEmptyHomeCatalogPayload,
  createEmptyPublicCatalogPage,
  fetchCatalogProduct,
  fetchHomeCatalog,
  fetchPublicCatalogPage,
} from "./api";
import type {
  CatalogAvailabilityFilter,
  CatalogProduct,
  HomeCatalogPayload,
  PublicCatalogPage,
  TrackerId,
} from "./types";

type Status = "loading" | "ready" | "error";

export function useHomeCatalog() {
  const [data, setData] = useState<HomeCatalogPayload>(createEmptyHomeCatalogPayload());
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError(null);

    void fetchHomeCatalog()
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load storefront catalog");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, status, error };
}

export function useCatalogPage(query: {
  page: number;
  pageSize: number;
  q: string;
  tracker: TrackerId | "all";
  availability: CatalogAvailabilityFilter;
}) {
  const [data, setData] = useState<PublicCatalogPage>(createEmptyPublicCatalogPage());
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError(null);

    void fetchPublicCatalogPage(query)
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load catalog page");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [query.availability, query.page, query.pageSize, query.q, query.tracker]);

  return { data, status, error };
}

export function useCatalogProduct(trackerId: string | undefined, listingId: string | undefined) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackerId || !listingId) {
      setProduct(null);
      setStatus("error");
      setError("Unknown product");
      return;
    }

    let active = true;
    setStatus("loading");
    setError(null);

    void fetchCatalogProduct(trackerId as TrackerId, listingId)
      .then((payload) => {
        if (!active) return;
        setProduct(payload);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setProduct(null);
        setError(err instanceof Error ? err.message : "Failed to load product");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [listingId, trackerId]);

  return { product, status, error };
}
