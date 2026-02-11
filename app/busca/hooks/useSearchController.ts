"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSearchStore } from "@/lib/stores/searchStore";
import { SearchFilters } from "@/lib/types/search";
import { buildSearchUrlQuery, parseSearchStateFromUrl } from "@/lib/search/url";
import { countActiveFilters } from "@/lib/search/filters";

const SEARCH_DEBOUNCE_MS = 350;

export function useSearchController() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isHydrated, setIsHydrated] = useState(false);
  const lastSerializedRef = useRef<string>("");

  const {
    filters,
    setFilters,
    clearFilters,
    musicians,
    pagination,
    isLoading,
    error,
    sortBy,
    setSortBy,
    view,
    setView,
    setPage,
    search,
  } = useSearchStore();

  useEffect(() => {
    if (isHydrated) return;

    const parsed = parseSearchStateFromUrl(searchParams);
    setFilters(parsed.filters);
    setSortBy(parsed.sortBy);
    setPage(parsed.page);
    setIsHydrated(true);
  }, [isHydrated, searchParams, setFilters, setPage, setSortBy]);

  useEffect(() => {
    if (!isHydrated) return;

    const timeout = setTimeout(() => {
      search();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [isHydrated, filters, sortBy, pagination?.page, search]);

  useEffect(() => {
    if (!isHydrated) return;

    const page = pagination?.page || 1;
    const nextQuery = buildSearchUrlQuery(filters, sortBy, page);

    if (nextQuery === lastSerializedRef.current) return;
    lastSerializedRef.current = nextQuery;

    const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(href, { scroll: false });
  }, [isHydrated, filters, sortBy, pagination?.page, pathname, router]);

  const updateFilters = useCallback(
    (patch: Partial<SearchFilters>) => {
      setFilters(patch);
      setPage(1);
    },
    [setFilters, setPage]
  );

  const replaceFilters = useCallback(
    (nextFilters: SearchFilters) => {
      setFilters(nextFilters);
      setPage(1);
    },
    [setFilters, setPage]
  );

  const clearAllFilters = useCallback(() => {
    clearFilters();
    setPage(1);
  }, [clearFilters, setPage]);

  const applySearch = useCallback(() => {
    search();
  }, [search]);

  const changeSort = useCallback(
    (nextSort: string) => {
      setSortBy(nextSort);
      setPage(1);
    },
    [setSortBy, setPage]
  );

  const changePage = useCallback(
    (page: number) => {
      setPage(page);
    },
    [setPage]
  );

  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  return {
    filters,
    musicians,
    pagination,
    isLoading,
    error,
    sortBy,
    view,
    setView,
    updateFilters,
    replaceFilters,
    clearAllFilters,
    applySearch,
    changeSort,
    changePage,
    activeFiltersCount,
  };
}

