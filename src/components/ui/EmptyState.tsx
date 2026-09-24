"use client";

import React from "react";
import { SearchX, PackageX, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onAddNew?: () => void;
}

export function EmptyState({
  title = "No products found",
  message = "No products match your current search or filter criteria. Try adjusting your query or filters.",
  isFiltered = false,
  onClearFilters,
  onAddNew,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 my-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        {isFiltered ? (
          <SearchX className="w-8 h-8 text-indigo-400" />
        ) : (
          <PackageX className="w-8 h-8 text-slate-400" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex items-center gap-3">
        {isFiltered && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95"
          >
            Clear Filters
          </button>
        )}

        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Product
          </button>
        )}
      </div>
    </div>
  );
}
