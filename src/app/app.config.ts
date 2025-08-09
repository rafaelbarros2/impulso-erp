import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { routes } from './app.routes';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config'; 
import Lara from '@primeng/themes/lara';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
 

registerLocaleData(localePt);
 export const appConfig: ApplicationConfig = {
   providers: [
     provideRouter(routes),
     provideHttpClient(withInterceptorsFromDi()),
     importProvidersFrom([BrowserAnimationsModule]),
     providePrimeNG({
       theme: {
         preset: Lara,
         options: {
           prefix: 'p',
           darkModeSelector: '.my-app-dark',
           cssLayer: false
         }
       },
       ripple: true
     }),
     { provide: LOCALE_ID, useValue: 'pt-BR' },
     MessageService,
     { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
     { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
     { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ]
 };
