import { Injectable, signal, computed } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationState {
  hasErrors: boolean;
  fieldErrors: Record<string, string>;
  generalErrors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  private validationState = signal<ValidationState>({
    hasErrors: false,
    fieldErrors: {},
    generalErrors: []
  });

  // Computed signals for reactive access
  public readonly hasErrors = computed(() => this.validationState().hasErrors);
  public readonly fieldErrors = computed(() => this.validationState().fieldErrors);
  public readonly generalErrors = computed(() => this.validationState().generalErrors);
  public readonly validationErrors = computed(() => this.validationState());

  /**
   * Applies server-side validation errors to a form
   */
  applyServerValidationErrors(form: FormGroup, fieldErrors: FieldError[], generalError?: string): void {
    const errors: Record<string, string> = {};
    const generalErrors: string[] = generalError ? [generalError] : [];

    // Clear existing server validation errors
    this.clearServerValidationErrors(form);

    // Apply field-specific errors
    fieldErrors.forEach(error => {
      const control = form.get(error.field);
      if (control) {
        // Add server validation error to the control
        const existingErrors = control.errors || {};
        control.setErrors({
          ...existingErrors,
          serverError: error.message
        });
        errors[error.field] = error.message;
      } else {
        // If field not found in form, treat as general error
        generalErrors.push(`${this.translateFieldName(error.field)}: ${error.message}`);
      }
    });

    // Update validation state
    this.validationState.set({
      hasErrors: fieldErrors.length > 0 || generalErrors.length > 0,
      fieldErrors: errors,
      generalErrors
    });
  }

  /**
   * Clears server-side validation errors from a form
   */
  clearServerValidationErrors(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors?.['serverError']) {
        const errors = { ...control.errors };
        delete errors['serverError'];
        control.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    });

    this.validationState.set({
      hasErrors: false,
      fieldErrors: {},
      generalErrors: []
    });
  }

  /**
   * Gets the error message for a specific form control
   */
  getFieldErrorMessage(control: AbstractControl | null, fieldName: string): string | null {
    if (!control || !control.errors) {
      return null;
    }

    // Check for server validation error first
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    // Handle client-side validation errors
    if (control.errors['required']) {
      return `${this.translateFieldName(fieldName)} é obrigatório`;
    }

    if (control.errors['email']) {
      return 'Email deve ter um formato válido';
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `${this.translateFieldName(fieldName)} deve ter pelo menos ${requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const requiredLength = control.errors['maxlength'].requiredLength;
      return `${this.translateFieldName(fieldName)} deve ter no máximo ${requiredLength} caracteres`;
    }

    if (control.errors['min']) {
      const min = control.errors['min'].min;
      return `${this.translateFieldName(fieldName)} deve ser maior que ${min}`;
    }

    if (control.errors['max']) {
      const max = control.errors['max'].max;
      return `${this.translateFieldName(fieldName)} deve ser menor que ${max}`;
    }

    if (control.errors['pattern']) {
      return `${this.translateFieldName(fieldName)} tem formato inválido`;
    }

    // Return the first error message if no specific handling
    const firstErrorKey = Object.keys(control.errors)[0];
    return control.errors[firstErrorKey]?.message || `${this.translateFieldName(fieldName)} é inválido`;
  }

  /**
   * Checks if a form control has errors and has been touched
   */
  hasFieldError(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Translates field names to Portuguese
   */
  private translateFieldName(fieldName: string): string {
    const translations: Record<string, string> = {
      'name': 'Nome',
      'email': 'Email',
      'phone': 'Telefone',
      'cpfCnpj': 'CPF/CNPJ',
      'address': 'Endereço',
      'city': 'Cidade',
      'state': 'Estado',
      'zipCode': 'CEP',
      'description': 'Descrição',
      'sku': 'SKU',
      'category': 'Categoria',
      'priceCost': 'Preço de Custo',
      'priceSale': 'Preço de Venda',
      'stockQuantity': 'Quantidade em Estoque',
      'minStock': 'Estoque Mínimo',
      'imageUrl': 'URL da Imagem',
      'clientId': 'Cliente',
      'productId': 'Produto',
      'quantity': 'Quantidade',
      'price': 'Preço',
      'total': 'Total',
      'status': 'Status',
      'orderDate': 'Data do Pedido'
    };

    return translations[fieldName] || fieldName;
  }

  /**
   * Validates all controls in a form and marks them as touched
   */
  validateAllFormFields(form: FormGroup): boolean {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
    return form.valid;
  }

  /**
   * Resets validation state
   */
  resetValidation(): void {
    this.validationState.set({
      hasErrors: false,
      fieldErrors: {},
      generalErrors: []
    });
  }
}