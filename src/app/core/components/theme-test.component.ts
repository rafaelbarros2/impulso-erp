import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-test-container">
      <h2>Theme Tokens Test</h2>
      <p>This component demonstrates the loaded theme tokens as CSS variables.</p>
      
      <div class="color-grid">
        <div class="color-box primary" title="Primary 500">Primary</div>
        <div class="color-box secondary" title="Secondary 500">Secondary</div>
        <div class="color-box success" title="Success 500">Success</div>
        <div class="color-box warning" title="Warning 500">Warning</div>
        <div class="color-box error" title="Error 500">Error</div>
        <div class="color-box info" title="Info 500">Info</div>
      </div>
      
      <div class="spacing-demo">
        <div class="spaced-item">Spacing 2</div>
        <div class="spaced-item">Spacing 4</div>
        <div class="spaced-item">Spacing 8</div>
      </div>
      
      <div class="component-demo">
        <button class="demo-button-sm">Small Button</button>
        <button class="demo-button-md">Medium Button</button>
        <button class="demo-button-lg">Large Button</button>
      </div>
      
      <div class="debug-info">
        <h3>Current Token Values:</h3>
        <pre>{{ getDebugInfo() }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .theme-test-container {
      padding: var(--spacing-8, 2rem);
      font-family: var(--font-family-sans, system-ui);
      background: var(--color-surface-background, #fff);
      color: var(--color-surface-foreground, #000);
      border-radius: var(--radius-lg, 0.5rem);
      border: var(--component-card-borderWidth, 1px) solid var(--color-surface-border, #e2e8f0);
      margin: var(--spacing-4, 1rem);
    }
    
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--spacing-4, 1rem);
      margin: var(--spacing-6, 1.5rem) 0;
    }
    
    .color-box {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-weight-medium, 500);
      border-radius: var(--radius-md, 0.375rem);
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    .color-box.primary { background: var(--color-primary-500, #0ea5e9); }
    .color-box.secondary { background: var(--color-secondary-500, #64748b); }
    .color-box.success { background: var(--color-success-500, #22c55e); }
    .color-box.warning { background: var(--color-warning-500, #f59e0b); }
    .color-box.error { background: var(--color-error-500, #ef4444); }
    .color-box.info { background: var(--color-info-500, #3b82f6); }
    
    .spacing-demo {
      margin: var(--spacing-6, 1.5rem) 0;
    }
    
    .spaced-item {
      background: var(--color-neutral-100, #f3f4f6);
      margin-bottom: var(--spacing-2, 0.5rem);
      border-radius: var(--radius-sm, 0.125rem);
    }
    
    .spaced-item:nth-child(1) { padding: var(--spacing-2, 0.5rem); }
    .spaced-item:nth-child(2) { padding: var(--spacing-4, 1rem); }
    .spaced-item:nth-child(3) { padding: var(--spacing-8, 2rem); }
    
    .component-demo {
      margin: var(--spacing-6, 1.5rem) 0;
      display: flex;
      gap: var(--spacing-4, 1rem);
      flex-wrap: wrap;
    }
    
    .demo-button-sm {
      height: var(--component-button-height-sm, 2rem);
      padding: var(--component-button-padding-sm, 0.5rem 0.75rem);
      font-size: var(--component-button-fontSize-sm, 0.875rem);
      background: var(--color-primary-500, #0ea5e9);
      color: white;
      border: none;
      border-radius: var(--radius-md, 0.375rem);
      cursor: pointer;
    }
    
    .demo-button-md {
      height: var(--component-button-height-md, 2.5rem);
      padding: var(--component-button-padding-md, 0.625rem 1rem);
      font-size: var(--component-button-fontSize-md, 1rem);
      background: var(--color-primary-500, #0ea5e9);
      color: white;
      border: none;
      border-radius: var(--radius-md, 0.375rem);
      cursor: pointer;
    }
    
    .demo-button-lg {
      height: var(--component-button-height-lg, 3rem);
      padding: var(--component-button-padding-lg, 0.75rem 1.25rem);
      font-size: var(--component-button-fontSize-lg, 1.125rem);
      background: var(--color-primary-500, #0ea5e9);
      color: white;
      border: none;
      border-radius: var(--radius-md, 0.375rem);
      cursor: pointer;
    }
    
    .debug-info {
      margin-top: var(--spacing-8, 2rem);
      padding: var(--spacing-4, 1rem);
      background: var(--color-neutral-50, #f9fafb);
      border-radius: var(--radius-md, 0.375rem);
      font-size: var(--font-size-sm, 0.875rem);
    }
    
    .debug-info h3 {
      margin-top: 0;
      color: var(--color-neutral-700, #374151);
    }
    
    .debug-info pre {
      margin: 0;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--color-neutral-600, #4b5563);
      white-space: pre-wrap;
      word-break: break-word;
    }
  `]
})
export class ThemeTestComponent implements OnInit {
  private themeService = inject(ThemeService);
  
  ngOnInit() {
    console.log('Theme Test Component initialized');
    console.log('Current tokens:', this.themeService.getCurrentTokens());
  }
  
  getDebugInfo(): string {
    const tokens = this.themeService.getCurrentTokens();
    if (!tokens) {
      return 'No theme tokens loaded';
    }
    
    return JSON.stringify({
      primaryColor: this.themeService.getTokenValue('color.primary.500'),
      successColor: this.themeService.getTokenValue('color.success.500'),
      buttonHeight: this.themeService.getTokenValue('component.button.height.md'),
      borderRadius: this.themeService.getTokenValue('radius.md'),
      spacing4: this.themeService.getTokenValue('spacing.4'),
      fontSize: this.themeService.getTokenValue('font.size.base')
    }, null, 2);
  }
}