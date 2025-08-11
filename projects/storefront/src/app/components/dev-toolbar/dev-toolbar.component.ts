import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ThemeTokenApplierService } from '../../dynamic/theme-token-applier.service';

@Component({
  selector: 'app-dev-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-0 left-0 right-0 z-50 bg-yellow-100 border-b border-yellow-300 text-yellow-800 px-4 py-2 flex items-center gap-2">
      <strong>Dev Toolbar</strong>
      <label>Tenant:</label>
      <input [value]="tenant()" (input)="onTenantInput($event)" class="border px-2 py-1 rounded" />
      <label>Slug:</label>
      <input [value]="slug()" (input)="onSlugInput($event)" class="border px-2 py-1 rounded" />
      <button (click)="apply()" class="ml-2 px-3 py-1 bg-yellow-300 rounded hover:bg-yellow-400">Aplicar</button>
      <span class="ml-4">Temas:</span>
      <button (click)="applyTheme('blue')" class="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300">Azul</button>
      <button (click)="applyTheme('red')" class="px-2 py-1 bg-red-200 rounded hover:bg-red-300">Vermelho</button>
    </div>
    <div style="height:44px"></div>
  `
})
export class DevToolbarComponent {
  tenant = signal<string>('demo');
  slug = signal<string>('home');

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly http: HttpClient,
    private readonly theme: ThemeTokenApplierService,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const t = localStorage.getItem('tenant');
        if (t) this.tenant.set(t);
      } catch {}
      try {
        const url = new URL(window.location.href);
        const s = url.pathname.replace(/\/?$/, '').split('/').pop() || 'home';
        this.slug.set(s);
      } catch {}
    }
  }

  apply() {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem('tenant', this.tenant()); } catch {}
    const params = new URLSearchParams(window.location.search);
    params.set('tenant', this.tenant());
    const base = window.location.origin;
    const path = `/${this.slug()}`.replace('//', '/');
    window.location.href = `${base}${path}?${params.toString()}`;
  }

  applyTheme(name: 'blue' | 'red') {
    this.http.get<{ tokens: any }>(`/tenants/${this.tenant()}/themes/${name}.json`).subscribe({
      next: (v) => this.theme.apply(v.tokens || {}),
    });
  }

  onTenantInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.tenant.set(input?.value ?? '');
  }

  onSlugInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.slug.set(input?.value ?? '');
  }
}
