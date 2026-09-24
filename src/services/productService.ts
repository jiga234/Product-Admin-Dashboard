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
   * Fetch all product categories
   */
  getCategories: async (): Promise<ProductCategory[]> => {
    const response = await apiClient.get<ProductCategory[]>("/products/categories");
    return response.data;
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
