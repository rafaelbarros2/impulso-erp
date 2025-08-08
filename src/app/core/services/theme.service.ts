import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ThemeTokens, ThemeValue, FlattenedTokens } from '../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private http = inject(HttpClient);
  private currentTokens: ThemeTokens | null = null;
  private readonly THEME_STYLE_ID = 'theme-tokens';

  /**
   * Load theme tokens from URL or object
   * @param urlOrTokens URL string or ThemeTokens object
   */
  async load(urlOrTokens: string | ThemeTokens): Promise<void> {
    try {
      let tokens: ThemeTokens;

      if (typeof urlOrTokens === 'string') {
        tokens = await this.http.get<ThemeTokens>(urlOrTokens).toPromise() as ThemeTokens;
      } else {
        tokens = urlOrTokens;
      }

      this.currentTokens = tokens;
      this.apply(tokens);
    } catch (error) {
      console.error('Failed to load theme tokens:', error);
      throw new Error(`Failed to load theme tokens: ${error}`);
    }
  }

  /**
   * Apply theme tokens by generating CSS variables and injecting them into <head>
   * @param tokens ThemeTokens object
   */
  apply(tokens: ThemeTokens): void {
    const flattenedTokens = this.flattenTokens(tokens);
    const cssVariables = this.generateCssVariables(flattenedTokens);
    this.injectStyles(cssVariables);
  }

  /**
   * Get current theme tokens
   */
  getCurrentTokens(): ThemeTokens | null {
    return this.currentTokens;
  }

  /**
   * Flatten nested theme tokens into a flat structure with dot notation
   * @param tokens ThemeTokens object
   * @param prefix Current prefix for recursion
   */
  private flattenTokens(tokens: any, prefix = ''): FlattenedTokens {
    const result: FlattenedTokens = {};

    for (const [key, value] of Object.entries(tokens)) {
      // Skip meta properties
      if (key.startsWith('$')) {
        continue;
      }

      const currentKey = prefix ? `${prefix}-${key}` : key;

      if (this.isThemeValue(value)) {
        // It's a design token with $value
        result[currentKey] = value.$value as string;
      } else if (typeof value === 'object' && value !== null) {
        // It's a nested object, recurse
        Object.assign(result, this.flattenTokens(value, currentKey));
      }
    }

    return result;
  }

  /**
   * Check if an object is a ThemeValue
   * @param obj Object to check
   */
  private isThemeValue(obj: any): obj is ThemeValue {
    return typeof obj === 'object' && obj !== null && '$value' in obj;
  }

  /**
   * Generate CSS variables from flattened tokens
   * @param flattenedTokens Flattened token object
   */
  private generateCssVariables(flattenedTokens: FlattenedTokens): string {
    const cssVars: string[] = [];

    for (const [key, value] of Object.entries(flattenedTokens)) {
      const cssVarName = `--${key.replace(/\./g, '-')}`;
      cssVars.push(`  ${cssVarName}: ${value};`);
    }

    return `:root {\n${cssVars.join('\n')}\n}`;
  }

  /**
   * Inject CSS styles into document head
   * @param css CSS content to inject
   */
  private injectStyles(css: string): void {
    // Remove existing theme styles
    const existingStyle = document.getElementById(this.THEME_STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = this.THEME_STYLE_ID;
    styleElement.textContent = css;

    // Insert at the beginning of head to allow overrides
    const head = document.head;
    if (head.firstChild) {
      head.insertBefore(styleElement, head.firstChild);
    } else {
      head.appendChild(styleElement);
    }
  }

  /**
   * Get a specific token value by path
   * @param path Token path (e.g., 'color.primary.500')
   */
  getTokenValue(path: string): string | null {
    if (!this.currentTokens) {
      return null;
    }

    const flattenedTokens = this.flattenTokens(this.currentTokens);
    const normalizedPath = path.replace(/\./g, '-');
    return flattenedTokens[normalizedPath] || null;
  }

  /**
   * Get CSS variable name for a token path
   * @param path Token path (e.g., 'color.primary.500')
   */
  getCssVariable(path: string): string {
    const normalizedPath = path.replace(/\./g, '-');
    return `var(--${normalizedPath})`;
  }

  /**
   * Update a specific token value and re-apply styles
   * @param path Token path
   * @param value New value
   */
  updateToken(path: string, value: string): void {
    if (!this.currentTokens) {
      console.warn('No theme tokens loaded');
      return;
    }

    // Navigate to the nested token and update its $value
    const pathParts = path.split('.');
    let current: any = this.currentTokens;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!(part in current)) {
        console.warn(`Token path not found: ${path}`);
        return;
      }
      current = current[part];
    }

    const finalKey = pathParts[pathParts.length - 1];
    if (!(finalKey in current)) {
      console.warn(`Token path not found: ${path}`);
      return;
    }

    if (this.isThemeValue(current[finalKey])) {
      current[finalKey].$value = value;
    } else {
      console.warn(`Invalid token structure at path: ${path}`);
      return;
    }

    // Re-apply the updated tokens
    this.apply(this.currentTokens);
  }
}