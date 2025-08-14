import { ProductBadge } from '../../../../../src/app/core/models/ecommerce.model';
import { StorefrontProduct } from './interfaces/product.interfaces';

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