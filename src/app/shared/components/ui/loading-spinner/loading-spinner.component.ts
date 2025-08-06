import { Component, Input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible()" class="loading-spinner-container" [ngClass]="finalContainerClass">
      <div class="loading-spinner" [ngClass]="spinnerClass">
        <i class="pi pi-spin pi-spinner" [style.font-size]="size" [style.color]="color"></i>
      </div>
      <div class="loading-text" *ngIf="text" [ngClass]="textClass">
        {{ text }}
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      animation: fadeIn 0.2s ease-in;
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-text {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      text-align: center;
      animation: pulse 2s infinite;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .inline {
      position: relative;
    }

    .center {
      min-height: 200px;
    }

    .absolute {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .small {
      min-height: 100px;
    }

    .large {
      min-height: 300px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Size variants */
    .size-xs .loading-spinner i { font-size: 1rem !important; }
    .size-sm .loading-spinner i { font-size: 1.5rem !important; }
    .size-md .loading-spinner i { font-size: 2rem !important; }
    .size-lg .loading-spinner i { font-size: 3rem !important; }
    .size-xl .loading-spinner i { font-size: 4rem !important; }

    /* Theme variants */
    .theme-primary .loading-spinner i { color: var(--primary-color) !important; }
    .theme-secondary .loading-spinner i { color: var(--text-color-secondary) !important; }
    .theme-success .loading-spinner i { color: var(--green-500) !important; }
    .theme-warning .loading-spinner i { color: var(--yellow-500) !important; }
    .theme-danger .loading-spinner i { color: var(--red-500) !important; }
  `]
})
export class LoadingSpinnerComponent {
  @Input() text: string = '';
  @Input() size: string = '2rem';
  @Input() overlay: boolean = false;
  @Input() center: boolean = false;
  @Input() absolute: boolean = false;
  @Input() color: string = '';
  @Input() theme: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | '' = '';
  @Input() sizeVariant: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '' = '';
  @Input() containerClass: string = '';
  @Input() spinnerClass: string = '';
  @Input() textClass: string = '';
  
  // New inputs for integration with LoadingService
  @Input() loadingKey: string = '';
  @Input() visible: boolean | null = null; // null means use loadingKey, boolean overrides

  finalContainerClass: string = '';
  
  isVisible = computed(() => {
    if (this.visible !== null) {
      return this.visible;
    } else if (this.loadingKey) {
      return this.loadingService.getLoadingState(this.loadingKey)();
    } else {
      return true;
    }
  });

  constructor(private loadingService: LoadingService) {
    this.updateClasses();
  }

  private updateClasses(): void {
    const classes = [];
    
    // Position classes
    if (this.overlay) {
      classes.push('overlay');
    } else if (this.absolute) {
      classes.push('absolute');
    } else {
      classes.push('inline');
    }
    
    // Size classes
    if (this.center) {
      classes.push('center');
    } else if (this.center === false && this.size === '1rem') {
      classes.push('small');
    } else if (this.size === '3rem' || this.size === '4rem') {
      classes.push('large');
    }

    // Size variant classes
    if (this.sizeVariant) {
      classes.push(`size-${this.sizeVariant}`);
    }

    // Theme classes
    if (this.theme) {
      classes.push(`theme-${this.theme}`);
    }
    
    this.finalContainerClass = `${classes.join(' ')} ${this.containerClass}`.trim();
  }
}