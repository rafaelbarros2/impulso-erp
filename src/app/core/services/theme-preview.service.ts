import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

/**
 * Defines the shape of a theme configuration. This mirrors the theme
 * configuration used by the storefront but lives in the ERP to avoid
 * cross‑project coupling. You can extend this interface to include
 * additional tokens like spacing or typography as needed.
 */
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  // Additional groups (typography, spacing, borderRadius) could be
  // included here if you plan to expose them in the theme editor.
}

/**
 * ThemePreviewService applies a ThemeConfig by writing CSS custom properties
 * to the :root element. This service is intentionally decoupled from
 * persistence; it only handles the preview/apply side of theming.
 */
@Injectable({ providedIn: 'root' })
export class ThemePreviewService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Applies the provided theme by setting CSS variables on the root element.
   * Skips execution on the server.
   */
  applyTheme(theme: ThemeConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const root = this.document.documentElement;
    // Write each color token to a CSS custom property.
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
}