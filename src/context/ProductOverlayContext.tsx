"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Product } from "@/types";

interface ProductOverlayContextType {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  recordAddedProduct: (product: Product) => void;
  recordUpdatedProduct: (id: number, updates: Partial<Product>) => void;
  recordDeletedProduct: (id: number) => void;
  applyOverlayToProductList: (
    apiProducts: Product[],
    categoryFilter?: string,
    searchQuery?: string
  ) => { products: Product[]; adjustedTotalDelta: number };
  applyOverlayToSingleProduct: (apiProduct: Product | null, id: number) => Product | null;
  resetLocalOverrides: () => void;
  hasLocalChanges: boolean;
}

const STORAGE_KEY_ADDED = "local_added_products";
const STORAGE_KEY_UPDATED = "local_updated_products";
const STORAGE_KEY_DELETED = "local_deleted_product_ids";

const ProductOverlayContext = createContext<ProductOverlayContextType | undefined>(undefined);

export function ProductOverlayProvider({ children }: { children: ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore overrides from localStorage
  useEffect(() => {
    try {
      const storedAdded = localStorage.getItem(STORAGE_KEY_ADDED);
      const storedUpdated = localStorage.getItem(STORAGE_KEY_UPDATED);
      const storedDeleted = localStorage.getItem(STORAGE_KEY_DELETED);

      if (storedAdded) setAddedProducts(JSON.parse(storedAdded));
      if (storedUpdated) setUpdatedProducts(JSON.parse(storedUpdated));
      if (storedDeleted) setDeletedProductIds(JSON.parse(storedDeleted));
    } catch (e) {
      console.error("Failed to restore product overlay data from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(addedProducts));
      localStorage.setItem(STORAGE_KEY_UPDATED, JSON.stringify(updatedProducts));
      localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deletedProductIds));
    } catch (e) {
      console.error("Failed to save product overlay data to localStorage:", e);
    }
  }, [addedProducts, updatedProducts, deletedProductIds, isHydrated]);

  const recordAddedProduct = useCallback((product: Product) => {
    const newProduct: Product = {
      ...product,
      isLocal: true,
      id: product.id || Date.now(),
    };
    setAddedProducts((prev) => [newProduct, ...prev]);
  }, []);

  const recordUpdatedProduct = useCallback((id: number, updates: Partial<Product>) => {
    // If it's a locally added product, update it in addedProducts
    setAddedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // Also record in updatedProducts for server-origin items
    setUpdatedProducts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...updates },
    }));
  }, []);

  const recordDeletedProduct = useCallback((id: number) => {
    // Remove from locally added if present
    setAddedProducts((prev) => prev.filter((p) => p.id !== id));
    // Add to deleted IDs
    setDeletedProductIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetLocalOverrides = useCallback(() => {
    setAddedProducts([]);
    setUpdatedProducts({});
    setDeletedProductIds([]);
    localStorage.removeItem(STORAGE_KEY_ADDED);
    localStorage.removeItem(STORAGE_KEY_UPDATED);
    localStorage.removeItem(STORAGE_KEY_DELETED);
  }, []);

  /**
   * Transforms an API product list with local additions, updates, and deletions
   */
  const applyOverlayToProductList = useCallback(
    (
      apiProducts: Product[],
      categoryFilter?: string,
      searchQuery?: string
    ): { products: Product[]; adjustedTotalDelta: number } => {
      // 1. Filter out deleted products from API response
      let filteredApi = apiProducts.filter(
        (p) => !deletedProductIds.includes(p.id)
      );

      // 2. Apply any updates to the API products
      filteredApi = filteredApi.map((p) => {
        if (updatedProducts[p.id]) {
          return { ...p, ...updatedProducts[p.id] };
        }
        return p;
      });

      // 3. Find matching locally added products
      let matchingAdded = addedProducts.filter(
        (p) => !deletedProductIds.includes(p.id)
      );

      if (categoryFilter) {
        matchingAdded = matchingAdded.filter(
          (p) => p.category.toLowerCase() === categoryFilter.toLowerCase()
        );
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        matchingAdded = matchingAdded.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );
      }

      // Prepend local products that aren't already in the list
      const existingIds = new Set(filteredApi.map((p) => p.id));
      const newItemsToAdd = matchingAdded.filter((p) => !existingIds.has(p.id));

      const merged = [...newItemsToAdd, ...filteredApi];
      const delta = matchingAdded.length - deletedProductIds.length;

      return {
        products: merged,
        adjustedTotalDelta: delta,
      };
    },
    [addedProducts, updatedProducts, deletedProductIds]
  );

  /**
   * Retrieves single product with overlays applied
   */
  const applyOverlayToSingleProduct = useCallback(
    (apiProduct: Product | null, id: number): Product | null => {
      // If marked deleted locally, return null
      if (deletedProductIds.includes(id)) {
        return null;
      }

      // If it is a locally added product
      const localAdded = addedProducts.find((p) => p.id === id);
      if (localAdded) {
        return localAdded;
      }

      if (!apiProduct) {
        return null;
      }

      // If it has local updates
      if (updatedProducts[id]) {
        return {
          ...apiProduct,
          ...updatedProducts[id],
        };
      }

      return apiProduct;
    },
    [addedProducts, updatedProducts, deletedProductIds]
  );

  const hasLocalChanges =
    addedProducts.length > 0 ||
    Object.keys(updatedProducts).length > 0 ||
    deletedProductIds.length > 0;

  return (
    <ProductOverlayContext.Provider
      value={{
        addedProducts,
        updatedProducts,
        deletedProductIds,
        recordAddedProduct,
        recordUpdatedProduct,
        recordDeletedProduct,
        applyOverlayToProductList,
        applyOverlayToSingleProduct,
        resetLocalOverrides,
        hasLocalChanges,
      }}
    >
      {children}
    </ProductOverlayContext.Provider>
  );
}

export function useProductOverlay() {
  const context = useContext(ProductOverlayContext);
  if (!context) {
    throw new Error("useProductOverlay must be used within a ProductOverlayProvider");
  }
  return context;
}
