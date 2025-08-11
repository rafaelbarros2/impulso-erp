import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * RoleGuard restricts access to routes based on the current user's role.
 * Only users with one of the allowed roles will be allowed to activate the route.
 *
 * Usage:
 * ```ts
 * {
 *   path: 'theme',
 *   loadComponent: () => import('./features/settings/components/theme-settings/theme-settings.component').then(m => m.ThemeSettingsComponent),
 *   canActivate: [RoleGuard],
 *   data: { roles: ['Admin', 'Manager', 'Owner'] }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles: string[] = route.data['roles'] ?? [];
    const user = this.authService.getCurrentUser();

    // If no user or roles are configured, deny access
    if (!user || !user.role) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Normalize role names (case-insensitive comparison)
    const userRole = user.role.toLowerCase();
    const hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!hasAccess) {
      // Redirect unauthorized users to dashboard or another safe location
      this.router.navigate(['/dashboard']);
    }

    return hasAccess;
  }
}