import { Component, OnInit, inject, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicPageComponent } from '../../dynamic/dynamic-page.component';
import { PageLoaderService } from '../../dynamic/page-loader.service';
import { PageConfig } from '../../dynamic/section-registry';
import { DevToolbarComponent } from '../../components/dev-toolbar/dev-toolbar.component';
import { StorefrontThemeSelectorComponent } from '../../components/storefront-theme-selector/storefront-theme-selector.component';

@Component({
  selector: 'app-storefront-home-page',
  standalone: true,
  imports: [CommonModule, DynamicPageComponent, DevToolbarComponent, StorefrontThemeSelectorComponent],
  template: `
    <ng-container *ngIf="devMode">
      <app-dev-toolbar></app-dev-toolbar>
    </ng-container>

    <!-- Theme Selector for Testing -->
    <div class="p-4 bg-gray-100 border-b">
      <h2 class="text-lg font-semibold mb-2">Seletor de Tema (Teste)</h2>
      <app-storefront-theme-selector></app-storefront-theme-selector>
    </div>

    <section *ngIf="loading(); else content" class="p-8 text-center text-gray-600">
      <div class="animate-pulse">Carregando página...</div>
    </section>
    <ng-template #content>
      <section *ngIf="error(); else ok" class="p-8 text-center text-red-600">
        Ocorreu um erro ao carregar a página. Tente novamente mais tarde.
      </section>
      <ng-template #ok>
        <app-dynamic-page [config]="config()!"></app-dynamic-page>
      </ng-template>
    </ng-template>
  `
})
export class StorefrontHomePage implements OnInit {
  private readonly loader = inject(PageLoaderService);

  devMode = isDevMode();
  config = signal<PageConfig | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit(): void {
    const tenant = this.loader.resolveTenant();
    const slug = this.loader.resolveSlug();
    this.loader.load(tenant, slug).subscribe({
      next: cfg => { this.config.set(cfg); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
}

