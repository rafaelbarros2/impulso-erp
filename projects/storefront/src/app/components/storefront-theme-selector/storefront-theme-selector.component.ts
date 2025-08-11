import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

/**
 * A simplified theme selector component.
 *
 * Displays buttons for available themes and applies the selected theme via ThemeService.
 */
@Component({
  selector: 'app-storefront-theme-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storefront-theme-selector.component.html',
  styleUrls: ['./storefront-theme-selector.component.scss']
})
export class StorefrontThemeSelectorComponent implements OnInit {
  /** List of theme names to present to the user */
  themes = ['minimal', 'classic', 'legacy'];
  
  /** Currently selected theme */
  currentTheme = signal<string>('minimal');

  constructor(private readonly themeService: ThemeService) {}
  
  ngOnInit() {
    // Get the current theme from the service
    this.currentTheme.set(this.themeService.currentName || 'minimal');
  }

  onSelectTheme(theme: string) {
    console.log(`[ThemeSelector] Applying theme: ${theme}`);
    this.currentTheme.set(theme);
    
    // Trigger the theme change using the service
    this.themeService.loadThemeName(theme).subscribe({
      next: () => {
        console.log(`[ThemeSelector] Theme ${theme} applied successfully`);
        console.log(`[ThemeSelector] Current theme name: ${this.themeService.currentName}`);
        console.log(`[ThemeSelector] Current theme URL: ${this.themeService.currentUrl}`);
      },
      error: (error) => {
        console.error('[ThemeSelector] Error applying theme:', error);
        // Reset current theme on error
        this.currentTheme.set(this.themeService.currentName || 'minimal');
      }
    });
  }
}
