"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { productService } from "@/services/productService";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: (deletedId: number) => void;
}

export function DeleteConfirmModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const { recordDeletedProduct } = useProductOverlay();
  const { success, error: toastError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirmDelete = async () => {
    // Prevent duplicate clicks
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      // Call DummyJSON DELETE endpoint via Axios
      await productService.deleteProduct(product.id);

      // Record deletion in local overlay
      recordDeletedProduct(product.id);

      success(
        "Product Deleted",
        `"${product.title}" has been successfully removed from inventory.`
      );

      if (onSuccess) {
        onSuccess(product.id);
      }

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete product.";
      toastError("Delete Error", message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/70 border border-rose-600/40 text-rose-400 flex items-center justify-center mb-4 shadow-lg shadow-rose-950/50">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Delete Product</h3>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-slate-200 font-semibold">
              &quot;{product.title}&quot;
            </strong>
            ? This action will remove the product from your catalog.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/40 transition-all active:scale-95"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
