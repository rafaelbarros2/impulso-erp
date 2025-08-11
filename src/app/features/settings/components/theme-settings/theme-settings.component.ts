import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

import { ThemePreviewService, ThemeConfig } from '../../../../core/services/theme-preview.service';

/**
 * ThemeSettingsComponent provides a simple interface for owners/managers
 * to customise the storefront colours. It previews changes in real time
 * using ThemePreviewService. Persisting changes to a backend or
 * configuration store is out of scope for this component and should
 * be handled by a separate service.
 */
@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule],
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.scss']
})
export class ThemeSettingsComponent implements OnInit {
  /**
   * Holds the editable theme values. Defaults are provided to give
   * immediate feedback when the component loads.
   */
  theme: ThemeConfig = {
    name: 'Custom Store Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b'
    }
  };

  isSaving = false;

  constructor(private themePreviewService: ThemePreviewService) {}

  ngOnInit(): void {
    // Apply the default values on initialisation for immediate preview.
    this.themePreviewService.applyTheme(this.theme);
  }

  /**
   * Applies the theme preview whenever a colour input changes.
   */
  preview(): void {
    this.themePreviewService.applyTheme(this.theme);
  }

  /**
   * Handler for persisting the theme configuration. In a real system,
   * this method would call an API to save the configuration for the
   * current store. Here we just log to console to show intent.
   */
  save(): void {
    this.isSaving = true;
    try {
      // TODO: call API to persist theme
      console.log('[ThemeSettings] Saving theme configuration', this.theme);
      // You could also emit an event or call a service to save
    } finally {
      this.isSaving = false;
    }
  }
}