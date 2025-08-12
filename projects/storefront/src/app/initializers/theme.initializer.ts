import { APP_INITIALIZER, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from '../services/theme.service';

/**
 * Precedence for resolving the theme:
 * 1) URL params: ?theme=<name> or ?themeUrl=<url>
 * 2) localStorage (previous choice)
 * 3) Hostname mapping from /store-themes.json (map host -> name or url)
 * 4) Default: theme.minimal.json
 */
export function themeInitializer() {
  return async () => {
    console.log('[ThemeInitializer] Starting theme initialization...');
    const http = inject(HttpClient);
    const theme = inject(ThemeService);
    const platformId = inject(PLATFORM_ID);

    const isBrowser = isPlatformBrowser(platformId);
    console.log(`[ThemeInitializer] Is browser: ${isBrowser}`);

    // Skip theme loading during SSR to avoid HTTP errors
    if (!isBrowser) {
      console.log('[ThemeInitializer] Skipping theme loading during SSR');
      return true;
    }

    const params = isBrowser ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const themeUrlParam = params.get('themeUrl');
    const themeParam = params.get('theme');
    const clearParam = params.get('clearTheme');

    console.log(`[ThemeInitializer] URL params - theme: ${themeParam}, themeUrl: ${themeUrlParam}, clearTheme: ${clearParam}`);

    if (clearParam) {
      console.log('[ThemeInitializer] Clearing theme from localStorage');
      theme.clear();
    }

    // 1) URL param override
    if (themeUrlParam) {
      console.log(`[ThemeInitializer] Loading theme from URL param: ${themeUrlParam}`);
      await firstValueFrom(theme.loadThemeUrl(themeUrlParam));
      return true;
    }
    if (themeParam) {
      console.log(`[ThemeInitializer] Loading theme from name param: ${themeParam}`);
      await firstValueFrom(theme.loadThemeName(themeParam));
      return true;
    }

    // 2) localStorage
    console.log('[ThemeInitializer] Checking localStorage for saved theme...');
    const restored = theme.restore();
    if (restored?.url) {
      console.log(`[ThemeInitializer] Loading theme from localStorage URL: ${restored.url}`);
      await firstValueFrom(theme.loadThemeUrl(restored.url));
      return true;
    }
    if (restored?.name) {
      console.log(`[ThemeInitializer] Loading theme from localStorage name: ${restored.name}`);
      await firstValueFrom(theme.loadThemeName(restored.name));
      return true;
    }

    // 3) Hostname mapping
    console.log('[ThemeInitializer] Checking hostname mapping...');
    let mapped: string | null = null;
    try {
      const mapping: any = await firstValueFrom(http.get('/store-themes.json'));
      const host = isBrowser ? window.location.hostname.toLowerCase() : 'ssr';
      const map: Record<string,string> = (mapping && mapping.map) || {};
      console.log(`[ThemeInitializer] Host: ${host}, Mapping:`, map);
      
      // exact match
      if (host in map) {
        mapped = map[host];
      } else {
        // suffix wildcard (e.g., ".lojas.meudominio.com")
        const entries = Object.entries(map);
        for (const [key, value] of entries) {
          if (key.startsWith('*.')) {
            const suffix = key.slice(1); // ".domain.com"
            if (host.endsWith(suffix)) {
              mapped = value;
              break;
            }
          }
        }
      }
      if (!mapped) {
        mapped = mapping?.default || 'minimal';
      }
      console.log(`[ThemeInitializer] Mapped theme: ${mapped}`);
    } catch (err) {
      console.log('[ThemeInitializer] Mapping not available, using default');
      // mapping not available; use default
      mapped = 'minimal';
    }

    if (mapped) {
      console.log(`[ThemeInitializer] Loading mapped theme: ${mapped}`);
      if (mapped.endsWith('.json') || mapped.startsWith('/') || mapped.startsWith('http')) {
        await firstValueFrom(theme.loadThemeUrl(mapped));
      } else {
        await firstValueFrom(theme.loadThemeName(mapped));
      }
      return true;
    }

    // 4) Absolute fallback
    console.log('[ThemeInitializer] Using fallback theme: minimal');
    await firstValueFrom(theme.loadThemeName('minimal'));
    return true;
  };
}

export const provideThemeInitializer = () => ({
  provide: APP_INITIALIZER,
  useFactory: themeInitializer,
  multi: true
});
