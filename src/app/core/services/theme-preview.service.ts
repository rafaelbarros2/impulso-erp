import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { PreviewThemeConfig } from '../models/theme.model';

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
  applyTheme(theme: PreviewThemeConfig): void {
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