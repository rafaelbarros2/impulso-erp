import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible()" class="skeleton-container" [ngClass]="containerClass">
      <!-- Table skeleton -->
      <div *ngIf="type === 'table'" class="skeleton-table">
        <div class="skeleton-table-header">
          <div *ngFor="let col of getColumnArray()" class="skeleton-table-header-cell"></div>
        </div>
        <div *ngFor="let row of getRowArray()" class="skeleton-table-row">
          <div *ngFor="let col of getColumnArray()" class="skeleton-table-cell"></div>
        </div>
      </div>

      <!-- Card skeleton -->
      <div *ngIf="type === 'card'" class="skeleton-card">
        <div class="skeleton-card-header" *ngIf="showHeader"></div>
        <div class="skeleton-card-content">
          <div *ngFor="let line of getLineArray()" class="skeleton-line" [ngClass]="'skeleton-line-' + (line % 3 + 1)"></div>
        </div>
      </div>

      <!-- List skeleton -->
      <div *ngIf="type === 'list'" class="skeleton-list">
        <div *ngFor="let item of getRowArray()" class="skeleton-list-item">
          <div class="skeleton-avatar" *ngIf="showAvatar"></div>
          <div class="skeleton-list-content">
            <div class="skeleton-line skeleton-line-1"></div>
            <div class="skeleton-line skeleton-line-2"></div>
          </div>
        </div>
      </div>

      <!-- Text skeleton -->
      <div *ngIf="type === 'text'" class="skeleton-text">
        <div *ngFor="let line of getLineArray()" class="skeleton-line" [ngClass]="'skeleton-line-' + (line % 3 + 1)"></div>
      </div>

      <!-- Form skeleton -->
      <div *ngIf="type === 'form'" class="skeleton-form">
        <div *ngFor="let field of getFieldArray()" class="skeleton-form-field">
          <div class="skeleton-label"></div>
          <div class="skeleton-input"></div>
        </div>
        <div class="skeleton-form-actions">
          <div class="skeleton-button"></div>
          <div class="skeleton-button skeleton-button-secondary"></div>
        </div>
      </div>

      <!-- Dashboard skeleton -->
      <div *ngIf="type === 'dashboard'" class="skeleton-dashboard">
        <div class="skeleton-dashboard-header">
          <div class="skeleton-line skeleton-line-1"></div>
          <div class="skeleton-line skeleton-line-2"></div>
        </div>
        <div class="skeleton-dashboard-cards">
          <div *ngFor="let card of getCardArray()" class="skeleton-dashboard-card">
            <div class="skeleton-dashboard-card-icon"></div>
            <div class="skeleton-dashboard-card-content">
              <div class="skeleton-line skeleton-line-1"></div>
              <div class="skeleton-line skeleton-line-2"></div>
            </div>
          </div>
        </div>
        <div class="skeleton-dashboard-chart"></div>
      </div>

      <!-- Custom skeleton -->
      <div *ngIf="type === 'custom'" class="skeleton-custom">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }

    .skeleton-base {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite linear;
      border-radius: 4px;
    }

    /* Table skeleton */
    .skeleton-table {
      width: 100%;
      border-collapse: collapse;
    }

    .skeleton-table-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .skeleton-table-header-cell {
      @extend .skeleton-base;
      height: 40px;
      flex: 1;
      border-radius: 6px;
    }

    .skeleton-table-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .skeleton-table-cell {
      @extend .skeleton-base;
      height: 60px;
      flex: 1;
      border-radius: 4px;
    }

    /* Card skeleton */
    .skeleton-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
    }

    .skeleton-card-header {
      @extend .skeleton-base;
      height: 60px;
      margin-bottom: 1rem;
      border-radius: 6px;
    }

    .skeleton-card-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* List skeleton */
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .skeleton-avatar {
      @extend .skeleton-base;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* Text skeleton */
    .skeleton-text {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton-line {
      @extend .skeleton-base;
      height: 20px;
      border-radius: 4px;
    }

    .skeleton-line-1 { width: 100%; }
    .skeleton-line-2 { width: 85%; }
    .skeleton-line-3 { width: 70%; }

    /* Form skeleton */
    .skeleton-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .skeleton-form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-label {
      @extend .skeleton-base;
      height: 20px;
      width: 30%;
      border-radius: 4px;
    }

    .skeleton-input {
      @extend .skeleton-base;
      height: 40px;
      width: 100%;
      border-radius: 6px;
    }

    .skeleton-form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .skeleton-button {
      @extend .skeleton-base;
      height: 40px;
      width: 120px;
      border-radius: 6px;
    }

    .skeleton-button-secondary {
      width: 100px;
    }

    /* Dashboard skeleton */
    .skeleton-dashboard {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .skeleton-dashboard-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .skeleton-dashboard-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .skeleton-dashboard-card-icon {
      @extend .skeleton-base;
      width: 50px;
      height: 50px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .skeleton-dashboard-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-dashboard-chart {
      @extend .skeleton-base;
      height: 300px;
      border-radius: 8px;
    }

    /* Apply shimmer animation to all skeleton elements */
    .skeleton-base,
    .skeleton-table-header-cell,
    .skeleton-table-cell,
    .skeleton-card-header,
    .skeleton-line,
    .skeleton-avatar,
    .skeleton-label,
    .skeleton-input,
    .skeleton-button,
    .skeleton-dashboard-card-icon,
    .skeleton-dashboard-chart {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite linear;
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .skeleton-base,
      .skeleton-table-header-cell,
      .skeleton-table-cell,
      .skeleton-card-header,
      .skeleton-line,
      .skeleton-avatar,
      .skeleton-label,
      .skeleton-input,
      .skeleton-button,
      .skeleton-dashboard-card-icon,
      .skeleton-dashboard-chart {
        background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
        background-size: 200px 100%;
      }

      .skeleton-card,
      .skeleton-list-item,
      .skeleton-dashboard-card {
        border-color: #404040;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'card' | 'list' | 'text' | 'form' | 'dashboard' | 'custom' = 'text';
  @Input() rows: number = 3;
  @Input() columns: number = 4;
  @Input() lines: number = 3;
  @Input() fields: number = 4;
  @Input() cards: number = 4;
  @Input() showHeader: boolean = true;
  @Input() showAvatar: boolean = true;
  @Input() containerClass: string = '';
  
  // Integration with LoadingService
  @Input() loadingKey: string = '';
  @Input() visible: boolean | null = null;

  isVisible = computed(() => {
    if (this.visible !== null) {
      return this.visible;
    } else if (this.loadingKey) {
      return this.loadingService.getLoadingState(this.loadingKey)();
    } else {
      return true;
    }
  });

  constructor(private loadingService: LoadingService) {}

  getRowArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }

  getColumnArray(): number[] {
    return Array(this.columns).fill(0).map((_, i) => i);
  }

  getLineArray(): number[] {
    return Array(this.lines).fill(0).map((_, i) => i);
  }

  getFieldArray(): number[] {
    return Array(this.fields).fill(0).map((_, i) => i);
  }

  getCardArray(): number[] {
    return Array(this.cards).fill(0).map((_, i) => i);
  }
}