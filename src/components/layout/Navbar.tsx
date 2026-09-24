"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  LogOut,
  Package,
  RefreshCw,
  User as UserIcon,
  ChevronDown,
  Check,
  Coins,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { hasLocalChanges, resetLocalOverrides } = useProductOverlay();
  const { success } = useToast();
  const {
    currency,
    currencySymbol,
    setCurrency,
    useExchangeRate,
    setUseExchangeRate,
    exchangeRate,
  } = useCurrency();

  const [avatarError, setAvatarError] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  // Close currency dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        currencyMenuRef.current &&
        !currencyMenuRef.current.contains(event.target as Node)
      ) {
        setIsCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetOverrides = () => {
    resetLocalOverrides();
    success(
      "Demo Overrides Reset",
      "All locally added, edited, or deleted items have been restored to the original API state."
    );
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

          {/* Right Section: Currency Switcher, User Info & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Currency Selector Dropdown */}
            <div className="relative" ref={currencyMenuRef}>
              <button
                type="button"
                onClick={() => setIsCurrencyOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border border-slate-700/70 hover:border-slate-600 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                title="Change Currency (INR ₹ / USD $)"
                aria-expanded={isCurrencyOpen}
                aria-haspopup="true"
              >
                <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                  {currencySymbol}
                </span>
                <span className="font-semibold text-slate-200 tracking-wide">
                  {currency}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isCurrencyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Currency Dropdown Menu */}
              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-2 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    <Coins className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Currency & Region</span>
                  </div>

                  {/* Currency Options */}
                  <div className="py-1.5 space-y-1">
                    {/* INR Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency("INR");
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        currency === "INR"
                          ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                          : "text-slate-300 hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center text-xs">
                          ₹
                        </span>
                        <div className="text-left">
                          <span className="font-semibold block text-slate-100">
                            INR (₹)
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            Indian Rupee
                          </span>
                        </div>
                      </div>
                      {currency === "INR" && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>

                    {/* USD Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency("USD");
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        currency === "USD"
                          ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                          : "text-slate-300 hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-sky-950/70 text-sky-400 border border-sky-500/30 font-bold flex items-center justify-center text-xs">
                          $
                        </span>
                        <div className="text-left">
                          <span className="font-semibold block text-slate-100">
                            USD ($)
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            US Dollar
                          </span>
                        </div>
                      </div>
                      {currency === "USD" && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  </div>

                  {/* INR Exchange Rate Conversion Setting */}
                  {currency === "INR" && (
                    <div className="pt-2 mt-1 border-t border-slate-800/80 px-2 pb-1">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useExchangeRate}
                          onChange={(e) => setUseExchangeRate(e.target.checked)}
                          className="mt-0.5 w-3.5 h-3.5 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="text-[11px] leading-tight">
                          <span className="text-slate-200 font-medium block">
                            Exchange Rate Conversion
                          </span>
                          <span className="text-slate-400 text-[10px] block mt-0.5">
                            {useExchangeRate
                              ? `1 USD ≈ ₹${exchangeRate}.00 INR`
                              : "1:1 direct symbol replacement"}
                          </span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reset Overrides Button (if demo changes exist) */}
            {hasLocalChanges && (
              <button
                type="button"
                onClick={handleResetOverrides}
                title="Reset mock changes to default API data"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-300 bg-amber-950/50 border border-amber-600/40 hover:bg-amber-900/50 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Changes</span>
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
                {/* User avatar & name */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-800 ring-2 ring-indigo-500/30 shrink-0">
                    {user.image && !avatarError ? (
                      <Image
                        src={user.image}
                        alt={user.firstName || user.username}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="36px"
                        onError={() => setAvatarError(true)}
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-800 hover:text-white hover:bg-rose-950/40 hover:border-rose-800/50 hover:text-rose-300 transition-all duration-200 active:scale-95"
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
