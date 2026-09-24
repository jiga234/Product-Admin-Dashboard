"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { productService } from "@/services/productService";
import { Product, ProductsResponse, SortField, SortOrder } from "@/types";
import { useProductOverlay } from "@/context/ProductOverlayContext";

interface UseProductsQueryOptions {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  sortBy?: SortField;
  order?: SortOrder;
  delay?: number;
}

interface UseProductsQueryResult {
  products: Product[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isHybridSearch: boolean;
  activeRequestId: number;
}

export function useProductsQuery(options: UseProductsQueryOptions): UseProductsQueryResult {
  const { page, limit, q = "", category = "", sortBy, order = "asc", delay } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHybridSearch, setIsHybridSearch] = useState<boolean>(false);

  // References to handle race conditions and cancel pending requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef<number>(0);

  const { applyOverlayToProductList } = useProductOverlay();

  const fetchProducts = useCallback(async () => {
    // 1. Cancel previous pending request if still in flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Create new AbortController and increment request sequence ID
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++latestRequestIdRef.current;

    setLoading(true);
    setError(null);

    const skip = Math.max(0, (page - 1) * limit);

    try {
      let rawResponse: ProductsResponse;
      let hybridMode = false;

      // Handle search and category combinations:
      // Limitation of DummyJSON API: It cannot filter by category and search simultaneously.
      // Solution: If both category & search query are provided, fetch the category's items
      // and perform client-side filtering on the search term, then apply pagination slice.
      if (category && q.trim()) {
        hybridMode = true;
        // Fetch products within this category (up to max reasonable for category)
        const catResponse = await productService.getProductsByCategory({
          category,
          limit: 100, // DummyJSON categories typically have 5-30 items
          skip: 0,
          sortBy,
          order,
          delay,
          signal: controller.signal,
        });

        // Search within category products client-side
        const queryTerm = q.trim().toLowerCase();
        const filtered = catResponse.products.filter(
          (p) =>
            p.title.toLowerCase().includes(queryTerm) ||
            p.description?.toLowerCase().includes(queryTerm) ||
            p.brand?.toLowerCase().includes(queryTerm)
        );

        // Paginate client-side for hybrid query
        const paginatedProducts = filtered.slice(skip, skip + limit);
        rawResponse = {
          products: paginatedProducts,
          total: filtered.length,
          skip,
          limit,
        };
      } else if (category) {
        // Category only
        rawResponse = await productService.getProductsByCategory({
          category,
          limit,
          skip,
          sortBy,
          order,
          delay,
          signal: controller.signal,
        });
      } else if (q.trim()) {
        // Search query only
        rawResponse = await productService.searchProducts({
          q: q.trim(),
          limit,
          skip,
          sortBy,
          order,
          delay,
          signal: controller.signal,
        });
      } else {
        // Standard paginated listing
        rawResponse = await productService.getProducts({
          limit,
          skip,
          sortBy,
          order,
          delay,
          signal: controller.signal,
        });
      }

      // RACE CONDITION CHECK:
      // If a newer request has started while this one was in-flight (or delayed),
      // discard this response completely to prevent stale results from overwriting fresh ones!
      if (currentRequestId !== latestRequestIdRef.current) {
        return;
      }

      // Merge local mock mutations (added, edited, deleted products)
      const { products: overlayProducts, adjustedTotalDelta } =
        applyOverlayToProductList(rawResponse.products, category, q);

      setProducts(overlayProducts);
      setTotal(Math.max(0, rawResponse.total + adjustedTotalDelta));
      setIsHybridSearch(hybridMode);
      setLoading(false);
    } catch (err: unknown) {
      // If the error was caused by aborting the request, do not treat as failure
      if (axios.isCancel(err) || (err instanceof DOMException && err.name === "AbortError")) {
        return;
      }

      // Only set error if this is still the active request
      if (currentRequestId === latestRequestIdRef.current) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to load products. Please check your internet connection.";
        setError(errorMsg);
        setLoading(false);
      }
    }
  }, [page, limit, q, category, sortBy, order, delay, applyOverlayToProductList]);

  // Trigger fetch whenever query dependencies change
  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    products,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchProducts,
    isHybridSearch,
    activeRequestId: latestRequestIdRef.current,
  };
}
