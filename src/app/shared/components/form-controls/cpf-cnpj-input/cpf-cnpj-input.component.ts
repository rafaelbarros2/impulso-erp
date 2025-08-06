import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { CustomValidators } from '../../../validators/custom-validators';

export interface ClientType {
  name: string;
  code: 'PF' | 'PJ';
}

@Component({
  selector: 'app-cpf-cnpj-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputMaskModule, DropdownModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CpfCnpjInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CpfCnpjInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="cpf-cnpj-input-container">
      <!-- Seletor de tipo (se habilitado) -->
      <div class="type-selector" *ngIf="showTypeSelector">
        <p-dropdown 
          [options]="clientTypes"
          optionLabel="name"
          optionValue="code"
          [ngModel]="currentType"
          (ngModelChange)="onTypeChange($event)"
          placeholder="Tipo de documento"
          styleClass="w-full">
        </p-dropdown>
      </div>

      <!-- Input com máscara -->
      <div class="document-input">
        <label [for]="inputId" class="form-label" *ngIf="label">
          {{ label }}
          <span class="required-asterisk" *ngIf="required">*</span>
        </label>
        
        <p-inputMask
          [id]="inputId"
          [mask]="currentMask"
          [ngModel]="value"
          (ngModelChange)="onInputChange($event)"
          [placeholder]="currentPlaceholder"
          [disabled]="disabled"
          [readonly]="readonly"
          styleClass="w-full"
          [ngClass]="{
            'ng-invalid ng-dirty': hasError && touched,
            'ng-valid': !hasError && touched
          }"
          (blur)="onBlur()"
          (focus)="onFocus()">
        </p-inputMask>

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
      </div>
    </div>
  `,
  styles: [`
    .cpf-cnpj-input-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .type-selector {
      max-width: 200px;
    }

    .document-input {
      flex: 1;
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
      margin-top: 0.25rem;
    }

    :host ::ng-deep .p-inputmask.ng-invalid.ng-dirty {
      border-color: var(--red-500);
    }

    :host ::ng-deep .p-inputmask.ng-valid {
      border-color: var(--green-500);
    }
  `]
})
export class CpfCnpjInputComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() helpText: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showTypeSelector: boolean = true;
  @Input() initialType: 'PF' | 'PJ' = 'PF';

  clientTypes: ClientType[] = [
    { name: 'Pessoa Física', code: 'PF' },
    { name: 'Pessoa Jurídica', code: 'PJ' }
  ];

  currentType: 'PF' | 'PJ' = 'PF';
  value: string = '';
  touched: boolean = false;
  inputId: string = '';

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    this.inputId = `cpf-cnpj-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit(): void {
    this.currentType = this.initialType;
  }

  get currentMask(): string {
    return this.currentType === 'PF' ? '999.999.999-99' : '99.999.999/9999-99';
  }

  get currentPlaceholder(): string {
    if (this.placeholder) return this.placeholder;
    return this.currentType === 'PF' ? '000.000.000-00' : '00.000.000/0000-00';
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
      if (validation['cpf']) {
        errors.push(validation['cpf'].message || 'CPF inválido');
      }
      if (validation['cnpj']) {
        errors.push(validation['cnpj'].message || 'CNPJ inválido');
      }
    }
    
    return errors;
  }

  writeValue(value: any): void {
    this.value = value || '';
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
    if (this.required && (!this.value || this.value.trim() === '')) {
      return { required: true };
    }

    if (this.value && this.value.trim() !== '') {
      if (this.currentType === 'PF') {
        const cpfValidator = CustomValidators.cpf();
        return cpfValidator({ value: this.value } as any);
      } else {
        const cnpjValidator = CustomValidators.cnpj();
        return cnpjValidator({ value: this.value } as any);
      }
    }

    return null;
  }

  onTypeChange(newType: 'PF' | 'PJ'): void {
    if (newType !== this.currentType) {
      this.currentType = newType;
      // Limpa o valor quando muda o tipo
      this.value = '';
      this.onChange(this.value);
    }
  }

  onInputChange(newValue: string): void {
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

  getDocumentType(): 'PF' | 'PJ' {
    return this.currentType;
  }

  isValid(): boolean {
    return !this.hasError;
  }
}