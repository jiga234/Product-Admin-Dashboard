"use client";

import React, { ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductOverlayProvider } from "@/context/ProductOverlayContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductOverlayProvider>{children}</ProductOverlayProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
