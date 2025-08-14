import { BaseEntity } from './core.model';

export interface Product extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  minStock: number;
  maxStock?: number;
  unitOfMeasure: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
  images?: string[];
  active: boolean;
  taxable: boolean;
  taxRate?: number;
  supplier?: string;
  notes?: string;
  tags?: string[];
  variants?: ProductVariant[];
  inStock?: boolean;
  oldPrice?: number; 
  price?: number;
  featured?: boolean; // For displaying old price in promotions
}

export interface ProductVariant extends BaseEntity {
  id: number;
  productId: number;
  name: string;
  sku: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  imageUrl?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  active?: boolean;
  tags?: string[];
  supplier?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  minStock: number;
  maxStock?: number;
  unitOfMeasure: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
  images?: string[];
  active: boolean;
  taxable: boolean;
  taxRate?: number;
  supplier?: string;
  notes?: string;
  tags?: string[];
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
  productsByCategory: Array<{
    category: string;
    count: number;
    totalValue: number;
  }>;
  topSellingProducts: Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>;
}

export interface StockMovement extends BaseEntity {
  id: number;
  productId: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  notes?: string;
  userId: number;
  referenceNumber?: string;
}

export interface ProductImportData {
  name: string;
  description?: string;
  sku: string;
  category: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  minStock: number;
  unitOfMeasure: string;
}

export interface PosProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  emoji: string;
  categoryId: string;
  barcode?: string;
  sku?: string;
}

export interface ProductCategory {
  name: string;
  code: string;
}

export interface ProductSize {
  name: string;
  code: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductDisplay extends Product {
  status?: 'Em Estoque' | 'Baixo Estoque' | 'Esgotado';
}