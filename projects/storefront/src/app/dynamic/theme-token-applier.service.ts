import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeTokens } from './section-registry';

@Injectable({ providedIn: 'root' })
export class ThemeTokenApplierService {
  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  apply(tokens: ThemeTokens): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement.style;
    
    console.log('[ThemeTokenApplier] Applying tokens:', tokens);
    
    if (tokens.colorPrimary600) {
      root.setProperty('--color-primary-600', tokens.colorPrimary600);
      console.log(`[ThemeTokenApplier] Set --color-primary-600: ${tokens.colorPrimary600}`);
    }
    if (tokens.colorPrimary700) {
      root.setProperty('--color-primary-700', tokens.colorPrimary700);
      console.log(`[ThemeTokenApplier] Set --color-primary-700: ${tokens.colorPrimary700}`);
    }
    if (tokens.heroText) {
      root.setProperty('--hero-text', tokens.heroText);
      console.log(`[ThemeTokenApplier] Set --hero-text: ${tokens.heroText}`);
    }
    if (tokens.heroOverlayOpacity) {
      root.setProperty('--hero-overlay-opacity', tokens.heroOverlayOpacity);
      console.log(`[ThemeTokenApplier] Set --hero-overlay-opacity: ${tokens.heroOverlayOpacity}`);
    }
    
    // Verificar se os valores foram aplicados
    const computedStyle = getComputedStyle(document.documentElement);
    console.log('[ThemeTokenApplier] Applied values check:');
    console.log(`  --color-primary-600: ${computedStyle.getPropertyValue('--color-primary-600')}`);
    console.log(`  --hero-text: ${computedStyle.getPropertyValue('--hero-text')}`);
    console.log(`  --hero-overlay-opacity: ${computedStyle.getPropertyValue('--hero-overlay-opacity')}`);
  }
}

