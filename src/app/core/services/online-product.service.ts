import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { OnlineProduct } from '../models';

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