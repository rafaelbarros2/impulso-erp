export interface Promotion {
  id: string;
  title: string;
  description?: string;
  salePrice: number;
  originalPrice?: number;
  image?: string;
  categories?: string[];
  badge?: string;
  discount?: string;
  category?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface PromotionFilter {
  category?: string;
  minDiscount?: number;
  maxPrice?: number;
  searchTerm?: string;
  isActive?: boolean;
}
