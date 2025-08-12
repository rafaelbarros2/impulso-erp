import type { Type } from '@angular/core';
// Imports somente de TIPOS para não puxar os componentes no bundle inicial
import type { HeroSlide } from '../components/storefront-hero/storefront-hero.component';
import type { CategoryItem } from '../components/storefront-categories/storefront-categories.component';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

// ——————————————————————————————————————————————————————————
// Banner simples (standalone) — mantido no próprio arquivo
// ——————————————————————————————————————————————————————————
@Component({
  selector: 'app-storefront-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a *ngIf="href; else imageOnly" [href]="href" class="block focus:outline-none"
       [attr.aria-label]="ariaLabel || title || 'banner'">
      <img [src]="image" [alt]="title || ariaLabel || 'banner'" class="w-full h-auto" (error)="onError($event)" />
    </a>
    <ng-template #imageOnly>
      <img [src]="image" [alt]="title || ariaLabel || 'banner'" class="w-full h-auto" (error)="onError($event)" />
    </ng-template>
  `
})
export class StorefrontBannerComponent {
  @Input() image!: string;
  @Input() href?: string;
  @Input() title?: string;
  @Input() ariaLabel?: string;
  onError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (!img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDY0MCAyMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0MCIgaGVpZ2h0PSIyMjAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSIzMjAiIHk9IjExMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY3Njk3ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCI+SW1hZ2VtIG5hbyBkaXNwb25pdmVsPC90ZXh0Pjwvc3ZnPg=='
    }
  }
}

// ——————————————————————————————————————————————————————————
// Tipos de seção (mantidos para o DynamicPage)
// ——————————————————————————————————————————————————————————
export type SectionType = 'hero' | 'categoryGrid' | 'productGrid' | 'banner' | 'remoteHtmlInline' | 'remoteHtml' | 'promotionList';

export interface ThemeTokens {
  colorPrimary600?: string;
  colorPrimary700?: string;
  heroText?: string;
  heroOverlayOpacity?: string;
}
export interface PageThemeConfig { tokens?: ThemeTokens; }

export interface HeroSectionConfig {
  type: 'hero';
  title: string;
  subtitle?: string;
  ctaText?: string;
  image?: string;
  autoSlide?: boolean;
  slideInterval?: number;
}
export interface CategoryGridSectionConfig {
  type: 'categoryGrid';
  title?: string;
  categories: CategoryItem[];
  showItemCount?: boolean;
}
export interface ProductGridSectionConfig {
  type: 'productGrid';
  title?: string;
  products?: unknown[];
  query?: string;
  showRating?: boolean;
  columns?: string;
  minCardWidth?: string;
}
export interface BannerSectionConfig {
  type: 'banner';
  image: string;
  href?: string;
  title?: string;
  ariaLabel?: string;
}
export type PageSection =
  | HeroSectionConfig
  | CategoryGridSectionConfig
  | ProductGridSectionConfig
  | BannerSectionConfig;

export interface PageConfig { theme?: PageThemeConfig; sections: PageSection[]; }

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

