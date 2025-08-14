import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideThemeInitializer } from './initializers/theme.initializer';
import { CORE_STYLE_INIT } from './initializers/core-style.initializer';
import { initializeDynamicStyles } from './initializers/dynamic-styles.initializer';

// Register Portuguese locale data for pipes (pt and pt-BR)
registerLocaleData(localePt);
registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    provideThemeInitializer(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    CORE_STYLE_INIT,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDynamicStyles,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
