import { inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

/**
 * Theme initializer factory function
 * This function loads the default theme during application bootstrap
 */
export function themeInitializerFactory(): () => Promise<void> {
  const themeService = inject(ThemeService);
  
  return async (): Promise<void> => {
    try {
      // Load the demo theme from assets
      await themeService.load('assets/theme.demo.json');
      console.log('Theme tokens loaded successfully');
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      // Don't throw to prevent app startup failure
      // The app can still run without theme tokens
    }
  };
}