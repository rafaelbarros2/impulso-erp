import { inject } from '@angular/core';
import { DynamicStylesService } from '../services/dynamic-styles.service';
import { take, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Inicializador para carregar estilos dinâmicos na inicialização da aplicação
 */
export function initializeDynamicStyles() {
  return () => {
    const dynamicStylesService = inject(DynamicStylesService);
    
    // Pular inicialização se desabilitada no ambiente
    if (!environment.storefront.autoLoadStyles) {
      console.log('[DynamicStylesInitializer] Auto-load styles disabled in environment');
      return Promise.resolve();
    }
    
    console.log('[DynamicStylesInitializer] Starting dynamic styles initialization...');
    
    // Primeiro verificar se existe configuração ativa
    return dynamicStylesService.checkActiveStyles().pipe(
      take(1),
      timeout(5000) // Timeout de 5 segundos
    ).toPromise().then((hasActiveStyles) => {
      
      if (!hasActiveStyles) {
        console.log('[DynamicStylesInitializer] No active styles found in backend');
        return null;
      }
      
      // Se existe configuração ativa, carregar estilos
      return dynamicStylesService.loadStyles().pipe(
        take(1),
        timeout(10000) // Timeout de 10 segundos
      ).toPromise().then((config) => {
        if (config) {
          console.log('[DynamicStylesInitializer] Dynamic styles loaded successfully from backend');
          console.log('[DynamicStylesInitializer] Configuration:', {
            tenant: config.tenant,
            version: config.version,
            hasTheme: !!config.theme,
            hasComponents: !!config.components,
            hasShopping: !!config.globalShopping
          });
          return config;
        } else {
          console.log('[DynamicStylesInitializer] Backend returned null configuration');
          return null;
        }
      });
      
    }).catch((error) => {
      console.warn('[DynamicStylesInitializer] Failed to initialize dynamic styles:', error);
      
      // Em desenvolvimento, tentar fallback para arquivos locais
      if (!environment.production && environment.storefront.fallbackToLocalFiles) {
        console.log('[DynamicStylesInitializer] Trying local fallback in development mode...');
        return dynamicStylesService.loadStyles('demo').pipe(
          take(1),
          timeout(5000)
        ).toPromise().then((fallbackConfig) => {
          if (fallbackConfig) {
            console.log('[DynamicStylesInitializer] Fallback styles loaded successfully');
            return fallbackConfig;
          } else {
            console.log('[DynamicStylesInitializer] Fallback also failed, using default styles');
            return null;
          }
        }).catch((fallbackError) => {
          console.warn('[DynamicStylesInitializer] Fallback failed:', fallbackError);
          return null;
        });
      }
      
      // Não falhar a inicialização da aplicação se os estilos não carregarem
      return null;
    });
  };
}

/**
 * Inicializador otimizado para produção
 * Carrega apenas se existir configuração ativa
 */
export function initializeDynamicStylesOptimized() {
  return () => {
    const dynamicStylesService = inject(DynamicStylesService);
    
    if (!environment.storefront.autoLoadStyles) {
      return Promise.resolve();
    }
    
    console.log('[DynamicStylesInitializer] Optimized initialization starting...');
    
    // Em produção, carrega diretamente sem verificar primeiro
    if (environment.production) {
      return dynamicStylesService.loadStyles().pipe(
        take(1),
        timeout(8000)
      ).toPromise().then((config) => {
        if (config) {
          console.log('[DynamicStylesInitializer] Production styles loaded');
        }
        return config;
      }).catch((error) => {
        console.warn('[DynamicStylesInitializer] Production load failed:', error);
        return null;
      });
    }
    
    // Em desenvolvimento, usar inicialização completa
    return initializeDynamicStyles()();
  };
}

/**
 * Inicializador que força reload do cache
 */
export function initializeDynamicStylesFresh() {
  return () => {
    const dynamicStylesService = inject(DynamicStylesService);
    
    console.log('[DynamicStylesInitializer] Fresh initialization (clearing cache)...');
    
    // Limpar cache antes de carregar
    dynamicStylesService.clearAllCache();
    
    return dynamicStylesService.loadStyles(undefined, false).pipe(
      take(1),
      timeout(10000)
    ).toPromise().then((config) => {
      if (config) {
        console.log('[DynamicStylesInitializer] Fresh styles loaded successfully');
      }
      return config;
    }).catch((error) => {
      console.warn('[DynamicStylesInitializer] Fresh load failed:', error);
      return null;
    });
  };
}