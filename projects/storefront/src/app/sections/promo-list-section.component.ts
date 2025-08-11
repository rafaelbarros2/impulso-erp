import { Component, Input } from '@angular/core';

@Component({
  selector: 'promo-list-section',
  standalone: true,
  template: `
    <section class="my-8">
      <h3 class="text-2xl font-bold mb-4">{{ title || 'Ofertas' }}</h3>
      <div class="p-4 border rounded text-gray-500">
        TODO: integrar lista de promoções (use o filtro recebido via postMessage).
      </div>
    </section>
  `
})
export class PromoListSectionComponent {
  @Input() title?: string;
}
