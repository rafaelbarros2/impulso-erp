import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { CompanySettingsComponent } from '../../components/company-settings/company-settings.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, TabViewModule, CompanySettingsComponent],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent {}