import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { CompanySettingsComponent } from '../../components/company-settings/company-settings.component';
import { UsersSettingsComponent } from '../../components/users-settings/users-settings.component';
import { PermissionsSettingsComponent } from '../../components/permissions-settings/permissions-settings.component';
import { SubsidiarySettingsComponent } from '../../components/subsidiary-settings/subsidiary-settings.component';
import { ThemeSettingsComponent } from '../../components/theme-settings/theme-settings.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    CompanySettingsComponent,
    UsersSettingsComponent,
    PermissionsSettingsComponent,
    SubsidiarySettingsComponent,
    ThemeSettingsComponent
  ],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent {
  // Lazy injection of AuthService using inject() to avoid issues during SSR.
  private readonly authService = inject(AuthService);

  /**
   * Determines if the current user has permission to edit the storefront theme.
   * Only roles 'Admin', 'Manager' or 'Owner' are allowed.
   */
  canEditTheme(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || !user.role) {
      return false;
    }
    const role = user.role.toLowerCase();
    return role === 'admin' || role === 'manager' || role === 'owner';
  }
}