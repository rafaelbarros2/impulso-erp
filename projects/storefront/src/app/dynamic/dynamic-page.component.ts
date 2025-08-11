import { Component, Input, ViewChild, ViewContainerRef, inject, OnChanges, SimpleChanges, isDevMode, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageConfig, PageSection, SECTION_REGISTRY, HeroSectionConfig, ProductGridSectionConfig, CategoryGridSectionConfig, BannerSectionConfig } from './section-registry';
import { ThemeTokenApplierService } from './theme-token-applier.service';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container #vc></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicPageComponent implements OnChanges {
  @Input() config!: PageConfig;
  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;

  private readonly theme = inject(ThemeTokenApplierService);

  ngOnChanges(changes: SimpleChanges): void {
    if ('config' in changes && this.config) {
      if (this.config.theme?.tokens) {
        this.theme.apply(this.config.theme.tokens);
      }
      this.renderSections(this.config.sections ?? []);
    }
  }

  private renderSections(sections: PageSection[]) {
    console.log('[DynamicPageComponent] Rendering sections:', sections);
    this.vc.clear();
    for (const section of sections) {
      // Garantir apenas componentes permitidos
      if (!SECTION_REGISTRY[section.type]) {
        console.warn(`[DynamicPageComponent] Section type '${section.type}' not found in registry`);
        continue;
      }

      console.log(`[DynamicPageComponent] Rendering section: ${section.type}`, section);

      switch (section.type) {
        case 'hero': {
          const s = section as HeroSectionConfig;
          const slides = [{
            id: 'hero-1',
            title: s.title,
            subtitle: s.subtitle ?? '',
            buttonText: s.ctaText ?? '',
            image: s.image ?? ''
          }];
          console.log('[DynamicPageComponent] Hero slides:', slides);
          const comp = this.vc.createComponent(SECTION_REGISTRY.hero.component);
          comp.instance['slides'] = slides;
          comp.instance['autoSlide'] = s.autoSlide ?? false;
          comp.instance['slideInterval'] = s.slideInterval ?? 5000;
          comp.changeDetectorRef.detectChanges();
          break;
        }
        case 'categoryGrid': {
          const s = section as CategoryGridSectionConfig;
          console.log('[DynamicPageComponent] Categories:', s.categories);
          const comp = this.vc.createComponent(SECTION_REGISTRY.categoryGrid.component);
          comp.instance['title'] = s.title;
          comp.instance['categories'] = s.categories;
          comp.instance['showItemCount'] = s.showItemCount ?? true;
          comp.changeDetectorRef.detectChanges();
          break;
        }
        case 'productGrid': {
          const s = section as ProductGridSectionConfig;
          console.log('[DynamicPageComponent] Products:', s.products);
          // If inline products provided, set them; otherwise, leave empty for now (no backend requirement)
          const comp = this.vc.createComponent(SECTION_REGISTRY.productGrid.component);
          comp.instance['products'] = Array.isArray(s.products) ? s.products : [];
          comp.instance['showRating'] = s.showRating ?? true;
          comp.instance['columns'] = s.columns ?? 'auto-fill';
          comp.instance['minCardWidth'] = s.minCardWidth ?? '320px';
          comp.changeDetectorRef.detectChanges();
          break;
        }
        case 'banner': {
          const s = section as BannerSectionConfig;
          const comp = this.vc.createComponent(SECTION_REGISTRY.banner.component);
          comp.instance['image'] = s.image;
          comp.instance['href'] = s.href;
          comp.instance['title'] = s.title;
          comp.instance['ariaLabel'] = s.ariaLabel;
          comp.changeDetectorRef.detectChanges();
          break;
        }
      }
    }
    console.log(`[DynamicPageComponent] Rendered ${sections.length} sections`);
  }
}
