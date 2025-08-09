import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { CatalogService } from '../services/catalog.service';
import { Product } from '../models/catalog.models';

/**
 * Resolver para produto que usa TransferState para evitar refetch
 * durante hidratação SSR -> Cliente
 */
export const productResolver: ResolveFn<Product> = (route): Observable<Product> => {
  const catalogService = inject(CatalogService);
  const slug = route.paramMap.get('slug');
  
  if (!slug) {
    throw new Error('Product slug is required');
  }

  console.log(`[ProductResolver] Resolving product: ${slug}`);
  
  // O CatalogService já implementa a lógica de TransferState
  // No servidor: faz HTTP e salva no TransferState
  // No cliente: lê do TransferState (sem HTTP)
  return catalogService.getProductBySlug(slug);
};