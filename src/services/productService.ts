import { apiClient } from "./apiClient";
import {
  Product,
  ProductCategory,
  ProductsResponse,
  SortField,
  SortOrder,
} from "@/types";

export interface FetchProductsOptions {
  limit?: number;
  skip?: number;
  sortBy?: SortField;
  order?: SortOrder;
  delay?: number;
  signal?: AbortSignal;
}

export interface SearchProductsOptions extends FetchProductsOptions {
  q: string;
}

export interface CategoryProductsOptions extends FetchProductsOptions {
  category: string;
}

export const FALLBACK_CATEGORIES: ProductCategory[] = [
  { slug: "beauty", name: "Beauty", url: "https://dummyjson.com/products/category/beauty" },
  { slug: "fragrances", name: "Fragrances", url: "https://dummyjson.com/products/category/fragrances" },
  { slug: "furniture", name: "Furniture", url: "https://dummyjson.com/products/category/furniture" },
  { slug: "groceries", name: "Groceries", url: "https://dummyjson.com/products/category/groceries" },
  { slug: "home-decoration", name: "Home Decoration", url: "https://dummyjson.com/products/category/home-decoration" },
  { slug: "kitchen-accessories", name: "Kitchen Accessories", url: "https://dummyjson.com/products/category/kitchen-accessories" },
  { slug: "laptops", name: "Laptops", url: "https://dummyjson.com/products/category/laptops" },
  { slug: "mens-shirts", name: "Mens Shirts", url: "https://dummyjson.com/products/category/mens-shirts" },
  { slug: "mens-shoes", name: "Mens Shoes", url: "https://dummyjson.com/products/category/mens-shoes" },
  { slug: "mens-watches", name: "Mens Watches", url: "https://dummyjson.com/products/category/mens-watches" },
  { slug: "mobile-accessories", name: "Mobile Accessories", url: "https://dummyjson.com/products/category/mobile-accessories" },
  { slug: "motorcycle", name: "Motorcycle", url: "https://dummyjson.com/products/category/motorcycle" },
  { slug: "skin-care", name: "Skin Care", url: "https://dummyjson.com/products/category/skin-care" },
  { slug: "smartphones", name: "Smartphones", url: "https://dummyjson.com/products/category/smartphones" },
  { slug: "sports-accessories", name: "Sports Accessories", url: "https://dummyjson.com/products/category/sports-accessories" },
  { slug: "sunglasses", name: "Sunglasses", url: "https://dummyjson.com/products/category/sunglasses" },
  { slug: "tablets", name: "Tablets", url: "https://dummyjson.com/products/category/tablets" },
  { slug: "tops", name: "Tops", url: "https://dummyjson.com/products/category/tops" },
  { slug: "vehicle", name: "Vehicle", url: "https://dummyjson.com/products/category/vehicle" },
  { slug: "womens-bags", name: "Womens Bags", url: "https://dummyjson.com/products/category/womens-bags" },
  { slug: "womens-dresses", name: "Womens Dresses", url: "https://dummyjson.com/products/category/womens-dresses" },
  { slug: "womens-jewellery", name: "Womens Jewellery", url: "https://dummyjson.com/products/category/womens-jewellery" },
  { slug: "womens-shoes", name: "Womens Shoes", url: "https://dummyjson.com/products/category/womens-shoes" },
  { slug: "womens-watches", name: "Womens Watches", url: "https://dummyjson.com/products/category/womens-watches" },
];

let cachedCategories: ProductCategory[] | null = null;
let activeCategoriesPromise: Promise<ProductCategory[]> | null = null;

export const productService = {
  /**
   * Fetch paginated products with optional sorting and artificial delay
   */
  getProducts: async (options: FetchProductsOptions = {}): Promise<ProductsResponse> => {
    const { limit = 10, skip = 0, sortBy, order, delay, signal } = options;

    const params: Record<string, string | number> = {
      limit,
      skip,
    };

    if (sortBy) {
      params.sortBy = sortBy;
      params.order = order || "asc";
    }

    if (delay && delay > 0) {
      params.delay = delay;
    }

    const response = await apiClient.get<ProductsResponse>("/products", {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Search products by query keyword
   */
  searchProducts: async (options: SearchProductsOptions): Promise<ProductsResponse> => {
    const { q, limit = 10, skip = 0, sortBy, order, delay, signal } = options;

    const params: Record<string, string | number> = {
      q,
      limit,
      skip,
    };

    if (sortBy) {
      params.sortBy = sortBy;
      params.order = order || "asc";
    }

    if (delay && delay > 0) {
      params.delay = delay;
    }

    const response = await apiClient.get<ProductsResponse>("/products/search", {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Fetch products for a specific category
   */
  getProductsByCategory: async (
    options: CategoryProductsOptions
  ): Promise<ProductsResponse> => {
    const { category, limit = 10, skip = 0, sortBy, order, delay, signal } = options;

    const params: Record<string, string | number> = {
      limit,
      skip,
    };

    if (sortBy) {
      params.sortBy = sortBy;
      params.order = order || "asc";
    }

    if (delay && delay > 0) {
      params.delay = delay;
    }

    const response = await apiClient.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}`,
      {
        params,
        signal,
      }
    );
    return response.data;
  },

  /**
   * Fetch all product categories with caching, request deduplication, and fallback
   */
  getCategories: async (): Promise<ProductCategory[]> => {
    // 1. Fast in-memory cache
    if (cachedCategories && cachedCategories.length > 0) {
      return cachedCategories;
    }

    // 2. LocalStorage cache check
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("app_product_categories");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedCategories = parsed;
            return parsed;
          }
        }
      } catch {
        // Ignore localStorage read errors
      }
    }

    // 3. Deduplicate in-flight requests (prevent simultaneous calls from ProductFilters & modals)
    if (activeCategoriesPromise) {
      return activeCategoriesPromise;
    }

    activeCategoriesPromise = (async () => {
      try {
        // Generous 25s timeout for categories so slow networks have sufficient time
        const response = await apiClient.get<ProductCategory[]>("/products/categories", {
          timeout: 25000,
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          cachedCategories = response.data;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("app_product_categories", JSON.stringify(response.data));
            } catch {
              // Ignore localStorage quota errors
            }
          }
          return response.data;
        }
        return FALLBACK_CATEGORIES;
      } catch (err) {
        // Fall back gracefully so UI controls never break or throw uncaught errors
        const errMsg = (err as Error)?.message || "timeout";
        console.warn(`[productService] Categories API request timed out (${errMsg}). Using fallback category list.`);
        cachedCategories = FALLBACK_CATEGORIES;
        return FALLBACK_CATEGORIES;
      } finally {
        activeCategoriesPromise = null;
      }
    })();

    return activeCategoriesPromise;
  },

  /**
   * Fetch single product by ID
   */
  getProductById: async (
    id: string | number,
    options?: { delay?: number; signal?: AbortSignal }
  ): Promise<Product> => {
    const params: Record<string, string | number> = {};
    if (options?.delay && options.delay > 0) {
      params.delay = options.delay;
    }

    const response = await apiClient.get<Product>(`/products/${id}`, {
      params,
      signal: options?.signal,
    });
    return response.data;
  },

  /**
   * Add a new product via API (DummyJSON mock)
   */
  addProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post<Product>("/products/add", productData);
    return response.data;
  },

  /**
   * Update an existing product via API (DummyJSON mock)
   */
  updateProduct: async (
    id: number,
    productData: Partial<Product>
  ): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product by ID via API (DummyJSON mock)
   */
  deleteProduct: async (
    id: number
  ): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
