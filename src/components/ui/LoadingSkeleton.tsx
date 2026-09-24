"use client";

import React from "react";

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl animate-pulse">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/80 border-b border-slate-800">
        <div className="col-span-5 h-4 bg-slate-800 rounded w-1/3"></div>
        <div className="col-span-2 h-4 bg-slate-800 rounded w-1/2"></div>
        <div className="col-span-2 h-4 bg-slate-800 rounded w-1/2"></div>
        <div className="col-span-1 h-4 bg-slate-800 rounded w-2/3"></div>
        <div className="col-span-2 h-4 bg-slate-800 rounded w-1/2 justify-self-end"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-850">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
            {/* Image + Title */}
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800/70 rounded w-1/2"></div>
              </div>
            </div>

            {/* Category */}
            <div className="col-span-2">
              <div className="h-6 bg-slate-850 rounded-full w-20"></div>
            </div>

            {/* Price */}
            <div className="col-span-2 space-y-1.5">
              <div className="h-4 bg-slate-800 rounded w-16"></div>
              <div className="h-3 bg-slate-800/60 rounded w-12"></div>
            </div>

            {/* Stock / Rating */}
            <div className="col-span-1">
              <div className="h-6 bg-slate-800 rounded-full w-14"></div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex justify-end gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
              <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3"
        >
          <div className="w-full h-44 rounded-xl bg-slate-800"></div>
          <div className="h-5 bg-slate-800 rounded w-3/4"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-slate-800 rounded w-20"></div>
            <div className="h-6 bg-slate-800 rounded-full w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
