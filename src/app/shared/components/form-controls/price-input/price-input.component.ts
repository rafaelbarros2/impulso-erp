import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CustomValidators } from '../../../validators/custom-validators';

@Component({
  selector: 'app-price-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputNumberModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PriceInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PriceInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="price-input-container">
      <label [for]="inputId" class="form-label" *ngIf="label">
        {{ label }}
        <span class="required-asterisk" *ngIf="required">*</span>
      </label>

      <div class="input-wrapper">
        <p-inputNumber
          [id]="inputId"
          [ngModel]="value"
          (ngModelChange)="onInputChange($event)"
          [mode]="'currency'"
          [currency]="currency"
          [locale]="locale"
          [min]="minValue"
          [max]="maxValue"
          [minFractionDigits]="minFractionDigits"
          [maxFractionDigits]="maxFractionDigits"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [showButtons]="showButtons"
          [step]="step"
          styleClass="w-full"
          [ngClass]="{
            'ng-invalid ng-dirty': hasError && touched,
            'ng-valid': !hasError && touched && value !== null
          }"
          (onBlur)="onBlur()"
          (onFocus)="onFocus()">
        </p-inputNumber>

        <!-- Ícone de ajuda -->
        <i class="pi pi-info-circle help-icon" 
           *ngIf="helpText" 
           [title]="helpText">
        </i>
      </div>

      <!-- Mensagens de erro -->
      <div class="error-messages" *ngIf="hasError && touched">
        <small class="error-text" *ngFor="let error of errorMessages">
          {{ error }}
        </small>
      </div>

      <!-- Informações de ajuda -->
      <small class="help-text" *ngIf="helpText && !hasError">
        {{ helpText }}
      </small>

      <!-- Comparação de valores (útil para margem de lucro) -->
      <div class="value-comparison" *ngIf="compareValue !== null && value !== null && value > 0">
        <small class="comparison-text" [ngClass]="comparisonClass">
          <ng-container *ngIf="compareValue < value">
            <i class="pi pi-arrow-up"></i>
            Lucro: {{ formatCurrency(value - compareValue) }} 
            ({{ calculatePercentage() }}%)
          </ng-container>
          <ng-container *ngIf="compareValue > value">
            <i class="pi pi-arrow-down"></i>
            Prejuízo: {{ formatCurrency(compareValue - value) }} 
            ({{ calculatePercentage() }}%)
          </ng-container>
          <ng-container *ngIf="compareValue === value">
            <i class="pi pi-minus"></i>
            Sem margem
          </ng-container>
        </small>
      </div>
    </div>
  `,
  styles: [`
    .price-input-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .form-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.25rem;
      color: var(--text-color);
    }

    .required-asterisk {
      color: var(--red-500);
      margin-left: 0.25rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .help-icon {
      color: var(--text-color-secondary);
      cursor: help;
      font-size: 0.875rem;
    }

    .error-messages {
      margin-top: 0.25rem;
    }

    .error-text {
      display: block;
      color: var(--red-500);
      font-size: 0.75rem;
      margin-bottom: 0.125rem;
    }

    .help-text {
      display: block;
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    .value-comparison {
      margin-top: 0.25rem;
    }

    .comparison-text {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .comparison-text.profit {
      color: var(--green-600);
    }

    .comparison-text.loss {
      color: var(--red-600);
    }

    .comparison-text.neutral {
      color: var(--text-color-secondary);
    }

    :host ::ng-deep .p-inputnumber.ng-invalid.ng-dirty input {
      border-color: var(--red-500);
    }

    :host ::ng-deep .p-inputnumber.ng-valid input {
      border-color: var(--green-500);
    }

    :host ::ng-deep .p-inputnumber-buttons-horizontal .p-button {
      width: 2rem;
    }
  `]
})
export class PriceInputComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() helpText: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 999999.99;
  @Input() currency: string = 'BRL';
  @Input() locale: string = 'pt-BR';
  @Input() minFractionDigits: number = 2;
  @Input() maxFractionDigits: number = 2;
  @Input() showButtons: boolean = false;
  @Input() step: number = 0.01;
  @Input() compareValue: number | null = null; // Para comparar com preço de custo
  @Input() comparisonLabel: string = '';

  value: number | null = null;
  touched: boolean = false;
  inputId: string = '';

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    this.inputId = `price-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit(): void {
    // Inicialização adicional se necessária
  }

  get hasError(): boolean {
    return this.errorMessages.length > 0;
  }

  get errorMessages(): string[] {
    const errors: string[] = [];
    const validation = this.validate();
    
    if (validation) {
      if (validation['required']) {
        errors.push('Este campo é obrigatório');
      }
      if (validation['positiveNumber']) {
        errors.push(validation['positiveNumber'].message || 'Valor deve ser positivo');
      }
      if (validation['minValue']) {
        errors.push(validation['minValue'].message || `Valor mínimo: ${this.formatCurrency(this.minValue)}`);
      }
      if (validation['maxValue']) {
        errors.push(validation['maxValue'].message || `Valor máximo: ${this.formatCurrency(this.maxValue)}`);
      }
    }
    
    return errors;
  }

  get comparisonClass(): string {
    if (this.compareValue === null || this.value === null) return '';
    
    if (this.value > this.compareValue) return 'profit';
    if (this.value < this.compareValue) return 'loss';
    return 'neutral';
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(): ValidationErrors | null {
    if (this.required && (this.value === null || this.value === undefined)) {
      return { required: true };
    }

    if (this.value !== null && this.value !== undefined) {
      // Valida valor positivo
      const positiveValidator = CustomValidators.positiveNumber();
      const positiveResult = positiveValidator({ value: this.value } as any);
      if (positiveResult) return positiveResult;

      // Valida valor mínimo
      if (this.value < this.minValue) {
        const minValidator = CustomValidators.minValue(this.minValue);
        const minResult = minValidator({ value: this.value } as any);
        if (minResult) return minResult;
      }

      // Valida valor máximo
      if (this.value > this.maxValue) {
        const maxValidator = CustomValidators.maxValue(this.maxValue);
        const maxResult = maxValidator({ value: this.value } as any);
        if (maxResult) return maxResult;
      }
    }

    return null;
  }

  onInputChange(newValue: number | null): void {
    this.value = newValue;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  onFocus(): void {
    // Adiciona qualquer lógica específica de foco se necessário
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: this.minFractionDigits,
      maximumFractionDigits: this.maxFractionDigits
    }).format(value);
  }

  calculatePercentage(): string {
    if (this.compareValue === null || this.value === null || this.compareValue === 0) {
      return '0';
    }

    const percentage = Math.abs(((this.value - this.compareValue) / this.compareValue) * 100);
    return percentage.toFixed(1);
  }

  isValid(): boolean {
    return !this.hasError;
  }

  getValue(): number | null {
    return this.value;
  }

  getFormattedValue(): string {
    if (this.value === null || this.value === undefined) return '';
    return this.formatCurrency(this.value);
  }
}