"use client";

import React, { useState, Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteConfirmModal } from "@/components/products/DeleteConfirmModal";
import { TableSkeleton, CardsSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useProductUrlParams } from "@/hooks/useProductUrlParams";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";

function ProductsDashboardContent() {
  const {
    params,
    setSearch,
    setCategory,
    setPage,
    setLimit,
    setSorting,
    resetFilters,
  } = useProductUrlParams();

  // Query hook handles API calls, AbortController cancellation, race-condition immunity, and local overlay
  const {
    products,
    total,
    totalPages,
    loading,
    error,
    refetch,
    isHybridSearch,
  } = useProductsQuery(params);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const hasActiveFilters = Boolean(
    params.q || params.category || params.sortBy || params.order !== "asc"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Title & Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Product Inventory
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage, search, filter, and inspect products across all categories
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <ProductFilters
          params={params}
          setSearch={setSearch}
          setCategory={setCategory}
          setSorting={setSorting}
          resetFilters={resetFilters}
          onOpenAddModal={handleOpenAddModal}
          isHybridSearch={isHybridSearch}
          isLoading={loading}
        />

        {/* Dynamic Content Views */}
        {error ? (
          /* Error State with Retry Button */
          <ErrorState
            title="Failed to fetch products"
            message={error}
            onRetry={refetch}
            isRetrying={loading}
          />
        ) : loading ? (
          /* Loading Skeletons */
          <div>
            <div className="hidden md:block">
              <TableSkeleton rows={params.limit > 10 ? 10 : params.limit} />
            </div>
            <div className="block md:hidden">
              <CardsSkeleton count={4} />
            </div>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <EmptyState
            title={hasActiveFilters ? "No matching products found" : "No products available"}
            message={
              hasActiveFilters
                ? `No products matched your search or filters. Try adjusting your query or resetting filters.`
                : "Your inventory is currently empty. Add your first product to get started!"
            }
            isFiltered={hasActiveFilters}
            onClearFilters={hasActiveFilters ? resetFilters : undefined}
            onAddNew={handleOpenAddModal}
          />
        ) : (
          /* Product Listings */
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <ProductTable
                products={products}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-2 sm:p-3 backdrop-blur-sm">
              <Pagination
                page={params.page}
                limit={params.limit}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={productToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        }
      >
        <ProductsDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
