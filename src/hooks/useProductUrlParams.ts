"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SortField, SortOrder } from "@/types";

export interface ParsedProductParams {
  page: number;
  limit: number;
  q: string;
  category: string;
  sortBy?: SortField;
  order: SortOrder;
  delay?: number;
}

const VALID_LIMITS = [10, 20, 50];
const VALID_SORT_FIELDS: SortField[] = ["id", "title", "price", "rating", "stock"];
const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];

export function useProductUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Safely parse URL params with fallbacks for malformed / out-of-range values
  const params: ParsedProductParams = useMemo(() => {
    // 1. Parse page (e.g., ?page=abc or ?page=-5 falls back to 1)
    const rawPage = searchParams.get("page");
    const parsedPage = rawPage ? parseInt(rawPage, 10) : 1;
    const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    // 2. Parse limit (fallback to 10 if invalid)
    const rawLimit = searchParams.get("limit");
    const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : 10;
    const limit = VALID_LIMITS.includes(parsedLimit) ? parsedLimit : 10;

    // 3. Parse search query
    const q = (searchParams.get("q") || "").trim();

    // 4. Parse category
    const category = (searchParams.get("category") || "").trim();

    // 5. Parse sortBy
    const rawSortBy = searchParams.get("sortBy") as SortField | null;
    const sortBy =
      rawSortBy && VALID_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : undefined;

    // 6. Parse order
    const rawOrder = searchParams.get("order") as SortOrder | null;
    const order: SortOrder =
      rawOrder && VALID_SORT_ORDERS.includes(rawOrder) ? rawOrder : "asc";

    // 7. Parse optional delay for race condition testing (?delay=2000)
    const rawDelay = searchParams.get("delay");
    const parsedDelay = rawDelay ? parseInt(rawDelay, 10) : undefined;
    const delay =
      parsedDelay && !isNaN(parsedDelay) && parsedDelay > 0 ? parsedDelay : undefined;

    return {
      page,
      limit,
      q,
      category,
      sortBy,
      order,
      delay,
    };
  }, [searchParams]);

  // Utility to push new query parameters
  const updateUrl = useCallback(
    (newParams: Partial<Record<string, string | number | null | undefined>>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Set Search Query (resets to page 1)
  const setSearch = useCallback(
    (newQuery: string) => {
      updateUrl({
        q: newQuery.trim() ? newQuery.trim() : null,
        page: 1, // requirement: go back to page 1 when search changes
      });
    },
    [updateUrl]
  );

  // Set Category Filter (resets to page 1)
  const setCategory = useCallback(
    (newCategory: string) => {
      updateUrl({
        category: newCategory.trim() ? newCategory.trim() : null,
        page: 1,
      });
    },
    [updateUrl]
  );

  // Set Page
  const setPage = useCallback(
    (newPage: number) => {
      const safePage = Math.max(1, isNaN(newPage) ? 1 : newPage);
      updateUrl({
        page: safePage === 1 ? null : safePage, // Clean URL if page 1
      });
    },
    [updateUrl]
  );

  // Set Page Size / Limit (resets to page 1)
  const setLimit = useCallback(
    (newLimit: number) => {
      updateUrl({
        limit: newLimit === 10 ? null : newLimit, // Default is 10
        page: 1,
      });
    },
    [updateUrl]
  );

  // Set Sorting
  const setSorting = useCallback(
    (field?: SortField, direction?: SortOrder) => {
      updateUrl({
        sortBy: field || null,
        order: direction && direction !== "asc" ? direction : null,
      });
    },
    [updateUrl]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    const current = new URLSearchParams(searchParams.toString());
    current.delete("q");
    current.delete("category");
    current.delete("sortBy");
    current.delete("order");
    current.delete("page");

    const queryString = current.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(targetUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    params,
    setSearch,
    setCategory,
    setPage,
    setLimit,
    setSorting,
    resetFilters,
  };
}
