"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Product, ProductFormData, FormValidationErrors, ProductCategory } from "@/types";
import { productService } from "@/services/productService";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { useToast } from "@/context/ToastContext";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess?: (product: Product) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit);
  const { recordAddedProduct, recordUpdatedProduct } = useProductOverlay();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    rating: "4.5",
    brand: "",
    thumbnail: "",
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for select dropdown
  useEffect(() => {
    productService
      .getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories in modal:", err));
  }, []);

  // Initialize or reset form values
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setFormData({
          title: productToEdit.title || "",
          description: productToEdit.description || "",
          category: productToEdit.category || "",
          price: String(productToEdit.price ?? ""),
          stock: String(productToEdit.stock ?? ""),
          rating: String(productToEdit.rating ?? "4.5"),
          brand: productToEdit.brand || "",
          thumbnail: productToEdit.thumbnail || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          category: "",
          price: "",
          stock: "",
          rating: "4.5",
          brand: "",
          thumbnail: "",
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Please select a category.";
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price.trim() || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Enter a valid positive price (e.g. 19.99).";
    }

    const stockNum = parseInt(formData.stock, 10);
    if (!formData.stock.trim() || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = "Stock must be a non-negative whole number.";
    }

    const ratingNum = parseFloat(formData.rating);
    if (formData.rating.trim() && (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
      newErrors.rating = "Rating must be between 0.0 and 5.0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name as keyof FormValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload: Partial<Product> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        rating: formData.rating ? parseFloat(formData.rating) : 4.5,
        brand: formData.brand.trim() || "Brandless",
        thumbnail:
          formData.thumbnail.trim() ||
          "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png",
      };

      if (isEditing && productToEdit) {
        // Call DummyJSON API update endpoint via Axios
        const updatedApiProduct = await productService.updateProduct(
          productToEdit.id,
          payload
        );

        // Store update locally to simulate real persistence
        const mergedProduct: Product = {
          ...productToEdit,
          ...payload,
          id: productToEdit.id,
        };
        recordUpdatedProduct(productToEdit.id, payload);

        success("Product Updated", `"${mergedProduct.title}" was saved successfully.`);
        if (onSuccess) onSuccess(mergedProduct);
      } else {
        // Call DummyJSON API add endpoint via Axios
        const addedApiProduct = await productService.addProduct(payload);

        // Generate unique local ID if API returns dummy id 195
        const localId = addedApiProduct.id || Date.now();
        const newProduct: Product = {
          ...payload,
          id: localId,
          title: payload.title!,
          description: payload.description || "",
          category: payload.category!,
          price: payload.price!,
          stock: payload.stock!,
          rating: payload.rating || 4.5,
          thumbnail: payload.thumbnail!,
          isLocal: true,
        };

        recordAddedProduct(newProduct);
        success("Product Created", `"${newProduct.title}" was created and added to inventory.`);
        if (onSuccess) onSuccess(newProduct);
      }

      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save product.";
      toastError("Error Saving Product", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? "border-rose-500 focus:ring-rose-500/40"
                  : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/40"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Category & Brand Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  errors.category
                    ? "border-rose-500 focus:ring-rose-500/40"
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/40"
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Sony, Apple, Nike"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/40 transition-all"
              />
            </div>
          </div>

          {/* Price, Stock, Rating Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="29.99"
                className={`w-full px-3 py-2 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.price
                    ? "border-rose-500 focus:ring-rose-500/40"
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/40"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
                className={`w-full px-3 py-2 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.stock
                    ? "border-rose-500 focus:ring-rose-500/40"
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/40"
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.stock}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Rating (0-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="4.5"
                className={`w-full px-3 py-2 bg-slate-950/80 border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.rating
                    ? "border-rose-500 focus:ring-rose-500/40"
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/40"
                }`}
              />
              {errors.rating && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Image URL (optional)
            </label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/40 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of features, quality, and specifications..."
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/40 transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Product"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
