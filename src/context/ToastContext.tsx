"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, info, warning }}
    >
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const styles = {
            success: "bg-emerald-950/95 border-emerald-500/40 text-emerald-200",
            error: "bg-rose-950/95 border-rose-500/40 text-rose-200",
            warning: "bg-amber-950/95 border-amber-500/40 text-amber-200",
            info: "bg-sky-950/95 border-sky-500/40 text-sky-200",
          }[toast.type];

          const iconStyles = {
            success: "text-emerald-400",
            error: "text-rose-400",
            warning: "text-amber-400",
            info: "text-sky-400",
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-bottom-3 ${styles}`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && <CheckCircle2 className={`w-5 h-5 ${iconStyles}`} />}
                {toast.type === "error" && <AlertCircle className={`w-5 h-5 ${iconStyles}`} />}
                {toast.type === "warning" && <AlertTriangle className={`w-5 h-5 ${iconStyles}`} />}
                {toast.type === "info" && <Info className={`w-5 h-5 ${iconStyles}`} />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold tracking-wide text-white">{toast.title}</h4>
                {toast.message && (
                  <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{toast.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
