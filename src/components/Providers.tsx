"use client";

import React, { ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductOverlayProvider } from "@/context/ProductOverlayContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductOverlayProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </ProductOverlayProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
