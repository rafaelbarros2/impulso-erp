import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { LoadingService } from '../../../core/services/loading.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent, EMPTY_STATES } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-loading-demo',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DividerModule,
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">Loading States Demo</h1>
      
      <!-- Loading Controls -->
      <p-card class="mb-6">
        <ng-template pTemplate="header">
          <h2 class="text-xl font-semibold p-4">Controls</h2>
        </ng-template>
        
        <div class="flex flex-wrap gap-3">
          <p-button 
            label="Show Spinner" 
            (onClick)="showSpinner()" 
            severity="primary">
          </p-button>
          
          <p-button 
            label="Show Table Skeleton" 
            (onClick)="showTableSkeleton()" 
            severity="secondary">
          </p-button>
          
          <p-button 
            label="Show Dashboard Skeleton" 
            (onClick)="showDashboardSkeleton()" 
            severity="info">
          </p-button>
          
          <p-button 
            label="Show Form Skeleton" 
            (onClick)="showFormSkeleton()" 
            severity="help">
          </p-button>
          
          <p-button 
            label="Show Empty State" 
            (onClick)="showEmptyState()" 
            severity="warning">
          </p-button>
          
          <p-button 
            label="Show Error State" 
            (onClick)="showErrorState()" 
            severity="danger">
          </p-button>
          
          <p-button 
            label="Clear All" 
            (onClick)="clearAll()" 
            [outlined]="true">
          </p-button>
        </div>
      </p-card>

      <!-- Spinner Demo -->
      <p-card class="mb-6" *ngIf="showSpinnerDemo">
        <ng-template pTemplate="header">
          <h3 class="text-lg font-semibold p-4">Loading Spinner</h3>
        </ng-template>
        
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <span>Inline Spinner:</span>
            <app-loading-spinner 
              [visible]="true" 
              size="1.5rem" 
              theme="primary">
            </app-loading-spinner>
          </div>
          
          <div class="relative h-32 border-2 border-dashed border-gray-300 rounded">
            <span class="absolute top-2 left-2 text-sm text-gray-500">Container with centered spinner</span>
            <app-loading-spinner 
              [visible]="true" 
              [center]="true" 
              text="Loading data..." 
              theme="primary">
            </app-loading-spinner>
          </div>
        </div>
      </p-card>

      <!-- Skeleton Demo -->
      <p-card class="mb-6" *ngIf="showSkeletonDemo">
        <ng-template pTemplate="header">
          <h3 class="text-lg font-semibold p-4">{{ skeletonType }} Skeleton</h3>
        </ng-template>
        
        <app-skeleton-loader 
          [type]="skeletonType" 
          [visible]="true"
          [rows]="skeletonType === 'table' ? 5 : 3"
          [columns]="skeletonType === 'table' ? 4 : 3"
          [lines]="skeletonType === 'text' ? 4 : 3"
          [fields]="skeletonType === 'form' ? 5 : 3"
          [cards]="skeletonType === 'dashboard' ? 4 : 3">
        </app-skeleton-loader>
      </p-card>

      <!-- Empty State Demo -->
      <p-card class="mb-6" *ngIf="showEmptyStateDemo">
        <ng-template pTemplate="header">
          <h3 class="text-lg font-semibold p-4">Empty State</h3>
        </ng-template>
        
        <app-empty-state
          [title]="emptyState.title"
          [description]="emptyState.description"
          [icon]="emptyState.icon"
          [theme]="emptyState.theme"
          [actionLabel]="emptyState.actionLabel"
          [actionIcon]="emptyState.actionIcon"
          (action)="onEmptyStateAction()">
        </app-empty-state>
      </p-card>

      <!-- Error State Demo -->
      <p-card class="mb-6" *ngIf="showErrorStateDemo">
        <ng-template pTemplate="header">
          <h3 class="text-lg font-semibold p-4">Error State</h3>
        </ng-template>
        
        <app-empty-state
          [title]="EMPTY_STATES.ERROR_STATE.title"
          [description]="EMPTY_STATES.ERROR_STATE.description"
          [icon]="EMPTY_STATES.ERROR_STATE.icon"
          [theme]="EMPTY_STATES.ERROR_STATE.theme"
          [actionLabel]="EMPTY_STATES.ERROR_STATE.actionLabel"
          [actionIcon]="EMPTY_STATES.ERROR_STATE.actionIcon"
          (action)="onErrorStateAction()">
        </app-empty-state>
      </p-card>

      <!-- Real Loading States Demo -->
      <p-card class="mb-6">
        <ng-template pTemplate="header">
          <h3 class="text-lg font-semibold p-4">Service-Connected Loading States</h3>
        </ng-template>
        
        <div class="flex flex-wrap gap-3 mb-4">
          <p-button 
            label="Start Products Loading" 
            (onClick)="startProductsLoading()" 
            severity="primary">
          </p-button>
          
          <p-button 
            label="Start Clients Loading" 
            (onClick)="startClientsLoading()" 
            severity="secondary">
          </p-button>
          
          <p-button 
            label="Start Dashboard Loading" 
            (onClick)="startDashboardLoading()" 
            severity="info">
          </p-button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border rounded p-4">
            <h4 class="font-semibold mb-2">Products</h4>
            <app-loading-spinner 
              [loadingKey]="LOADING_KEYS.PRODUCTS" 
              text="Loading products..." 
              [center]="true"
              sizeVariant="sm">
            </app-loading-spinner>
            <div *ngIf="!loadingService.isLoading(LOADING_KEYS.PRODUCTS)" class="text-center text-gray-500">
              Not loading
            </div>
          </div>
          
          <div class="border rounded p-4">
            <h4 class="font-semibold mb-2">Clients</h4>
            <app-loading-spinner 
              [loadingKey]="LOADING_KEYS.CLIENTS" 
              text="Loading clients..." 
              [center]="true"
              sizeVariant="sm">
            </app-loading-spinner>
            <div *ngIf="!loadingService.isLoading(LOADING_KEYS.CLIENTS)" class="text-center text-gray-500">
              Not loading
            </div>
          </div>
          
          <div class="border rounded p-4">
            <h4 class="font-semibold mb-2">Dashboard</h4>
            <app-loading-spinner 
              [loadingKey]="LOADING_KEYS.DASHBOARD" 
              text="Loading dashboard..." 
              [center]="true"
              sizeVariant="sm">
            </app-loading-spinner>
            <div *ngIf="!loadingService.isLoading(LOADING_KEYS.DASHBOARD)" class="text-center text-gray-500">
              Not loading
            </div>
          </div>
        </div>
      </p-card>

      <!-- Overlay Demo -->
      <p-card class="mb-6">
        <ng-template pTemplate="header">
          <h3 class="text-lg font-semibold p-4">Overlay Loading</h3>
        </ng-template>
        
        <div class="relative">
          <app-loading-spinner 
            [loadingKey]="'overlay-demo'" 
            [overlay]="true" 
            text="Processing..." 
            theme="primary">
          </app-loading-spinner>
          
          <p-button 
            label="Show Overlay Loading" 
            (onClick)="showOverlayLoading()" 
            severity="danger">
          </p-button>
          
          <p class="mt-4 text-gray-600">
            This demonstrates a full overlay loading state that blocks interaction with the content below.
          </p>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingDemoComponent {
  showSpinnerDemo = false;
  showSkeletonDemo = false;
  showEmptyStateDemo = false;
  showErrorStateDemo = false;
  
  skeletonType: 'table' | 'card' | 'list' | 'text' | 'form' | 'dashboard' = 'table';
  emptyState = EMPTY_STATES.NO_DATA;
  
  readonly LOADING_KEYS = LoadingService.KEYS;
  readonly EMPTY_STATES = EMPTY_STATES;

  constructor(public loadingService: LoadingService) {}

  showSpinner(): void {
    this.clearAllDemos();
    this.showSpinnerDemo = true;
  }

  showTableSkeleton(): void {
    this.clearAllDemos();
    this.skeletonType = 'table';
    this.showSkeletonDemo = true;
  }

  showDashboardSkeleton(): void {
    this.clearAllDemos();
    this.skeletonType = 'dashboard';
    this.showSkeletonDemo = true;
  }

  showFormSkeleton(): void {
    this.clearAllDemos();
    this.skeletonType = 'form';
    this.showSkeletonDemo = true;
  }

  showEmptyState(): void {
    this.clearAllDemos();
    this.emptyState = EMPTY_STATES.NO_PRODUCTS;
    this.showEmptyStateDemo = true;
  }

  showErrorState(): void {
    this.clearAllDemos();
    this.showErrorStateDemo = true;
  }

  clearAll(): void {
    this.clearAllDemos();
    this.loadingService.clearAll();
  }

  private clearAllDemos(): void {
    this.showSpinnerDemo = false;
    this.showSkeletonDemo = false;
    this.showEmptyStateDemo = false;
    this.showErrorStateDemo = false;
  }

  startProductsLoading(): void {
    this.loadingService.setLoading(this.LOADING_KEYS.PRODUCTS, true);
    setTimeout(() => {
      this.loadingService.setLoading(this.LOADING_KEYS.PRODUCTS, false);
    }, 3000);
  }

  startClientsLoading(): void {
    this.loadingService.setLoading(this.LOADING_KEYS.CLIENTS, true);
    setTimeout(() => {
      this.loadingService.setLoading(this.LOADING_KEYS.CLIENTS, false);
    }, 2500);
  }

  startDashboardLoading(): void {
    this.loadingService.setLoading(this.LOADING_KEYS.DASHBOARD, true);
    setTimeout(() => {
      this.loadingService.setLoading(this.LOADING_KEYS.DASHBOARD, false);
    }, 4000);
  }

  showOverlayLoading(): void {
    this.loadingService.setLoading('overlay-demo', true);
    setTimeout(() => {
      this.loadingService.setLoading('overlay-demo', false);
    }, 3000);
  }

  onEmptyStateAction(): void {
    console.log('Empty state action clicked');
  }

  onErrorStateAction(): void {
    console.log('Error state retry clicked');
  }
}