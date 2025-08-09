export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  inStock: boolean;
  attributes: ProductAttribute[];
  createdAt: string;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  parentId?: string;
  products: Product[];
  subcategories: Category[];
  createdAt: string;
}

export interface CatalogResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}