import type { Type } from '@angular/core';
// Imports somente de TIPOS para não puxar os componentes no bundle inicial
import { SectionType } from '../models/interfaces/page.interfaces';
import { StorefrontBannerComponent } from '../models/interfaces/page.interfaces';

// ——————————————————————————————————————————————————————————
// Registry baseado em LAZY loaders (promessa de componente)
// ——————————————————————————————————————————————————————————
export type SectionLoader = () => Promise<Type<any>>;
export const SECTION_REGISTRY: Record<SectionType, SectionLoader> = {
  hero: () => import('../components/storefront-hero/storefront-hero.component')
            .then(m => m.StorefrontHeroComponent),

  categoryGrid: () => import('../components/storefront-categories/storefront-categories.component')
            .then(m => m.StorefrontCategoriesComponent),

  productGrid: () => import('../components/storefront-item-grid/storefront-item-grid.component')
            .then(m => m.StorefrontItemGridComponent),

  banner: () => Promise.resolve(StorefrontBannerComponent),

  remoteHtmlInline: () => import('../sections/remote-html-inline-section.component')
            .then(m => m.RemoteHtmlInlineSectionComponent),

  remoteHtml: () => import('../sections/remote-html-iframe-section.component')
            .then(m => m.RemoteHtmlIframeSectionComponent),

  promotionList: () => import('../sections/promo-list-section.component')
            .then(m => m.PromoListSectionComponent),
};

// Helper seguro para o DynamicPage
export async function resolveSectionComponent(type: SectionType): Promise<Type<any> | null> {
  const loader = SECTION_REGISTRY[type];
  if (!loader) {
    console.error('[SectionRegistry] tipo de seção não registrado:', type);
    return null;
  }
  try {
    return await loader();
  } catch (err) {
    console.error('[SectionRegistry] falha ao carregar', type, err);
    return null;
  }
}

