export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductMeta {
  createdAt?: string;
  updatedAt?: string;
  barcode?: string;
  qrCode?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: ProductMeta;
  images?: string[];
  thumbnail: string;
  isLocal?: boolean; // Flag for locally created/modified products
}

export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
  accessToken?: string;
  token?: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
}

export type SortField = "id" | "title" | "price" | "rating" | "stock";
export type SortOrder = "asc" | "desc";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  sortBy?: SortField;
  order?: SortOrder;
  delay?: number;
}

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  rating: string;
  brand: string;
  thumbnail: string;
}

export interface FormValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  stock?: string;
  rating?: string;
  brand?: string;
  thumbnail?: string;
}
