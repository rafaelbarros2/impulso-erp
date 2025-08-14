import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  DynamicStylesResponse, 
  DynamicStylesState, 
  ProductCardStyle, 
  ComponentStyle,
  BackgroundConfig,
  HoverEffectConfig,
  MenuStyle,
  GlobalTypographyConfig,
  GlobalLayoutConfig,
  IconConfig,
  ShoppingConfig
} from '../models/dynamic-styles.models';

@Injectable({ providedIn: 'root' })
export class DynamicStylesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private _state = signal<DynamicStylesState>({
    isLoading: false,
    isLoaded: false,
    currentConfig: null,
    error: null,
    lastUpdated: null
  });

  private styleSheets = new Map<string, HTMLStyleElement>();
  private appliedStyles = new Set<string>();
  private configCache = new Map<string, DynamicStylesResponse>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  state = this._state.asReadonly();
  
  private get baseApiUrl(): string {
    return environment.apiUrl || 'http://localhost:8080/api';
  }
  
  private get currentSubdomain(): string {
    if (isPlatformBrowser(this.platformId)) {
      return window.location.hostname.split('.')[0] || 'demo';
    }
    return 'demo';
  }

  /**
   * Carrega configurações de estilo do backend por subdomínio
   */
  loadStyles(subdomain?: string, useCache = true): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const cacheKey = `styles_${targetSubdomain}`;
    
    // Verificar cache primeiro
    if (useCache && this.configCache.has(cacheKey)) {
      const cached = this.configCache.get(cacheKey)!;
      console.log(`[DynamicStylesService] Using cached config for: ${targetSubdomain}`);
      this.applyDynamicStyles(cached);
      return of(cached);
    }
    
    this.updateState({ isLoading: true, error: null });
    
    const url = `${this.baseApiUrl}/storefront/styles/${targetSubdomain}`;
    console.log(`[DynamicStylesService] Loading styles from: ${url}`);
    
    return this.http.get<DynamicStylesResponse>(url).pipe(
      tap(config => {
        console.log(`[DynamicStylesService] Loaded styles successfully for: ${targetSubdomain}`);
        
        // Armazenar no cache
        this.configCache.set(cacheKey, config);
        
        this.updateState({
          isLoading: false,
          isLoaded: true,
          currentConfig: config,
          lastUpdated: new Date()
        });
        this.applyDynamicStyles(config);
      }),
      catchError(error => {
        console.warn(`[DynamicStylesService] Failed to load from API for ${targetSubdomain}, trying local fallback:`, error);
        
        // Tentar carregar arquivo local como fallback
        return this.http.get<DynamicStylesResponse>('/dynamic-styles-complete-example.json').pipe(
          tap(config => {
            console.log(`[DynamicStylesService] Loaded styles from local fallback for: ${targetSubdomain}`);
            this.updateState({
              isLoading: false,
              isLoaded: true,
              currentConfig: config,
              lastUpdated: new Date()
            });
            this.applyDynamicStyles(config);
          }),
          catchError(fallbackError => {
            console.error(`[DynamicStylesService] Failed to load fallback styles for ${targetSubdomain}:`, fallbackError);
            this.updateState({
              isLoading: false,
              error: `Failed to load styles for ${targetSubdomain}`,
              lastUpdated: new Date()
            });
            return of(null);
          })
        );
      }),
      shareReplay(1)
    );
  }

  /**
   * Aplica estilos dinâmicos ao DOM
   */
  private applyDynamicStyles(config: DynamicStylesResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[DynamicStylesService] Skipping style application on server');
      return;
    }

    // Aplicar tema global
    if (config.theme) {
      this.applyGlobalTheme(config.theme);
    }

    // Aplicar configurações globais
    if (config.globalTypography) {
      this.applyGlobalTypography(config.globalTypography);
    }

    if (config.globalLayout) {
      this.applyGlobalLayout(config.globalLayout);
    }

    if (config.globalIcons) {
      this.applyGlobalIcons(config.globalIcons);
    }

    if (config.globalShopping) {
      this.applyGlobalShopping(config.globalShopping);
    }

    // Aplicar estilos de componentes
    if (config.components) {
      Object.entries(config.components).forEach(([componentName, componentConfig]) => {
        if (componentConfig) {
          this.applyComponentStyle(componentName, componentConfig);
        }
      });
    }

    // Aplicar CSS customizado
    if (config.customCSS) {
      this.applyCustomCSS(config.customCSS);
    }

    // Aplicar estilos globais
    if (config.globalStyles) {
      config.globalStyles.forEach(style => {
        this.applyGenericComponentStyle(style);
      });
    }
  }

  /**
   * Aplica tema global usando CSS custom properties
   */
  private applyGlobalTheme(theme: any): void {
    const root = document.documentElement;
    
    // Aplicar cores básicas
    const flattenTheme = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !key.includes('background')) {
          flattenTheme(value, `${prefix}${key}-`);
        } else {
          const cssVar = `--theme-${prefix}${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          if (typeof value === 'string') {
            root.style.setProperty(cssVar, value);
          } else if (typeof value === 'object' && key === 'background') {
            // Tratar background especial
            root.style.setProperty(cssVar, this.processBackgroundValue(value));
          }
        }
      });
    };
    
    flattenTheme(theme);
  }

  /**
   * Aplica tipografia global
   */
  private applyGlobalTypography(typography: GlobalTypographyConfig): void {
    const root = document.documentElement;
    
    // Font family global
    if (typography.fontFamily) {
      root.style.setProperty('--font-family', typography.fontFamily);
    }
    
    let css = `
      * {
        font-family: var(--font-family, ${typography.fontFamily || 'inherit'});
      }
    `;
    
    // Headings
    Object.entries(typography.headings).forEach(([tag, style]) => {
      css += `
        ${tag} {
          ${this.generateTextStyleCSS(style)}
        }
      `;
    });
    
    // Body text
    if (typography.body) {
      css += `
        body, p, div {
          ${this.generateTextStyleCSS(typography.body)}
        }
      `;
    }
    
    // Links
    if (typography.links) {
      css += `
        a {
          color: ${typography.links.color};
          text-decoration: ${typography.links.textDecoration};
        }
        a:hover {
          color: ${typography.links.hoverColor};
          text-decoration: ${typography.links.hoverTextDecoration};
        }
        a:active {
          color: ${typography.links.activeColor};
        }
      `;
    }
    
    // Buttons
    if (typography.buttons) {
      Object.entries(typography.buttons).forEach(([variant, buttonStyle]) => {
        css += this.generateButtonCSS(variant, buttonStyle);
      });
    }
    
    this.injectStyleSheet('global-typography', css);
  }

  /**
   * Aplica layout global
   */
  private applyGlobalLayout(layout: GlobalLayoutConfig): void {
    let css = '';
    
    if (layout.container) {
      css += `
        .container {
          max-width: ${layout.container.maxWidth};
          padding: ${layout.container.padding};
          margin: ${layout.container.margin};
        }
      `;
    }
    
    if (layout.sections) {
      css += `
        section, .section {
          padding: ${layout.sections.padding};
          margin: ${layout.sections.margin};
          ${layout.sections.background ? this.generateBackgroundCSS(layout.sections.background) : ''}
        }
      `;
    }
    
    if (layout.grid) {
      css += `
        .grid {
          gap: ${layout.grid.gap};
        }
        .grid {
          grid-template-columns: repeat(${layout.grid.columns.mobile}, 1fr);
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(${layout.grid.columns.tablet}, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(${layout.grid.columns.desktop}, 1fr);
          }
        }
      `;
    }
    
    this.injectStyleSheet('global-layout', css);
  }

  /**
   * Aplica configuração global de ícones
   */
  private applyGlobalIcons(icons: IconConfig): void {
    const root = document.documentElement;
    
    // Variáveis CSS para ícones
    root.style.setProperty('--icon-color', icons.color);
    if (icons.hoverColor) root.style.setProperty('--icon-hover-color', icons.hoverColor);
    if (icons.activeColor) root.style.setProperty('--icon-active-color', icons.activeColor);
    root.style.setProperty('--icon-size', icons.size);
    
    let css = `
      .pi, .fa, .material-icons, [class*="icon"] {
        color: var(--icon-color, ${icons.color});
        font-size: var(--icon-size, ${icons.size});
        ${icons.weight ? `font-weight: ${icons.weight};` : ''}
      }
    `;
    
    if (icons.hoverColor) {
      css += `
        .pi:hover, .fa:hover, .material-icons:hover, [class*="icon"]:hover {
          color: var(--icon-hover-color, ${icons.hoverColor});
        }
      `;
    }
    
    if (icons.activeColor) {
      css += `
        .pi:active, .fa:active, .material-icons:active, [class*="icon"]:active,
        .pi.active, .fa.active, .material-icons.active, [class*="icon"].active {
          color: var(--icon-active-color, ${icons.activeColor});
        }
      `;
    }
    
    this.injectStyleSheet('global-icons', css);
  }

  /**
   * Aplica estilos específicos de componentes
   */
  private applyComponentStyle(componentName: string, config: ComponentStyle | ProductCardStyle | MenuStyle): void {
    const styleId = `dynamic-style-${componentName}`;
    
    let css = '';
    
    if (componentName === 'productCard') {
      css = this.generateProductCardCSS(config as ProductCardStyle);
    } else if (componentName === 'menu') {
      css = this.generateMenuCSS(config as MenuStyle);
    } else {
      css = this.generateGenericComponentCSS(config as ComponentStyle);
    }
    
    this.injectStyleSheet(styleId, css);
  }

  /**
   * Gera CSS para cards de produto
   */
  private generateProductCardCSS(config: ProductCardStyle): string {
    let css = `
      .product-card {
        ${this.generateBackgroundCSS(config.background)}
        ${config.border ? this.generateBorderCSS(config.border) : ''}
        ${config.borderRadius ? `border-radius: ${config.borderRadius};` : ''}
        ${config.padding ? `padding: ${config.padding};` : ''}
        ${config.shadow ? `box-shadow: ${config.shadow};` : ''}
      }
    `;

    // Efeitos hover
    if (config.hoverEffect) {
      css += `
        .product-card:hover {
          ${this.generateHoverEffectCSS(config.hoverEffect)}
        }
      `;
    }

    // Layout
    if (config.layout) {
      css += `
        .product-card {
          flex-direction: ${config.layout.direction};
          ${config.layout.spacing ? `gap: ${config.layout.spacing};` : ''}
        }
        .product-image {
          ${config.layout.imageRatio ? `aspect-ratio: ${config.layout.imageRatio};` : ''}
        }
        .product-info {
          ${config.layout.contentAlign ? `text-align: ${config.layout.contentAlign};` : ''}
        }
      `;
    }

    // Tipografia
    if (config.typography) {
      if (config.typography.title) {
        css += `.product-name { ${this.generateTextStyleCSS(config.typography.title)} }`;
      }
      if (config.typography.description) {
        css += `.product-description { ${this.generateTextStyleCSS(config.typography.description)} }`;
      }
      if (config.typography.price) {
        css += `.current-price { ${this.generateTextStyleCSS(config.typography.price)} }`;
      }
      if (config.typography.badge) {
        css += `.badge { ${this.generateTextStyleCSS(config.typography.badge)} }`;
      }
    }

    // Cores
    if (config.colors) {
      if (config.colors.badge) {
        css += `
          .badge-sale { 
            background: ${config.colors.badge.sale.background}; 
            color: ${config.colors.badge.sale.color}; 
          }
          .badge-new { 
            background: ${config.colors.badge.new.background}; 
            color: ${config.colors.badge.new.color}; 
          }
          .badge-featured { 
            background: ${config.colors.badge.featured.background}; 
            color: ${config.colors.badge.featured.color}; 
          }
        `;
      }
      if (config.colors.button) {
        css += `
          .btn-primary { 
            background: ${config.colors.button.primary.background}; 
            color: ${config.colors.button.primary.color}; 
          }
          .btn-primary:hover { 
            background: ${config.colors.button.primary.hover}; 
          }
          .btn-secondary { 
            background: ${config.colors.button.secondary.background}; 
            color: ${config.colors.button.secondary.color}; 
          }
          .btn-secondary:hover { 
            background: ${config.colors.button.secondary.hover}; 
          }
        `;
      }
    }

    // Espaçamento
    if (config.spacing) {
      css += `
        .product-info {
          ${config.spacing.padding ? `padding: ${config.spacing.padding};` : ''}
          ${config.spacing.gap ? `gap: ${config.spacing.gap};` : ''}
        }
      `;
    }

    return css;
  }

  /**
   * Gera CSS genérico para componentes
   */
  private generateGenericComponentCSS(config: ComponentStyle): string {
    const { selector, styles, classes } = config;
    
    let css = `${selector} {`;
    
    Object.entries(styles).forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `${cssProperty}: ${value};`;
    });
    
    css += '}';

    // Adicionar classes auxiliares se especificadas
    if (classes && classes.length > 0) {
      classes.forEach(className => {
        css += `\n.${className} { /* Add specific rules as needed */ }`;
      });
    }

    return css;
  }

  /**
   * Aplica estilo de componente genérico
   */
  private applyGenericComponentStyle(style: ComponentStyle): void {
    const css = this.generateGenericComponentCSS(style);
    const styleId = `generic-style-${Date.now()}`;
    this.injectStyleSheet(styleId, css);
  }

  /**
   * Gera CSS para background
   */
  private generateBackgroundCSS(background: string | BackgroundConfig): string {
    if (typeof background === 'string') {
      return `background: ${background};`;
    }

    const bg = background as BackgroundConfig;
    let css = '';

    switch (bg.type) {
      case 'solid':
        css = `background-color: ${bg.value};`;
        break;
      case 'gradient':
        css = `background: ${bg.value};`;
        break;
      case 'image':
        css = `background-image: url(${bg.value});`;
        if (bg.position) css += `background-position: ${bg.position};`;
        if (bg.size) css += `background-size: ${bg.size};`;
        if (bg.repeat) css += `background-repeat: ${bg.repeat};`;
        break;
      case 'pattern':
        css = `background: ${bg.value};`;
        break;
    }

    if (bg.opacity !== undefined) {
      css += `opacity: ${bg.opacity};`;
    }

    return css;
  }

  /**
   * Gera CSS para borda
   */
  private generateBorderCSS(border: any): string {
    return `border: ${border.width} ${border.style} ${border.color};`;
  }

  /**
   * Gera CSS para efeito hover
   */
  private generateHoverEffectCSS(hover: HoverEffectConfig): string {
    let css = '';
    if (hover.transform) css += `transform: ${hover.transform};`;
    if (hover.shadow) css += `box-shadow: ${hover.shadow};`;
    if (hover.background) css += `background: ${hover.background};`;
    if (hover.transition) css += `transition: ${hover.transition};`;
    if (hover.scale) css += `transform: scale(${hover.scale});`;
    return css;
  }

  /**
   * Gera CSS para estilo de texto
   */
  private generateTextStyleCSS(textStyle: any): string {
    let css = '';
    if (textStyle.fontSize) css += `font-size: ${textStyle.fontSize};`;
    if (textStyle.fontWeight) css += `font-weight: ${textStyle.fontWeight};`;
    if (textStyle.color) css += `color: ${textStyle.color};`;
    if (textStyle.lineHeight) css += `line-height: ${textStyle.lineHeight};`;
    if (textStyle.letterSpacing) css += `letter-spacing: ${textStyle.letterSpacing};`;
    if (textStyle.textTransform) css += `text-transform: ${textStyle.textTransform};`;
    return css;
  }

  /**
   * Aplica CSS customizado
   */
  private applyCustomCSS(customCSS: string): void {
    this.injectStyleSheet('custom-css', customCSS);
  }

  /**
   * Injeta folha de estilo no DOM
   */
  private injectStyleSheet(id: string, css: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove estilo anterior se existir
    if (this.styleSheets.has(id)) {
      const oldStyle = this.styleSheets.get(id);
      oldStyle?.remove();
    }

    // Cria novo elemento style
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.textContent = css;
    
    // Adiciona ao head
    document.head.appendChild(styleElement);
    
    // Armazena referência
    this.styleSheets.set(id, styleElement);
    this.appliedStyles.add(id);

    console.log(`[DynamicStylesService] Applied style: ${id}`);
  }

  /**
   * Remove todos os estilos aplicados
   */
  clearStyles(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.styleSheets.forEach((styleElement, id) => {
      styleElement.remove();
      console.log(`[DynamicStylesService] Removed style: ${id}`);
    });

    this.styleSheets.clear();
    this.appliedStyles.clear();
  }

  /**
   * Atualiza estado interno
   */
  private updateState(updates: Partial<DynamicStylesState>): void {
    this._state.update(current => ({ ...current, ...updates }));
  }

  /**
   * Obtém configuração atual
   */
  getCurrentConfig(): DynamicStylesResponse | null {
    return this._state().currentConfig;
  }

  /**
   * Verifica se estilos estão carregados
   */
  isStylesLoaded(): boolean {
    return this._state().isLoaded;
  }

  // ============= NOVOS MÉTODOS PARA INTEGRAÇÃO COM BACKEND =============

  /**
   * Carrega apenas as cores globais do backend
   */
  loadColors(subdomain?: string): Observable<Map<string, Object> | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/colors/${targetSubdomain}`;
    
    console.log(`[DynamicStylesService] Loading colors from: ${url}`);
    
    return this.http.get<Map<string, Object>>(url).pipe(
      tap(colors => {
        console.log(`[DynamicStylesService] Loaded colors for: ${targetSubdomain}`, colors);
        // Aplicar apenas as cores
        if (colors) {
          this.applyGlobalTheme(colors);
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to load colors for ${targetSubdomain}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Atualiza cores globais no backend
   */
  updateColors(colors: Map<string, Object>, subdomain?: string): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/colors/${targetSubdomain}`;
    
    console.log(`[DynamicStylesService] Updating colors for: ${targetSubdomain}`, colors);
    
    return this.http.put<DynamicStylesResponse>(url, colors).pipe(
      tap(response => {
        console.log(`[DynamicStylesService] Colors updated successfully for: ${targetSubdomain}`);
        // Limpar cache para forçar reload
        this.clearCache(targetSubdomain);
        // Atualizar estado
        if (response) {
          this.updateState({
            currentConfig: response,
            lastUpdated: new Date()
          });
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to update colors for ${targetSubdomain}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Carrega configurações de shopping/e-commerce
   */
  loadShoppingStyles(subdomain?: string): Observable<Map<string, Object> | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/shopping-styles/${targetSubdomain}`;
    
    console.log(`[DynamicStylesService] Loading shopping styles from: ${url}`);
    
    return this.http.get<Map<string, Object>>(url).pipe(
      tap(shoppingStyles => {
        console.log(`[DynamicStylesService] Loaded shopping styles for: ${targetSubdomain}`, shoppingStyles);
        // Aplicar estilos de shopping
        if (shoppingStyles) {
          this.applyGlobalShopping(shoppingStyles as unknown as ShoppingConfig);
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to load shopping styles for ${targetSubdomain}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Atualiza configurações de shopping/e-commerce
   */
  updateShoppingStyles(shoppingStyles: Map<string, Object>, subdomain?: string): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/shopping-styles/${targetSubdomain}`;
    
    console.log(`[DynamicStylesService] Updating shopping styles for: ${targetSubdomain}`, shoppingStyles);
    
    return this.http.put<DynamicStylesResponse>(url, shoppingStyles).pipe(
      tap(response => {
        console.log(`[DynamicStylesService] Shopping styles updated successfully for: ${targetSubdomain}`);
        this.clearCache(targetSubdomain);
        if (response) {
          this.updateState({
            currentConfig: response,
            lastUpdated: new Date()
          });
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to update shopping styles for ${targetSubdomain}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Carrega configuração de componente específico
   */
  loadComponentStyles(componentName: string, subdomain?: string): Observable<Map<string, Object> | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/components/${targetSubdomain}/${componentName}`;
    
    console.log(`[DynamicStylesService] Loading component styles from: ${url}`);
    
    return this.http.get<Map<string, Object>>(url).pipe(
      tap(componentStyles => {
        console.log(`[DynamicStylesService] Loaded styles for component ${componentName}:`, componentStyles);
        // Aplicar estilos do componente
        if (componentStyles) {
          this.applyComponentStyleDirect(componentName, componentStyles);
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to load component styles for ${componentName}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Atualiza configuração de componente específico
   */
  updateComponentStyles(componentName: string, componentStyles: Map<string, Object>, subdomain?: string): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/components/${targetSubdomain}/${componentName}`;
    
    console.log(`[DynamicStylesService] Updating component styles for ${componentName}:`, componentStyles);
    
    return this.http.put<DynamicStylesResponse>(url, componentStyles).pipe(
      tap(response => {
        console.log(`[DynamicStylesService] Component styles updated successfully for: ${componentName}`);
        this.clearCache(targetSubdomain);
        if (response) {
          this.updateState({
            currentConfig: response,
            lastUpdated: new Date()
          });
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to update component styles for ${componentName}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Cria preview temporário de configurações
   */
  createPreview(previewConfig: Partial<DynamicStylesResponse>, subdomain?: string): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/preview/${targetSubdomain}`;
    
    console.log(`[DynamicStylesService] Creating preview for: ${targetSubdomain}`, previewConfig);
    
    return this.http.post<DynamicStylesResponse>(url, previewConfig).pipe(
      tap(previewResponse => {
        console.log(`[DynamicStylesService] Preview created for: ${targetSubdomain}`, previewResponse);
        // Aplicar estilos de preview (sem salvar no estado)
        if (previewResponse) {
          this.applyDynamicStyles(previewResponse);
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to create preview for ${targetSubdomain}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Salva configurações completas no backend
   */
  saveStyles(config: DynamicStylesResponse, subdomain?: string): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/styles/${targetSubdomain}`;
    
    console.log(`[DynamicStylesService] Saving styles for: ${targetSubdomain}`, config);
    
    return this.http.put<DynamicStylesResponse>(url, config).pipe(
      tap(response => {
        console.log(`[DynamicStylesService] Styles saved successfully for: ${targetSubdomain}`);
        this.clearCache(targetSubdomain);
        if (response) {
          this.updateState({
            currentConfig: response,
            lastUpdated: new Date()
          });
          this.applyDynamicStyles(response);
        }
      }),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to save styles for ${targetSubdomain}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Verifica se existe configuração ativa
   */
  checkActiveStyles(subdomain?: string): Observable<boolean> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    const url = `${this.baseApiUrl}/storefront/check/${targetSubdomain}`;
    
    return this.http.get<{hasActiveStyles: boolean}>(url).pipe(
      map(response => response.hasActiveStyles),
      catchError(error => {
        console.error(`[DynamicStylesService] Failed to check active styles for ${targetSubdomain}:`, error);
        return of(false);
      })
    );
  }

  // ============= MÉTODOS AUXILIARES =============

  /**
   * Limpa cache para um subdomínio específico
   */
  private clearCache(subdomain: string): void {
    const cacheKey = `styles_${subdomain}`;
    this.configCache.delete(cacheKey);
    console.log(`[DynamicStylesService] Cache cleared for: ${subdomain}`);
  }

  /**
   * Limpa todo o cache
   */
  clearAllCache(): void {
    this.configCache.clear();
    console.log('[DynamicStylesService] All cache cleared');
  }

  /**
   * Aplica estilos de componente diretamente
   */
  private applyComponentStyleDirect(componentName: string, componentStyles: any): void {
    const styleId = `dynamic-style-${componentName}`;
    
    let css = '';
    
    if (componentName === 'productCard') {
      css = this.generateProductCardCSS(componentStyles as ProductCardStyle);
    } else if (componentName === 'menu') {
      css = this.generateMenuCSS(componentStyles as MenuStyle);
    } else {
      css = this.generateGenericComponentCSS(componentStyles as ComponentStyle);
    }
    
    this.injectStyleSheet(styleId, css);
  }

  /**
   * Força reload de estilos
   */
  reloadStyles(subdomain?: string): Observable<DynamicStylesResponse | null> {
    const targetSubdomain = subdomain || this.currentSubdomain;
    this.clearCache(targetSubdomain);
    return this.loadStyles(targetSubdomain, false);
  }

  /**
   * Gera CSS para menu/navegação
   */
  private generateMenuCSS(config: MenuStyle): string {
    let css = `
      .menu, .navigation {
        ${this.generateBackgroundCSS(config.background)}
        ${config.border ? this.generateBorderCSS(config.border) : ''}
        ${config.borderRadius ? `border-radius: ${config.borderRadius};` : ''}
        ${config.padding ? `padding: ${config.padding};` : ''}
        ${config.shadow ? `box-shadow: ${config.shadow};` : ''}
        display: flex;
        flex-direction: ${config.layout.direction === 'vertical' ? 'column' : 'row'};
        align-items: center;
        justify-content: ${this.getJustifyContent(config.layout.alignment)};
        gap: ${config.layout.spacing};
        ${config.layout.height ? `height: ${config.layout.height};` : ''}
        ${config.layout.position ? `position: ${config.layout.position};` : ''}
      }
    `;

    // Items do menu
    css += `
      .menu-item, .nav-item {
        color: ${config.items.color};
        font-size: ${config.items.fontSize};
        font-weight: ${config.items.fontWeight};
        padding: ${config.items.padding};
        margin: ${config.items.margin};
        ${config.items.borderRadius ? `border-radius: ${config.items.borderRadius};` : ''}
        ${config.items.background ? `background: ${config.items.background};` : ''}
        text-decoration: none;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .menu-item:hover, .nav-item:hover {
        color: ${config.items.hoverColor};
        ${config.items.hoverBackground ? `background: ${config.items.hoverBackground};` : ''}
      }

      .menu-item:active, .nav-item:active,
      .menu-item.active, .nav-item.active {
        color: ${config.items.activeColor};
        ${config.items.activeBackground ? `background: ${config.items.activeBackground};` : ''}
      }
    `;

    // Ícones dos itens do menu
    if (config.items.icon) {
      css += `
        .menu-item .pi, .nav-item .pi,
        .menu-item .fa, .nav-item .fa,
        .menu-item [class*="icon"], .nav-item [class*="icon"] {
          color: ${config.items.icon.color};
          font-size: ${config.items.icon.size};
        }

        .menu-item:hover .pi, .nav-item:hover .pi,
        .menu-item:hover .fa, .nav-item:hover .fa,
        .menu-item:hover [class*="icon"], .nav-item:hover [class*="icon"] {
          color: ${config.items.icon.hoverColor || config.items.hoverColor};
        }
      `;
    }

    // Logo
    if (config.logo) {
      css += `
        .logo {
          ${config.logo.size ? `width: ${config.logo.size}; height: ${config.logo.size};` : ''}
          margin: ${config.logo.margin};
          align-self: ${config.logo.position === 'center' ? 'center' : 'flex-start'};
        }
      `;

      if (config.logo.text) {
        css += `
          .logo-text {
            color: ${config.logo.text.color};
            font-size: ${config.logo.text.fontSize};
            font-weight: ${config.logo.text.fontWeight};
            ${config.logo.text.fontFamily ? `font-family: ${config.logo.text.fontFamily};` : ''}
          }
        `;
      }
    }

    return css;
  }

  /**
   * Gera CSS para botões baseado na configuração
   */
  private generateButtonCSS(variant: string, config: any): string {
    return `
      .btn-${variant}, .p-button-${variant} {
        background: ${config.background};
        color: ${config.color};
        border: ${config.border};
        border-radius: ${config.borderRadius};
        padding: ${config.padding};
        font-size: ${config.fontSize};
        font-weight: ${config.fontWeight};
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .btn-${variant}:hover, .p-button-${variant}:hover {
        background: ${config.hover.background};
        color: ${config.hover.color};
        ${config.hover.border ? `border: ${config.hover.border};` : ''}
        ${config.hover.transform ? `transform: ${config.hover.transform};` : ''}
      }

      .btn-${variant}:active, .p-button-${variant}:active {
        background: ${config.active.background};
        color: ${config.active.color};
        ${config.active.transform ? `transform: ${config.active.transform};` : ''}
      }

      .btn-${variant}:disabled, .p-button-${variant}:disabled {
        background: ${config.disabled.background};
        color: ${config.disabled.color};
        opacity: ${config.disabled.opacity};
        cursor: not-allowed;
      }
    `;
  }

  /**
   * Processa valor de background
   */
  private processBackgroundValue(background: any): string {
    if (typeof background === 'string') {
      return background;
    }
    return this.generateBackgroundValue(background);
  }

  /**
   * Gera valor de background baseado na configuração
   */
  private generateBackgroundValue(bg: BackgroundConfig): string {
    switch (bg.type) {
      case 'solid':
        return bg.value;
      case 'gradient':
        return bg.value;
      case 'image':
        return `url(${bg.value})`;
      case 'pattern':
        return bg.value;
      default:
        return bg.value;
    }
  }

  /**
   * Converte alignment para justify-content CSS
   */
  private getJustifyContent(alignment: string): string {
    switch (alignment) {
      case 'left': return 'flex-start';
      case 'center': return 'center';
      case 'right': return 'flex-end';
      case 'space-between': return 'space-between';
      default: return 'flex-start';
    }
  }

  /**
   * Aplica configuração global de elementos de compra/carrinho
   */
  private applyGlobalShopping(shopping: ShoppingConfig): void {
    console.log('🛒 [DynamicStylesService] Applying global shopping styles:', shopping);
    const root = document.documentElement;
    
    // Definir CSS variables para ícones de carrinho
    if (shopping.cartIcon) {
      console.log('🎨 Setting cart icon colors:', shopping.cartIcon);
      root.style.setProperty('--cart-icon-color', shopping.cartIcon.color);
      root.style.setProperty('--cart-icon-hover-color', shopping.cartIcon.hoverColor);
      root.style.setProperty('--cart-icon-active-color', shopping.cartIcon.activeColor);
      root.style.setProperty('--cart-icon-size', shopping.cartIcon.size);
      if (shopping.cartIcon.background) root.style.setProperty('--cart-icon-background', shopping.cartIcon.background);
      if (shopping.cartIcon.hoverBackground) root.style.setProperty('--cart-icon-hover-background', shopping.cartIcon.hoverBackground);
      if (shopping.cartIcon.activeBackground) root.style.setProperty('--cart-icon-active-background', shopping.cartIcon.activeBackground);
      if (shopping.cartIcon.borderRadius) root.style.setProperty('--cart-icon-border-radius', shopping.cartIcon.borderRadius);
      if (shopping.cartIcon.padding) root.style.setProperty('--cart-icon-padding', shopping.cartIcon.padding);
      if (shopping.cartIcon.shadow) root.style.setProperty('--cart-icon-shadow', shopping.cartIcon.shadow);
      if (shopping.cartIcon.hoverShadow) root.style.setProperty('--cart-icon-hover-shadow', shopping.cartIcon.hoverShadow);
    }

    // Definir CSS variables para botões "Adicionar ao Carrinho"
    if (shopping.addToCartButton) {
      root.style.setProperty('--add-to-cart-background', shopping.addToCartButton.background);
      root.style.setProperty('--add-to-cart-color', shopping.addToCartButton.color);
      root.style.setProperty('--add-to-cart-hover-background', shopping.addToCartButton.hoverBackground);
      root.style.setProperty('--add-to-cart-hover-color', shopping.addToCartButton.hoverColor);
      root.style.setProperty('--add-to-cart-active-background', shopping.addToCartButton.activeBackground);
      root.style.setProperty('--add-to-cart-active-color', shopping.addToCartButton.activeColor);
      root.style.setProperty('--add-to-cart-border-radius', shopping.addToCartButton.borderRadius);
      root.style.setProperty('--add-to-cart-padding', shopping.addToCartButton.padding);
      root.style.setProperty('--add-to-cart-font-size', shopping.addToCartButton.fontSize);
      root.style.setProperty('--add-to-cart-font-weight', shopping.addToCartButton.fontWeight);
      if (shopping.addToCartButton.border) root.style.setProperty('--add-to-cart-border', shopping.addToCartButton.border);
      if (shopping.addToCartButton.shadow) root.style.setProperty('--add-to-cart-shadow', shopping.addToCartButton.shadow);
      if (shopping.addToCartButton.hoverShadow) root.style.setProperty('--add-to-cart-hover-shadow', shopping.addToCartButton.hoverShadow);
      if (shopping.addToCartButton.disabledBackground) root.style.setProperty('--add-to-cart-disabled-background', shopping.addToCartButton.disabledBackground);
      if (shopping.addToCartButton.disabledColor) root.style.setProperty('--add-to-cart-disabled-color', shopping.addToCartButton.disabledColor);
      
      // Ícones do botão
      if (shopping.addToCartButton.icon) {
        root.style.setProperty('--add-to-cart-icon-color', shopping.addToCartButton.icon.color);
        if (shopping.addToCartButton.icon.hoverColor) root.style.setProperty('--add-to-cart-icon-hover-color', shopping.addToCartButton.icon.hoverColor);
        if (shopping.addToCartButton.icon.size) root.style.setProperty('--add-to-cart-icon-size', shopping.addToCartButton.icon.size);
      }
    }

    // Definir CSS variables para badge do carrinho
    if (shopping.cartBadge) {
      root.style.setProperty('--cart-badge-background', shopping.cartBadge.background);
      root.style.setProperty('--cart-badge-color', shopping.cartBadge.color);
      root.style.setProperty('--cart-badge-font-size', shopping.cartBadge.fontSize);
      root.style.setProperty('--cart-badge-font-weight', shopping.cartBadge.fontWeight);
      root.style.setProperty('--cart-badge-border-radius', shopping.cartBadge.borderRadius);
      root.style.setProperty('--cart-badge-min-width', shopping.cartBadge.minWidth);
      root.style.setProperty('--cart-badge-padding', shopping.cartBadge.padding);
      root.style.setProperty('--cart-badge-top', shopping.cartBadge.position.top);
      root.style.setProperty('--cart-badge-right', shopping.cartBadge.position.right);
      if (shopping.cartBadge.animation) root.style.setProperty('--cart-badge-animation', shopping.cartBadge.animation);
    }

    // CSS para aplicar as variáveis aos elementos
    let css = `
      /* Ícones de carrinho - sincronizados entre menu e product cards */
      .pi-shopping-cart, .pi-shopping-bag,
      .cart-icon, .cart-btn .pi, .cart-button .pi,
      .header-actions .cart-btn i, 
      .product-card .cart-icon,
      .mobile-nav .cart-link i {
        color: var(--cart-icon-color) !important;
        font-size: var(--cart-icon-size) !important;
        ${shopping.cartIcon.background ? 'background: var(--cart-icon-background);' : ''}
        ${shopping.cartIcon.borderRadius ? 'border-radius: var(--cart-icon-border-radius);' : ''}
        ${shopping.cartIcon.padding ? 'padding: var(--cart-icon-padding);' : ''}
        ${shopping.cartIcon.shadow ? 'box-shadow: var(--cart-icon-shadow);' : ''}
        transition: all 0.3s ease;
      }

      .pi-shopping-cart:hover, .pi-shopping-bag:hover,
      .cart-icon:hover, .cart-btn:hover .pi, .cart-button:hover .pi,
      .header-actions .cart-btn:hover i,
      .product-card .cart-icon:hover,
      .mobile-nav .cart-link:hover i {
        color: var(--cart-icon-hover-color) !important;
        ${shopping.cartIcon.hoverBackground ? 'background: var(--cart-icon-hover-background);' : ''}
        ${shopping.cartIcon.hoverShadow ? 'box-shadow: var(--cart-icon-hover-shadow);' : ''}
      }

      .pi-shopping-cart:active, .pi-shopping-bag:active,
      .cart-icon:active, .cart-btn:active .pi, .cart-button:active .pi,
      .pi-shopping-cart.active, .pi-shopping-bag.active,
      .cart-icon.active, .cart-btn.active .pi, .cart-button.active .pi {
        color: var(--cart-icon-active-color) !important;
        ${shopping.cartIcon.activeBackground ? 'background: var(--cart-icon-active-background);' : ''}
      }

      /* Botões "Adicionar ao Carrinho" */
      .add-to-cart-btn, .btn-add-cart, .add-cart-button,
      .product-card .add-to-cart, .product-actions .add-cart {
        background: var(--add-to-cart-background) !important;
        color: var(--add-to-cart-color) !important;
        border-radius: var(--add-to-cart-border-radius) !important;
        padding: var(--add-to-cart-padding) !important;
        font-size: var(--add-to-cart-font-size) !important;
        font-weight: var(--add-to-cart-font-weight) !important;
        ${shopping.addToCartButton.border ? 'border: var(--add-to-cart-border) !important;' : 'border: none !important;'}
        ${shopping.addToCartButton.shadow ? 'box-shadow: var(--add-to-cart-shadow);' : ''}
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .add-to-cart-btn:hover, .btn-add-cart:hover, .add-cart-button:hover,
      .product-card .add-to-cart:hover, .product-actions .add-cart:hover {
        background: var(--add-to-cart-hover-background) !important;
        color: var(--add-to-cart-hover-color) !important;
        ${shopping.addToCartButton.hoverShadow ? 'box-shadow: var(--add-to-cart-hover-shadow);' : ''}
      }

      .add-to-cart-btn:active, .btn-add-cart:active, .add-cart-button:active,
      .product-card .add-to-cart:active, .product-actions .add-cart:active {
        background: var(--add-to-cart-active-background) !important;
        color: var(--add-to-cart-active-color) !important;
      }

      /* Ícones dos botões de adicionar ao carrinho */
      .add-to-cart-btn .pi, .btn-add-cart .pi, .add-cart-button .pi,
      .product-card .add-to-cart .pi, .product-actions .add-cart .pi {
        color: var(--add-to-cart-icon-color, var(--add-to-cart-color)) !important;
        ${shopping.addToCartButton.icon?.size ? 'font-size: var(--add-to-cart-icon-size) !important;' : ''}
      }

      .add-to-cart-btn:hover .pi, .btn-add-cart:hover .pi, .add-cart-button:hover .pi,
      .product-card .add-to-cart:hover .pi, .product-actions .add-cart:hover .pi {
        color: var(--add-to-cart-icon-hover-color, var(--add-to-cart-hover-color)) !important;
      }

      /* Badge/contador do carrinho */
      .cart-count, .cart-badge, .shopping-badge,
      .cart-btn .cart-count, .header-actions .cart-count {
        background: var(--cart-badge-background) !important;
        color: var(--cart-badge-color) !important;
        font-size: var(--cart-badge-font-size) !important;
        font-weight: var(--cart-badge-font-weight) !important;
        border-radius: var(--cart-badge-border-radius) !important;
        min-width: var(--cart-badge-min-width) !important;
        padding: var(--cart-badge-padding) !important;
        position: absolute;
        top: var(--cart-badge-top) !important;
        right: var(--cart-badge-right) !important;
        text-align: center;
        line-height: 1;
        ${shopping.cartBadge.animation ? 'animation: var(--cart-badge-animation);' : ''}
      }

      /* Elementos desabilitados */
      .add-to-cart-btn:disabled, .btn-add-cart:disabled, .add-cart-button:disabled,
      .product-card .add-to-cart:disabled, .product-actions .add-cart:disabled {
        background: var(--add-to-cart-disabled-background, #e0e0e0) !important;
        color: var(--add-to-cart-disabled-color, #9e9e9e) !important;
        cursor: not-allowed !important;
        opacity: 0.6;
      }
    `;

    // Aplicar CSS para elementos de checkout se configurado
    if (shopping.checkoutElements) {
      css += `
        /* Barra de progresso do checkout */
        .checkout-progress, .progress-bar {
          background: ${shopping.checkoutElements.progressBar.background};
        }
        
        .checkout-progress .active, .progress-bar .active {
          background: ${shopping.checkoutElements.progressBar.activeColor};
        }
        
        .checkout-progress .completed, .progress-bar .completed {
          background: ${shopping.checkoutElements.progressBar.completedColor};
        }

        /* Destaque de preços */
        .price-highlight, .total-price, .checkout-total {
          color: ${shopping.checkoutElements.priceHighlight.color} !important;
          ${shopping.checkoutElements.priceHighlight.backgroundColor ? `background-color: ${shopping.checkoutElements.priceHighlight.backgroundColor};` : ''}
          ${shopping.checkoutElements.priceHighlight.fontSize ? `font-size: ${shopping.checkoutElements.priceHighlight.fontSize};` : ''}
          ${shopping.checkoutElements.priceHighlight.fontWeight ? `font-weight: ${shopping.checkoutElements.priceHighlight.fontWeight};` : ''}
        }

        /* Badge de desconto */
        .discount-badge, .sale-badge, .promo-badge {
          background: ${shopping.checkoutElements.discountBadge.background} !important;
          color: ${shopping.checkoutElements.discountBadge.color} !important;
          ${shopping.checkoutElements.discountBadge.borderRadius ? `border-radius: ${shopping.checkoutElements.discountBadge.borderRadius};` : ''}
        }
      `;
    }

    // Aplicar botão "Comprar Agora" se configurado
    if (shopping.buyNowButton) {
      css += `
        .buy-now-btn, .btn-buy-now, .buy-now-button,
        .product-card .buy-now, .product-actions .buy-now {
          background: ${shopping.buyNowButton.background} !important;
          color: ${shopping.buyNowButton.color} !important;
          border-radius: ${shopping.buyNowButton.borderRadius} !important;
          padding: ${shopping.buyNowButton.padding} !important;
          font-size: ${shopping.buyNowButton.fontSize} !important;
          font-weight: ${shopping.buyNowButton.fontWeight} !important;
          ${shopping.buyNowButton.border ? `border: ${shopping.buyNowButton.border} !important;` : 'border: none !important;'}
          ${shopping.buyNowButton.shadow ? `box-shadow: ${shopping.buyNowButton.shadow};` : ''}
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .buy-now-btn:hover, .btn-buy-now:hover, .buy-now-button:hover,
        .product-card .buy-now:hover, .product-actions .buy-now:hover {
          background: ${shopping.buyNowButton.hoverBackground} !important;
          color: ${shopping.buyNowButton.hoverColor} !important;
          ${shopping.buyNowButton.hoverShadow ? `box-shadow: ${shopping.buyNowButton.hoverShadow};` : ''}
        }

        .buy-now-btn:active, .btn-buy-now:active, .buy-now-button:active,
        .product-card .buy-now:active, .product-actions .buy-now:active {
          background: ${shopping.buyNowButton.activeBackground} !important;
          color: ${shopping.buyNowButton.activeColor} !important;
        }
      `;
    }

    // Aplicar ícone de wishlist se configurado
    if (shopping.wishlistIcon) {
      css += `
        .wishlist-icon, .pi-heart, .favorite-icon,
        .product-card .wishlist, .product-actions .wishlist {
          color: ${shopping.wishlistIcon.color} !important;
          font-size: ${shopping.wishlistIcon.size} !important;
          ${shopping.wishlistIcon.background ? `background: ${shopping.wishlistIcon.background};` : ''}
          ${shopping.wishlistIcon.borderRadius ? `border-radius: ${shopping.wishlistIcon.borderRadius};` : ''}
          ${shopping.wishlistIcon.padding ? `padding: ${shopping.wishlistIcon.padding};` : ''}
          ${shopping.wishlistIcon.shadow ? `box-shadow: ${shopping.wishlistIcon.shadow};` : ''}
          transition: all 0.3s ease;
        }

        .wishlist-icon:hover, .pi-heart:hover, .favorite-icon:hover,
        .product-card .wishlist:hover, .product-actions .wishlist:hover {
          color: ${shopping.wishlistIcon.hoverColor} !important;
          ${shopping.wishlistIcon.hoverBackground ? `background: ${shopping.wishlistIcon.hoverBackground};` : ''}
          ${shopping.wishlistIcon.hoverShadow ? `box-shadow: ${shopping.wishlistIcon.hoverShadow};` : ''}
        }

        .wishlist-icon:active, .pi-heart:active, .favorite-icon:active,
        .wishlist-icon.active, .pi-heart.active, .favorite-icon.active {
          color: ${shopping.wishlistIcon.activeColor} !important;
          ${shopping.wishlistIcon.activeBackground ? `background: ${shopping.wishlistIcon.activeBackground};` : ''}
        }
      `;
    }

    this.injectStyleSheet('global-shopping', css);
    console.log('✅ [DynamicStylesService] Global shopping styles applied successfully!');
    console.log('📄 CSS applied:', css.substring(0, 500) + '...');
  }
}