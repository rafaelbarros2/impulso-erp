export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  rating: ProductRating;
  badges: ProductBadge[];
  category: string;
  inStock: boolean;
  url?: string; // URL para o produto
  featured: boolean;
}

export interface ProductRating {
  average: number;
  count: number;
  stars: number; // 1-5
}

export interface ProductBadge {
  type: BadgeType;
  label: string;
}

export enum BadgeType {
  NEW = 'new',
  SALE = 'sale', 
  FEATURED = 'featured'
}

export enum LayoutType {
  GRID = 'grid',
  MINIMAL = 'minimal'
}

export interface ProductActionEvent {
  product: Product;
  action: 'favorite' | 'compare' | 'quickview' | 'addToCart';
}