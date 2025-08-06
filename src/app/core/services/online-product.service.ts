import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface OnlineProduct {
  id?: number;
  productId: number;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  category?: string;
  featured?: boolean;
  active?: boolean;
  stock?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OnlineProductService extends BaseApiService {
  private endpoint = '/online-products';

  getAllOnlineProducts(): Observable<OnlineProduct[]> {
    return this.get<OnlineProduct[]>(this.endpoint);
  }

  getOnlineProductById(id: number): Observable<OnlineProduct> {
    return this.get<OnlineProduct>(`${this.endpoint}/${id}`);
  }

  createOnlineProduct(product: OnlineProduct): Observable<OnlineProduct> {
    return this.post<OnlineProduct>(this.endpoint, product);
  }

  updateOnlineProduct(id: number, product: OnlineProduct): Observable<OnlineProduct> {
    return this.put<OnlineProduct>(`${this.endpoint}/${id}`, product);
  }

  deleteOnlineProduct(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  getFeaturedProducts(): Observable<OnlineProduct[]> {
    return this.get<OnlineProduct[]>(`${this.endpoint}/featured`);
  }

  getProductsByCategory(category: string): Observable<OnlineProduct[]> {
    return this.get<OnlineProduct[]>(`${this.endpoint}/category/${category}`);
  }
}