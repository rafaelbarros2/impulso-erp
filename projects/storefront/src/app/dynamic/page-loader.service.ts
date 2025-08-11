import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PageConfig } from './section-registry';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PageLoaderService {
  private cache = new Map<string, PageConfig>();

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {}

  private key(tenant: string, slug: string) {
    return `${tenant}::${slug}`;
  }

  resolveTenant(): string {
    // Try query param
    const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    const q = url.searchParams.get('tenant');
    if (q) return q;
    // Fallback to localStorage or demo
    if (isPlatformBrowser(this.platformId)) {
      try { return localStorage.getItem('tenant') || 'demo'; } catch { return 'demo'; }
    }
    return 'demo';
  }

  resolveSlug(pathname?: string): string {
    const path = pathname ?? (isPlatformBrowser(this.platformId) ? window.location.pathname : '/');
    // Map root to home, otherwise take last segment
    const trimmed = path.replace(/\/?$/, '').replace(/^\//, '');
    if (!trimmed) return 'home';
    const segments = trimmed.split('/');
    return segments[segments.length - 1] || 'home';
  }

  load(tenant: string, slug: string): Observable<PageConfig> {
    const cacheKey = this.key(tenant, slug);

    // In-memory cache first
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    // Fetch from assets served by Angular (projects/storefront/public -> "/")
    const url = `/tenants/${tenant}/pages/${slug}.json`;
    return this.http.get<PageConfig>(url).pipe(
      map(cfg => {
        this.cache.set(cacheKey, cfg);
        return cfg;
      }),
      catchError(() => {
        const fallback: PageConfig = { sections: [] };
        return of(fallback);
      }),
      shareReplay(1)
    );
  }
}
