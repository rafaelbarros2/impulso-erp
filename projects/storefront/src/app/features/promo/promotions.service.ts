import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { Promotion } from '../../models/interfaces/promotion.interfaces';

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private http = inject(HttpClient);

  list(category?: string | null) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const url = `/api/ecommerce/promotions${params.toString() ? `?${params}` : ''}`;

    return this.http.get<Promotion[]>(url).pipe(
      catchError(() => {
        const mock: Promotion[] = [
          { id: 'p1', title: 'Vestido Floral', salePrice: 129.9, originalPrice: 199.9, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', categories: ['vestidos'], badge: 'OFERTA' },
          { id: 'p2', title: 'Tênis Street', salePrice: 199.9, originalPrice: 249.9, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', categories: ['calcados'] },
          { id: 'p3', title: 'Blusa Básica', salePrice: 49.9, image: 'https://images.unsplash.com/photo-1581044777550-4cfa6ce24c40?w=800', categories: ['blusas'] },
          { id: 'p4', title: 'Jeans Slim', salePrice: 159.9, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', categories: ['calcas'] }
        ];
        return of(mock);
      }),
      map(items => category ? items.filter(i => i.categories?.includes(category)) : items)
    );
  }
}
