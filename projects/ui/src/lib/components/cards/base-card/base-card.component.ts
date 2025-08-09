import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="base-card" 
         [ngClass]="cardClasses"
         (click)="onCardClick()">
      
      <!-- Header -->
      <div class="card-header" *ngIf="title || subtitle || showHeaderActions">
        <div class="card-header-content">
          <h3 class="card-title" *ngIf="title">{{ title }}</h3>
          <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="card-header-actions" *ngIf="showHeaderActions">
          <ng-content select="[slot=header-actions]"></ng-content>
        </div>
      </div>
      
      <!-- Image -->
      <div class="card-image-container" *ngIf="imageUrl">
        <img [src]="imageUrl" 
             [alt]="imageAlt || title || 'Card image'" 
             class="card-image"
             [ngClass]="imageClass">
        <div class="card-image-overlay" *ngIf="showImageOverlay">
          <ng-content select="[slot=image-overlay]"></ng-content>
        </div>
      </div>
      
      <!-- Content -->
      <div class="card-content" [ngClass]="contentClass">
        <ng-content></ng-content>
      </div>
      
      <!-- Footer -->
      <div class="card-footer" *ngIf="showFooter">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .base-card {
      background: var(--surface-card);
      border-radius: var(--border-radius);
      box-shadow: var(--card-shadow);
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid var(--surface-border);
    }

    .clickable {
      cursor: pointer;
    }

    .clickable:hover {
      transform: translateY(-2px);
      box-shadow: var(--card-shadow-hover);
    }

    .elevated {
      box-shadow: var(--card-shadow-elevated);
    }

    .compact {
      padding: 0.75rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem 1rem 0.5rem 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .card-header-content {
      flex: 1;
    }

    .card-title {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .card-subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .card-header-actions {
      margin-left: 1rem;
    }

    .card-image-container {
      position: relative;
      overflow: hidden;
    }

    .card-image {
      width: 100%;
      height: auto;
      display: block;
    }

    .card-image.cover {
      object-fit: cover;
      height: 200px;
    }

    .card-image.contain {
      object-fit: contain;
      height: 200px;
    }

    .card-image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .base-card:hover .card-image-overlay {
      opacity: 1;
    }

    .card-content {
      padding: 1rem;
    }

    .card-content.no-padding {
      padding: 0;
    }

    .card-content.compact {
      padding: 0.75rem;
    }

    .card-footer {
      padding: 0.75rem 1rem 1rem 1rem;
      border-top: 1px solid var(--surface-border);
      background: var(--surface-ground);
    }
  `]
})
export class BaseCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() imageUrl: string = '';
  @Input() imageAlt: string = '';
  @Input() clickable: boolean = false;
  @Input() elevated: boolean = false;
  @Input() compact: boolean = false;
  @Input() showHeaderActions: boolean = false;
  @Input() showImageOverlay: boolean = false;
  @Input() showFooter: boolean = false;
  @Input() cardClass: string = '';
  @Input() contentClass: string = '';
  @Input() imageClass: string = '';

  @Output() cardClick = new EventEmitter<void>();

  get cardClasses(): string {
    const classes = [];
    
    if (this.clickable) classes.push('clickable');
    if (this.elevated) classes.push('elevated');
    if (this.compact) classes.push('compact');
    if (this.cardClass) classes.push(this.cardClass);
    
    return classes.join(' ');
  }

  onCardClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}