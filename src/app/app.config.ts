import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config'; 
import Lara from '@primeng/themes/lara';

 export const appConfig: ApplicationConfig = {
   providers: [
     provideRouter(routes),
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
     })
   ]
 };
