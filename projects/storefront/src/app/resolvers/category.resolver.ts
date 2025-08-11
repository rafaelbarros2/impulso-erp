import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { CatalogService } from '../services/catalog.service';
import { Category } from '../models/catalog.models';

/**
 * Resolver para categoria que usa TransferState para evitar refetch
 * durante hidratação SSR -> Cliente
 */
export const categoryResolver: ResolveFn<Category> = (route): Observable<Category> => {
  const catalogService = inject(CatalogService);
  const slug = route.paramMap.get('slug');
  
  if (!slug) {
    throw new Error('Category slug is required');
  }

  // Resolving category
  
  // O CatalogService já implementa a lógica de TransferState
  // No servidor: faz HTTP e salva no TransferState
  // No cliente: lê do TransferState (sem HTTP)
  return catalogService.getCategoryBySlug(slug);
};