import { APP_INITIALIZER, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { firstValueFrom } from 'rxjs';

/**
 * Inicializador de tema para o storefront
 * Carrega o tema antes do bootstrap da aplicação
 */
export function themeInitializer() {
  return () => {
    const themeService = inject(ThemeService);
    const platformId = inject(PLATFORM_ID);

    // Determina qual tema carregar baseado no ambiente/loja
    const getThemeUrl = (): string => {
      // Em produção, isso poderia vir de variáveis de ambiente ou API
      const storeId = getStoreId();
      
      switch (storeId) {
        case 'pink':
          return '/assets/ecommerce.theme.pink.json';
        case 'minimal':
          return '/assets/theme.minimal.json';
        default:
          return '/assets/ecommerce.theme.json';
      }
    };

    const themeUrl = getThemeUrl();
    console.log(`[ThemeInitializer] Loading theme: ${themeUrl}`);

    // Carrega o tema de forma assíncrona
    return firstValueFrom(themeService.loadTheme(themeUrl))
      .then(theme => {
        console.log(`[ThemeInitializer] Theme '${theme.name}' loaded successfully`);
      })
      .catch(error => {
        console.error('[ThemeInitializer] Failed to load theme, using default:', error);
        // O ThemeService já aplica tema padrão em caso de erro
      });
  };
}

/**
 * Determina qual loja/tema usar baseado na URL ou configuração
 * Em produção, isso viria de subdomain, path ou API
 */
function getStoreId(): string {
  if (typeof window === 'undefined') {
    return 'default'; // Fallback para SSR
  }

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Exemplos de lógica de detecção de loja:
  if (hostname.includes('pink') || pathname.includes('/pink')) {
    return 'pink';
  }
  
  if (hostname.includes('minimal') || pathname.includes('/minimal')) {
    return 'minimal';
  }
  
  // Pode também verificar localStorage, cookies, etc.
  const storedTheme = localStorage?.getItem('storefront-theme');
  if (storedTheme) {
    return storedTheme;
  }
  
  return 'default';
}

/**
 * Provider para o APP_INITIALIZER
 */
export const provideThemeInitializer = () => ({
  provide: APP_INITIALIZER,
  useFactory: themeInitializer,
  multi: true
});