import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { CompanySettingsComponent } from '../../components/company-settings/company-settings.component';
import { UsersSettingsComponent } from '../../components/users-settings/users-settings.component';
import { PermissionsSettingsComponent } from '../../components/permissions-settings/permissions-settings.component';
import { SubsidiarySettingsComponent } from '../../components/subsidiary-settings/subsidiary-settings.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    CompanySettingsComponent,
    UsersSettingsComponent,
    PermissionsSettingsComponent,
    SubsidiarySettingsComponent
  ],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent {}