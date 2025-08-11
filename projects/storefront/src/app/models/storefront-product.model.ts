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


export function toStorefrontProduct(core: any): StorefrontProduct {
  return {
    id: String(core?.id ?? core?.uuid ?? ''),
    name: core?.name ?? core?.title ?? '',
    description: core?.description ?? '',
    image: core?.image ?? core?.thumbnail ?? 'placeholder.png',
    images: core?.images ?? [],
    price: Number(core?.price ?? 0),
    oldPrice: core?.oldPrice ?? undefined,
    badges: (core?.badges as ProductBadge[]) ?? [],
    inStock: (core?.inStock ?? (typeof core?.stock === 'number' ? core.stock > 0 : true)),
    rating: core?.rating ?? undefined,
    category: core?.category ?? 'Geral',
    subcategory: core?.subcategory ?? undefined,
    brand: core?.brand ?? undefined,
    featured: core?.featured ?? false,
    tags: core?.tags ?? [],
  };
}