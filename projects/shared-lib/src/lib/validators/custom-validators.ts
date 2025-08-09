import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  static cpf(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cpf = control.value.replace(/[^\d]/g, '');
      
      if (cpf.length !== 11) {
        return { cpf: { message: 'CPF deve ter 11 dígitos' } };
      }
      
      if (/^(\d)\1{10}$/.test(cpf)) {
        return { cpf: { message: 'CPF inválido' } };
      }
      
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) {
        return { cpf: { message: 'CPF inválido' } };
      }
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(10))) {
        return { cpf: { message: 'CPF inválido' } };
      }
      
      return null;
    };
  }

  static cnpj(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cnpj = control.value.replace(/[^\d]/g, '');
      
      if (cnpj.length !== 14) {
        return { cnpj: { message: 'CNPJ deve ter 14 dígitos' } };
      }
      
      if (/^(\d)\1{13}$/.test(cnpj)) {
        return { cnpj: { message: 'CNPJ inválido' } };
      }
      
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights1[i];
      }
      let remainder = sum % 11;
      const digit1 = remainder < 2 ? 0 : 11 - remainder;
      
      if (digit1 !== parseInt(cnpj.charAt(12))) {
        return { cnpj: { message: 'CNPJ inválido' } };
      }
      
      sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights2[i];
      }
      remainder = sum % 11;
      const digit2 = remainder < 2 ? 0 : 11 - remainder;
      
      if (digit2 !== parseInt(cnpj.charAt(13))) {
        return { cnpj: { message: 'CNPJ inválido' } };
      }
      
      return null;
    };
  }

  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const phone = control.value.replace(/[^\d]/g, '');
      
      if (phone.length < 10 || phone.length > 11) {
        return { phone: { message: 'Telefone deve ter 10 ou 11 dígitos' } };
      }
      
      return null;
    };
  }

  static positiveNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      
      const value = parseFloat(control.value);
      
      if (isNaN(value) || value <= 0) {
        return { positiveNumber: { message: 'Valor deve ser um número positivo' } };
      }
      
      return null;
    };
  }

  static minValue(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      
      const value = parseFloat(control.value);
      
      if (isNaN(value) || value < min) {
        return { minValue: { message: `Valor deve ser maior ou igual a ${min}` } };
      }
      
      return null;
    };
  }

  static maxValue(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      
      const value = parseFloat(control.value);
      
      if (isNaN(value) || value > max) {
        return { maxValue: { message: `Valor deve ser menor ou igual a ${max}` } };
      }
      
      return null;
    };
  }
}