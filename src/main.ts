import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Suppress Angular internal validation warnings in development
if (typeof (window as any)['ng'] !== 'undefined') {
  const ng = (window as any)['ng'];
  if (ng && ng.ɵassertType) {
    ng.ɵassertType = () => {};
  }
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
