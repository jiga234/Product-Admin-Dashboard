"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = "Failed to load products",
  message = "An error occurred while fetching product data. Please check your network connection and try again.",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl bg-rose-950/20 border border-rose-800/40 my-4 backdrop-blur-sm">
      <div className="w-14 h-14 rounded-2xl bg-rose-900/40 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-950/50">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-rose-200 mb-1">{title}</h3>
      <p className="text-sm text-rose-300/80 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/40 transition-all active:scale-95"
      >
        <RotateCcw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
        <span>{isRetrying ? "Retrying..." : "Retry"}</span>
      </button>
    </div>
  );
}
