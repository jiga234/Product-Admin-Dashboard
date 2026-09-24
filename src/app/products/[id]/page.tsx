"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { productService } from "@/services/productService";
import { useProductOverlay } from "@/context/ProductOverlayContext";
import { Product } from "@/types";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteConfirmModal } from "@/components/products/DeleteConfirmModal";
import { useCurrency } from "@/context/CurrencyContext";
import {
  ArrowLeft,
  Star,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Calendar,
  User,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailsContent({ idParam }: { idParam: string }) {
  const router = useRouter();
  const { applyOverlayToSingleProduct } = useProductOverlay();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Modals for detail page
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const parsedId = parseInt(idParam, 10);
  const isInvalidIdFormat = isNaN(parsedId) || parsedId < 1;

  const loadProduct = useCallback(async () => {
    if (isInvalidIdFormat) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      // First check if product exists in local overlay (e.g., locally created item)
      const localOverlayCheck = applyOverlayToSingleProduct(null, parsedId);
      if (localOverlayCheck && localOverlayCheck.isLocal) {
        setProduct(localOverlayCheck);
        setActiveImage(localOverlayCheck.thumbnail || "");
        setLoading(false);
        return;
      }

      // Fetch from API via Axios
      const fetchedProduct = await productService.getProductById(parsedId);
      // Merge any local edits or check if deleted locally
      const finalProduct = applyOverlayToSingleProduct(fetchedProduct, parsedId);

      if (!finalProduct) {
        setNotFound(true);
      } else {
        setProduct(finalProduct);
        setActiveImage(
          finalProduct.images && finalProduct.images.length > 0
            ? finalProduct.images[0]
            : finalProduct.thumbnail
        );
      }
    } catch {
      // If 404 or any other error from API, show Not Found page
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [parsedId, isInvalidIdFormat, applyOverlayToSingleProduct]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Not Found State (Requirements: "Show a 'not found' page for a wrong id.")
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-2xl mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Product Not Found
          </h1>
          <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
            The product you requested with ID &quot;{idParam}&quot; could not be found or has been removed from the inventory catalog.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = Array.from(
    new Set([
      ...(product.images || []),
      ...(product.thumbnail ? [product.thumbnail] : []),
    ])
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Product List</span>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/40 hover:text-white transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Product Hero Section (Image Gallery + Details) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Showcase Image */}
            <div className="relative w-full aspect-square bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-6">
              {activeImage && !imgErrors[activeImage] ? (
                <Image
                  src={activeImage}
                  alt={product.title}
                  fill
                  className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 100vw, 550px"
                  priority
                  onError={() => setImgErrors((prev) => ({ ...prev, [activeImage]: true }))}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Package className="w-16 h-16 stroke-1" />
                  <span className="text-xs">Image unavailable</span>
                </div>
              )}

              {/* Discount Badge */}
              {product.discountPercentage ? (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-emerald-500/90 text-white font-bold text-xs shadow-lg backdrop-blur-md">
                  {Math.round(product.discountPercentage)}% OFF
                </div>
              ) : null}

              {/* Local Tag */}
              {product.isLocal && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-indigo-600/90 text-white font-bold text-xs shadow-lg backdrop-blur-md uppercase tracking-wider">
                  Local Entry
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-2xl bg-slate-900 border shrink-0 overflow-hidden transition-all ${
                      activeImage === img
                        ? "border-indigo-500 ring-2 ring-indigo-500/40"
                        : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {!imgErrors[img] ? (
                      <Image
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={() => setImgErrors((prev) => ({ ...prev, [img]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Specs */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Category & Brand Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  {product.category.replace(/-/g, " ")}
                </span>
                {product.brand && (
                  <span className="text-xs text-slate-400 font-medium">
                    Brand: <strong className="text-slate-200">{product.brand}</strong>
                  </span>
                )}
                {product.sku && (
                  <span className="text-xs text-slate-500 font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {product.title}
              </h1>

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {product.reviews?.length || 0} Customer Reviews
                </span>
              </div>
            </div>

            {/* Price & Stock Display */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">
                  {formatPrice(product.price)}
                </span>
                {product.discountPercentage ? (
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(
                      product.price /
                      (1 - product.discountPercentage / 100)
                    )}
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    product.stock > 0
                      ? "bg-emerald-950/70 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-950/70 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} items available in stock`
                    : "Currently out of stock"}
                </span>

                {product.availabilityStatus && (
                  <span className="text-xs text-slate-400">
                    &bull; {product.availabilityStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {product.description || "No description provided for this item."}
              </p>
            </div>

            {/* Logistics & Warranty Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                <Truck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Shipping</span>
                  <span className="text-slate-400">
                    {product.shippingInformation || "Standard delivery"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Warranty</span>
                  <span className="text-slate-400">
                    {product.warrantyInformation || "1 Year Warranty"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Returns</span>
                  <span className="text-slate-400">
                    {product.returnPolicy || "30-day return policy"}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
              <div className="px-4 py-3 bg-slate-900/70 border-b border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Specifications & Details
                </h4>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {product.weight && (
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-400">Weight</span>
                    <span className="col-span-2 text-slate-200 font-medium">
                      {product.weight} kg
                    </span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="col-span-2 text-slate-200 font-medium">
                      {product.dimensions.width} &times; {product.dimensions.height} &times;{" "}
                      {product.dimensions.depth} cm
                    </span>
                  </div>
                )}
                {product.minimumOrderQuantity && (
                  <div className="grid grid-cols-3 px-4 py-2.5">
                    <span className="text-slate-400">Minimum Order</span>
                    <span className="col-span-2 text-slate-200 font-medium">
                      {product.minimumOrderQuantity} units
                    </span>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="grid grid-cols-3 px-4 py-2.5 items-center">
                    <span className="text-slate-400">Tags</span>
                    <div className="col-span-2 flex flex-wrap gap-1.5">
                      {product.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="pt-8 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between gap-3 shadow-lg"
                >
                  <div className="space-y-2">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      &quot;{review.comment}&quot;
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-200">
                        {review.reviewerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/20 border border-slate-800 text-center text-slate-400 text-sm">
              No customer reviews recorded yet for this product.
            </div>
          )}
        </section>
      </main>

      {/* Edit Modal */}
      <ProductFormModal
        isOpen={isEditModalOpen}
        productToEdit={product}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setProduct(updated)}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={product}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => {
          router.push("/products");
        }}
      />
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailsPageProps) {
  const unwrappedParams = use(params);

  return (
    <ProtectedRoute>
      <ProductDetailsContent idParam={unwrappedParams.id} />
    </ProtectedRoute>
  );
}
