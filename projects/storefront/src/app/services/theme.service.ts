import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

/**
 * Theme tokens (DTCG-like). We only care about "$value" leaves;
 * everything else is treated as namespaces forming CSS variable names.
 */
type TokenTree = { [key: string]: any };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private currentThemeUrl: string | null = null;
  private currentThemeName: string | null = null;

  private readonly STORAGE_KEY = 'storefront_theme';
  private readonly STORAGE_URL_KEY = 'storefront_theme_url';

  /** Loads a theme by URL (absolute or relative) and applies CSS variables. */
  loadThemeUrl(url: string): Observable<void> {
    this.currentThemeUrl = url;
    return this.http.get<TokenTree>(url).pipe(
      tap(tokens => this.applyTokens(tokens)),
      tap(() => this.persist()),
      map(() => void 0),
      catchError(err => {
        console.error('[ThemeService] Failed to load theme from', url, err);
        return of(void 0);
      })
    );
  }

  /** Loads a theme by name. 
   * If name looks like a URL (.json), it's treated as URL directly.
   * Otherwise, resolves to `/theme.${name}.json` at the storefront public root.
   */
  loadThemeName(name: string): Observable<void> {
    if (!name) return of(void 0);
    if (name.endsWith('.json') || name.startsWith('/') || name.startsWith('http')) {
      this.currentThemeName = this.inferNameFromUrl(name);
      return this.loadThemeUrl(name);
    }
    this.currentThemeName = name;
    const url = `/theme.${name}.json`;
    return this.loadThemeUrl(url);
  }

  /** Applies DTCG tokens as CSS variables to :root */
  private applyTokens(tokens: TokenTree): void {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server: no DOM; still keep current theme metadata
      return;
    }
    const root = document.documentElement;
    const entries = this.flattenTokens(tokens);

    for (const [cssVar, value] of entries) {
      try {
        root.style.setProperty(cssVar, value);
      } catch (e) {
        console.warn('[ThemeService] Failed to set var', cssVar, value, e);
      }
    }
    // Also set a few meta variables (for components relying on generic names)
    // Map common aliases for convenience
    const primary = getComputedStyle(root).getPropertyValue('--color-primary-500')?.trim();
    const text = getComputedStyle(root).getPropertyValue('--color-neutral-900')?.trim() || '#111827';
    if (primary) root.style.setProperty('--primary-color', primary);
    if (text) root.style.setProperty('--text-color', text);
  }

  /** Flattens tokens into [--a-b-c, value] pairs using kebab-case and numeric keys intact */
  private flattenTokens(tokens: TokenTree): Array<[string, string]> {
    const out: Array<[string, string]> = [];
    const walk = (node: any, path: string[]) => {
      if (node && typeof node === 'object' && ('$value' in node)) {
        const cssName = '--' + path.join('-');
        out.push([cssName, String(node['$value'])]);
        return;
      }
      if (node && typeof node === 'object') {
        for (const key of Object.keys(node)) {
          if (key === '$type' || key === '$description' || key === '$version' || key === '$schema') continue;
          const k = key.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
          walk(node[key], [...path, k]);
        }
      }
    };
    walk(tokens, []);
    return out;
  }

  /** Persist current theme selection in localStorage (browser only) */
  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      if (this.currentThemeName) {
        localStorage.setItem(this.STORAGE_KEY, this.currentThemeName);
        console.log(`[ThemeService] Persisted theme name: ${this.currentThemeName}`);
      }
      if (this.currentThemeUrl) {
        localStorage.setItem(this.STORAGE_URL_KEY, this.currentThemeUrl);
        console.log(`[ThemeService] Persisted theme URL: ${this.currentThemeUrl}`);
      }
    } catch {}
  }

  /** Restore selection from localStorage */
  restore(): { name: string | null; url: string | null } {
    if (!isPlatformBrowser(this.platformId)) return { name: null, url: null };
    try {
      const name = localStorage.getItem(this.STORAGE_KEY);
      const url = localStorage.getItem(this.STORAGE_URL_KEY);
      console.log(`[ThemeService] Restored from localStorage - name: ${name}, url: ${url}`);
      return { name, url };
    } catch {
      return { name: null, url: null };
    }
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_URL_KEY);
    } catch {}
  }

  private inferNameFromUrl(url: string): string {
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const base = u.pathname.split('/').pop() ?? '';
      return base.replace(/^theme\./, '').replace(/\.json$/,'') || 'custom';
    } catch {
      return 'custom';
    }
  }

  get currentName(): string | null { return this.currentThemeName; }
  get currentUrl(): string | null { return this.currentThemeUrl; }
}
