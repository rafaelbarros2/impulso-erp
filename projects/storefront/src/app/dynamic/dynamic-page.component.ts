import { Component, Input, ViewChild, ViewContainerRef, inject, OnChanges, SimpleChanges, isDevMode, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageConfig, PageSection, resolveSectionComponent, HeroSectionConfig, ProductGridSectionConfig, CategoryGridSectionConfig, BannerSectionConfig } from './section-registry';
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

  private async renderSections(sections: PageSection[]) {
    console.log('[DynamicPageComponent] Rendering sections:', sections);
    this.vc.clear();
    
    for (const section of sections) {
      console.log(`[DynamicPageComponent] Rendering section: ${section.type}`, section);
      
      const componentClass = await resolveSectionComponent(section.type);
      if (!componentClass) {
        console.warn(`[DynamicPageComponent] Failed to resolve component for section: ${section.type}`);
        continue;
      }

      const comp = this.vc.createComponent(componentClass);
      
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
          (comp.instance as any)['slides'] = slides;
          (comp.instance as any)['autoSlide'] = s.autoSlide ?? false;
          (comp.instance as any)['slideInterval'] = s.slideInterval ?? 5000;
          break;
        }
        case 'categoryGrid': {
          const s = section as CategoryGridSectionConfig;
          console.log('[DynamicPageComponent] Categories:', s.categories);
          (comp.instance as any)['title'] = s.title;
          (comp.instance as any)['categories'] = s.categories;
          (comp.instance as any)['showItemCount'] = s.showItemCount ?? true;
          break;
        }
        case 'productGrid': {
          const s = section as ProductGridSectionConfig;
          console.log('[DynamicPageComponent] Products:', s.products);
          (comp.instance as any)['products'] = Array.isArray(s.products) ? s.products : [];
          (comp.instance as any)['showRating'] = s.showRating ?? true;
          (comp.instance as any)['columns'] = s.columns ?? 'auto-fill';
          (comp.instance as any)['minCardWidth'] = s.minCardWidth ?? '320px';
          break;
        }
        case 'banner': {
          const s = section as BannerSectionConfig;
          (comp.instance as any)['image'] = s.image;
          (comp.instance as any)['href'] = s.href;
          (comp.instance as any)['title'] = s.title;
          (comp.instance as any)['ariaLabel'] = s.ariaLabel;
          break;
        }
      }
      
      comp.changeDetectorRef.detectChanges();
    }
    console.log(`[DynamicPageComponent] Rendered ${sections.length} sections`);
  }
}
