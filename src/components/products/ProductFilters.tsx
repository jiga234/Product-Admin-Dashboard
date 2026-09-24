"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  Plus,
  RotateCcw,
  Info,
} from "lucide-react";
import { productService } from "@/services/productService";
import { ProductCategory, SortField, SortOrder } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { ParsedProductParams } from "@/hooks/useProductUrlParams";

interface ProductFiltersProps {
  params: ParsedProductParams;
  setSearch: (q: string) => void;
  setCategory: (category: string) => void;
  setSorting: (field?: SortField, direction?: SortOrder) => void;
  resetFilters: () => void;
  onOpenAddModal: () => void;
  isHybridSearch?: boolean;
  isLoading?: boolean;
}

export function ProductFilters({
  params,
  setSearch,
  setCategory,
  setSorting,
  resetFilters,
  onOpenAddModal,
  isHybridSearch = false,
  isLoading: _isLoading = false,
}: ProductFiltersProps) {
  // Local search query for smooth typing without lag
  const [searchInput, setSearchInput] = useState(params.q);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [categories, setCategories] = useState<ProductCategory[]>([]);

  // Sync local search input if URL changes externally (e.g. Back button or URL change)
  useEffect(() => {
    setSearchInput(params.q);
  }, [params.q]);

  // When debounced value changes, push to URL if different
  useEffect(() => {
    if (debouncedSearch !== params.q) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, params.q, setSearch]);

  // Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    productService
      .getCategories()
      .then((data) => {
        if (isMounted) {
          // DummyJSON returns array of objects with slug & name
          setCategories(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  // Compose current sort key for select value
  const currentSortKey = params.sortBy
    ? `${params.sortBy}-${params.order}`
    : "default";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "default") {
      setSorting(undefined, "asc");
    } else {
      const [field, order] = val.split("-") as [SortField, SortOrder];
      setSorting(field, order);
    }
  };

  const hasActiveFilters = Boolean(
    params.q || params.category || params.sortBy || params.order !== "asc"
  );

  return (
    <div className="space-y-3">
      {/* Top Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by title, brand, or tag..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all"
          />

          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters & Actions Group */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[150px]">
            <select
              value={params.category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[160px]">
            <select
              value={currentSortKey}
              onChange={handleSortChange}
              className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest First</option>
              <option value="rating-asc">Rating: Lowest First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* Reset Filters Button (visible when filters active) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                resetFilters();
              }}
              title="Reset all filters"
              className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Add Product Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Hybrid Search Notice (when user searches within a selected category) */}
      {isHybridSearch && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs animate-in fade-in duration-300">
          <Info className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>
            <strong>Hybrid Search Active:</strong> DummyJSON API does not support combined server-side search and category filtering. Our dashboard seamlessly fetches category &quot;{params.category}&quot; and filters client-side by query &quot;{params.q}&quot;.
          </span>
        </div>
      )}
    </div>
  );
}
