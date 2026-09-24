"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CurrencyCode } from "@/types";

export const USD_TO_INR_RATE = 83;

export interface CurrencyContextType {
  currency: CurrencyCode;
  currencySymbol: string;
  currencyCode: CurrencyCode;
  exchangeRate: number;
  useExchangeRate: boolean;
  setCurrency: (currency: CurrencyCode) => void;
  setUseExchangeRate: (enabled: boolean) => void;
  formatPrice: (amountInUSD: number | string | undefined | null) => string;
  convertFromBase: (amountInUSD: number | string | undefined | null) => number;
  convertToBase: (amountInCurrentCurrency: number | string | undefined | null) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Default to INR (Indian Rupees) as requested
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");
  const [useExchangeRate, setUseExchangeRateState] = useState<boolean>(true);

  // Restore saved currency preferences from localStorage after mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("nexus_currency") as CurrencyCode | null;
      if (savedCurrency === "INR" || savedCurrency === "USD") {
        setCurrencyState(savedCurrency);
      }
      const savedUseRate = localStorage.getItem("nexus_use_exchange_rate");
      if (savedUseRate !== null) {
        setUseExchangeRateState(savedUseRate === "true");
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("nexus_currency", newCurrency);
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  const setUseExchangeRate = useCallback((enabled: boolean) => {
    setUseExchangeRateState(enabled);
    try {
      localStorage.setItem("nexus_use_exchange_rate", String(enabled));
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  const currencySymbol = currency === "INR" ? "₹" : "$";

  /**
   * Formats a given base USD price into the active currency string
   * e.g. 9.99 USD -> ₹829.17 or ₹9.99 (if 1:1) or $9.99 (if USD)
   */
  const formatPrice = useCallback(
    (amountInUSD: number | string | undefined | null): string => {
      if (amountInUSD === undefined || amountInUSD === null || amountInUSD === "") {
        return currency === "INR" ? "₹0.00" : "$0.00";
      }

      const num = typeof amountInUSD === "string" ? parseFloat(amountInUSD) : Number(amountInUSD);
      if (isNaN(num)) {
        return currency === "INR" ? "₹0.00" : "$0.00";
      }

      if (currency === "INR") {
        const converted = useExchangeRate ? num * USD_TO_INR_RATE : num;
        return `₹${converted.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      // USD format
      return `$${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency, useExchangeRate]
  );

  /**
   * Converts a base USD numeric price to the current currency numeric value
   */
  const convertFromBase = useCallback(
    (amountInUSD: number | string | undefined | null): number => {
      if (amountInUSD === undefined || amountInUSD === null || amountInUSD === "") return 0;
      const num = typeof amountInUSD === "string" ? parseFloat(amountInUSD) : Number(amountInUSD);
      if (isNaN(num)) return 0;

      if (currency === "INR" && useExchangeRate) {
        return Math.round(num * USD_TO_INR_RATE * 100) / 100;
      }
      return Math.round(num * 100) / 100;
    },
    [currency, useExchangeRate]
  );

  /**
   * Converts a user-entered price in the current active currency back to base USD for inventory storage
   */
  const convertToBase = useCallback(
    (amountInCurrentCurrency: number | string | undefined | null): number => {
      if (
        amountInCurrentCurrency === undefined ||
        amountInCurrentCurrency === null ||
        amountInCurrentCurrency === ""
      ) {
        return 0;
      }
      const num =
        typeof amountInCurrentCurrency === "string"
          ? parseFloat(amountInCurrentCurrency)
          : Number(amountInCurrentCurrency);
      if (isNaN(num)) return 0;

      if (currency === "INR" && useExchangeRate) {
        return Math.round((num / USD_TO_INR_RATE) * 100) / 100;
      }
      return Math.round(num * 100) / 100;
    },
    [currency, useExchangeRate]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        currencyCode: currency,
        exchangeRate: USD_TO_INR_RATE,
        useExchangeRate,
        setCurrency,
        setUseExchangeRate,
        formatPrice,
        convertFromBase,
        convertToBase,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
