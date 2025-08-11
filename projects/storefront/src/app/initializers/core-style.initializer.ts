import { APP_INITIALIZER, Provider, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoreBackgroundService } from '../services/core/core-background.service';

// Executa só no browser para não quebrar SSR (sem 'document').
export function startCoreStylesFactory(platformId: Object) {
  return () => {
    if (isPlatformBrowser(platformId)) {
      const bg = inject(CoreBackgroundService);
      void bg; // tocar no service aplica as CSS vars atuais
    }
  };
}

export const CORE_STYLE_INIT: Provider = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: startCoreStylesFactory,
  deps: [PLATFORM_ID]
};
