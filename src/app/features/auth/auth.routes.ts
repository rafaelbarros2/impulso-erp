import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LoginGuard } from '../../core/guards/login.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [LoginGuard]
  }
];