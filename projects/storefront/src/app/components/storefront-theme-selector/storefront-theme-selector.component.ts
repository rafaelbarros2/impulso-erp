import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { DynamicStylesService } from '../../services/dynamic-styles.service';

/**
 * A comprehensive theme selector component with backend integration.
 *
 * Displays theme options and provides color customization with real-time preview.
 */
@Component({
  selector: 'app-storefront-theme-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storefront-theme-selector.component.html',
  styleUrls: ['./storefront-theme-selector.component.scss']
})
export class StorefrontThemeSelectorComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly dynamicStylesService = inject(DynamicStylesService);
  
  /** List of theme names to present to the user */
  themes = ['minimal', 'classic', 'legacy', 'demo'];
  
  /** Currently selected theme */
  currentTheme = signal<string>('demo');
  
  /** Current colors for editing */
  currentColors = signal<any>({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626'
  });
  
  /** Preview mode */
  isPreviewMode = signal<boolean>(false);
  
  /** Loading state */
  isLoading = signal<boolean>(false);
  
  /** Dynamic styles state */
  dynamicStylesState = this.dynamicStylesService.state;
  
  ngOnInit() {
    // Get the current theme from the service
    this.currentTheme.set(this.themeService.currentName || 'demo');
    
    // Load current styles from backend
    this.loadCurrentStyles();
  }

  onSelectTheme(theme: string) {
    console.log(`[ThemeSelector] Applying theme: ${theme}`);
    this.currentTheme.set(theme);
    this.isLoading.set(true);
    
    // Primeiro tenta carregar do backend
    this.dynamicStylesService.loadStyles().subscribe({
      next: (config) => {
        if (config) {
          console.log(`[ThemeSelector] Dynamic styles loaded successfully`);
          this.updateColorsFromConfig(config);
        } else {
          // Fallback para ThemeService tradicional
          this.fallbackToTraditionalTheme(theme);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.warn('[ThemeSelector] Failed to load dynamic styles, using traditional theme:', error);
        this.fallbackToTraditionalTheme(theme);
        this.isLoading.set(false);
      }
    });
  }
  
  private fallbackToTraditionalTheme(theme: string) {
    this.themeService.loadThemeName(theme).subscribe({
      next: () => {
        console.log(`[ThemeSelector] Traditional theme ${theme} applied successfully`);
      },
      error: (error) => {
        console.error('[ThemeSelector] Error applying theme:', error);
        this.currentTheme.set(this.themeService.currentName || 'demo');
      }
    });
  }
  
  private loadCurrentStyles() {
    this.dynamicStylesService.loadStyles().subscribe({
      next: (config) => {
        if (config) {
          this.updateColorsFromConfig(config);
        }
      },
      error: (error) => {
        console.warn('[ThemeSelector] Could not load current styles:', error);
      }
    });
  }
  
  private updateColorsFromConfig(config: any) {
    if (config.theme) {
      this.currentColors.set({
        primary: config.theme.primary || '#3B82F6',
        secondary: config.theme.secondary || '#10B981', 
        accent: config.theme.accent || '#F59E0B',
        success: config.theme.success || '#059669',
        warning: config.theme.warning || '#D97706',
        danger: config.theme.danger || '#DC2626'
      });
    }
  }
  
  /**
   * Atualiza uma cor específica
   */
  onColorChange(colorKey: string, newColor: string) {
    const updatedColors = { ...this.currentColors() };
    updatedColors[colorKey] = newColor;
    this.currentColors.set(updatedColors);
    
    if (this.isPreviewMode()) {
      this.previewColors(updatedColors);
    }
  }
  
  /**
   * Ativa/desativa modo preview
   */
  togglePreview() {
    const newPreviewMode = !this.isPreviewMode();
    this.isPreviewMode.set(newPreviewMode);
    
    if (newPreviewMode) {
      this.previewColors(this.currentColors());
    } else {
      // Recarregar estilos originais
      this.loadCurrentStyles();
    }
  }
  
  /**
   * Aplica preview das cores
   */
  private previewColors(colors: any) {
    const previewConfig = {
      theme: colors
    };
    
    this.dynamicStylesService.createPreview(previewConfig).subscribe({
      next: () => {
        console.log('[ThemeSelector] Preview applied successfully');
      },
      error: (error) => {
        console.error('[ThemeSelector] Error applying preview:', error);
      }
    });
  }
  
  /**
   * Salva as cores atuais no backend
   */
  saveColors() {
    this.isLoading.set(true);
    
    this.dynamicStylesService.updateColors(this.currentColors() as any).subscribe({
      next: (response) => {
        console.log('[ThemeSelector] Colors saved successfully:', response);
        this.isPreviewMode.set(false);
        this.isLoading.set(false);
        // Recarregar para aplicar mudanças salvas
        this.loadCurrentStyles();
      },
      error: (error) => {
        console.error('[ThemeSelector] Error saving colors:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  /**
   * Reseta para as cores padrão
   */
  resetToDefault() {
    const defaultColors = {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626'
    };
    
    this.currentColors.set(defaultColors);
    
    if (this.isPreviewMode()) {
      this.previewColors(defaultColors);
    }
  }
  
  /**
   * Recarrega estilos do servidor
   */
  reloadStyles() {
    this.isLoading.set(true);
    
    this.dynamicStylesService.reloadStyles().subscribe({
      next: (config) => {
        console.log('[ThemeSelector] Styles reloaded successfully');
        if (config) {
          this.updateColorsFromConfig(config);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[ThemeSelector] Error reloading styles:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Carrega cores específicas do backend
   */
  loadColorsOnly() {
    this.dynamicStylesService.loadColors().subscribe({
      next: (colors) => {
        if (colors) {
          console.log('[ThemeSelector] Colors loaded:', colors);
          this.currentColors.set(colors as any);
        }
      },
      error: (error) => {
        console.error('[ThemeSelector] Error loading colors:', error);
      }
    });
  }
  
  /**
   * Carrega estilos de shopping do backend
   */
  loadShoppingStyles() {
    this.dynamicStylesService.loadShoppingStyles().subscribe({
      next: (shoppingStyles) => {
        if (shoppingStyles) {
          console.log('[ThemeSelector] Shopping styles loaded:', shoppingStyles);
        }
      },
      error: (error) => {
        console.error('[ThemeSelector] Error loading shopping styles:', error);
      }
    });
  }

  /**
   * Verifica se há configurações ativas no backend
   */
  checkActiveStyles() {
    this.dynamicStylesService.checkActiveStyles().subscribe({
      next: (hasActive) => {
        console.log('[ThemeSelector] Has active styles:', hasActive);
      },
      error: (error) => {
        console.error('[ThemeSelector] Error checking active styles:', error);
      }
    });
  }
}