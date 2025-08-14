import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFilter } from '../../models/dynamic-filters.models';
import { DynamicFiltersService } from '../../services/dynamic-filters.service';

@Component({
  selector: 'app-dynamic-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6" *ngIf="filter.isVisible">
      <h4 class="font-medium mb-2">{{ filter.label }}</h4>
      
      <!-- Filtro de Checkbox/Lista -->
      <div *ngIf="filter.type === 'checkbox'" class="space-y-2 max-h-40 overflow-y-auto">
        <label *ngFor="let option of filter.options" class="flex items-center gap-2 text-sm">
          <input 
            type="checkbox"
            [checked]="filter.selectedValues.includes(option.value)"
            (change)="toggleOption(option.value)"
            class="rounded border-gray-300">
          <span>{{ option.label }}</span>
          <span *ngIf="option.count" class="text-gray-500 ml-auto">({{ option.count }})</span>
        </label>
      </div>

      <!-- Filtro de Cores -->
      <div *ngIf="filter.type === 'color'" class="grid grid-cols-6 gap-2">
        <button 
          *ngFor="let option of filter.options"
          type="button"
          (click)="toggleOption(option.value)"
          [class]="getColorButtonClass(option.value)"
          [style.background-color]="getColorValue(option.value)"
          [attr.aria-label]="option.label" 
          [title]="option.label">
        </button>
      </div>

      <!-- Filtro de Tamanhos -->
      <div *ngIf="filter.type === 'size'" class="grid grid-cols-4 gap-2">
        <button 
          *ngFor="let option of filter.options"
          type="button"
          (click)="toggleOption(option.value)"
          [ngClass]="getSizeButtonClass(option.value)">
          {{ option.value }}
        </button>
      </div>

      <!-- Filtro Radio -->
      <div *ngIf="filter.type === 'radio'" class="space-y-2">
        <label *ngFor="let option of filter.options" class="flex items-center gap-2 text-sm">
          <input 
            type="radio"
            [name]="filter.name"
            [checked]="filter.selectedValues.includes(option.value)"
            (change)="selectSingleOption(option.value)"
            class="border-gray-300">
          <span>{{ option.label }}</span>
          <span *ngIf="option.count" class="text-gray-500 ml-auto">({{ option.count }})</span>
        </label>
      </div>
    </div>
  `
})
export class DynamicFilterComponent {
  @Input() filter!: DynamicFilter;
  @Output() filterChange = new EventEmitter<string[]>();
  
  private dynamicFiltersService = inject(DynamicFiltersService);

  toggleOption(value: string): void {
    const currentValues = [...this.filter.selectedValues];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    
    this.updateFilter(currentValues);
  }

  selectSingleOption(value: string): void {
    const newValues = this.filter.selectedValues.includes(value) ? [] : [value];
    this.updateFilter(newValues);
  }

  private updateFilter(selectedValues: string[]): void {
    this.filterChange.emit(selectedValues);
  }

  getColorButtonClass(value: string): string {
    const isSelected = this.filter.selectedValues.includes(value);
    const baseClass = 'w-10 h-10 rounded-full border-2 transition-transform';
    const selectedClass = 'ring-2 ring-blue-500 ring-offset-2 scale-110';
    const hoverClass = 'hover:scale-110';
    
    return `${baseClass} ${isSelected ? selectedClass : hoverClass}`;
  }

  getSizeButtonClass(value: string): string {
    const isSelected = this.filter.selectedValues.includes(value);
    const baseClass = 'py-2 px-3 border rounded-lg text-sm transition-colors';
    const selectedClass = 'bg-blue-600 text-white border-blue-600';
    const unselectedClass = 'border-gray-300 hover:bg-blue-50';
    
    return `${baseClass} ${isSelected ? selectedClass : unselectedClass}`;
  }

  getColorValue(value: string): string {
    const colorMapping = this.dynamicFiltersService.getColorMapping(this.filter.name);
    return colorMapping?.[value.toLowerCase()] || value;
  }
}