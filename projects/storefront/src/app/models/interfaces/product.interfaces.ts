import { ProductBadge, BadgeType } from '../../../../../src/app/core/models/ecommerce.model';

export interface StorefrontProduct {
  id: string;
  name: string;
  description?: string;
  image: string;
  images?: string[];
  price: number;
  oldPrice?: number;
  badges: ProductBadge[];
  inStock: boolean;
  rating?: {
    average: number;
    count: number;
    stars: number;
  };
  category: string;
  subcategory?: string;
  brand?: string;
  featured?: boolean;
  tags?: string[];
}

export { BadgeType };


// >>> Aqui está o Product que seus componentes esperam <<<
export type Product = StorefrontProduct;
