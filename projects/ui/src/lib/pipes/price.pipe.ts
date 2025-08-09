import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = 'BRL', locale: string = 'pt-BR'): string {
    if (value == null || isNaN(value)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}