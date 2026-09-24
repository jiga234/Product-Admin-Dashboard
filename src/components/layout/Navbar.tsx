"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";
import { LogOut, Package, RefreshCw, Sparkles, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { hasLocalChanges, resetLocalOverrides } = useProductOverlay();
  const { success } = useToast();

  const handleResetOverrides = () => {
    resetLocalOverrides();
    success("Demo Overrides Reset", "All locally added, edited, or deleted items have been restored to the original API state.");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  NexusAdmin
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  Product Inventory
                </span>
              </div>
            </Link>
          </div>

          {/* Right Section: User Info & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Reset Overrides Button (if demo changes exist) */}
            {hasLocalChanges && (
              <button
                type="button"
                onClick={handleResetOverrides}
                title="Reset mock changes to default API data"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/50 border border-amber-600/40 hover:bg-amber-900/50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Changes</span>
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-800">
                {/* User avatar & name */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-800 ring-2 ring-indigo-500/30 shrink-0">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.firstName || user.username}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-900 text-indigo-200">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-100 leading-tight">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      @{user.username}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:text-white hover:bg-rose-950/40 hover:border-rose-800/50 hover:text-rose-300 transition-all duration-200 active:scale-95"
                  title="Log out of dashboard"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
