import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { CartItem, Cart, CheckoutRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService extends BaseApiService {
  private endpoint = '/cart';
  private checkoutEndpoint = '/checkout';

  getCart(): Observable<Cart> {
    return this.get<Cart>(this.endpoint);
  }

  addToCart(productId: number, quantity: number): Observable<Cart> {
    return this.post<Cart>(`${this.endpoint}/add`, { productId, quantity });
  }

  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    return this.put<Cart>(`${this.endpoint}/items/${itemId}`, { quantity });
  }

  removeFromCart(itemId: number): Observable<Cart> {
    return this.delete<Cart>(`${this.endpoint}/items/${itemId}`);
  }

  clearCart(): Observable<void> {
    return this.delete<void>(`${this.endpoint}/clear`);
  }

  checkout(checkoutData: CheckoutRequest): Observable<any> {
    return this.post<any>(this.checkoutEndpoint, checkoutData);
  }
}