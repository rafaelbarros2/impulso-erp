import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface Order {
  id?: number;
  clientId: number;
  orderDate: Date;
  status: string;
  total: number;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseApiService {
  private endpoint = '/orders';

  getAllOrders(): Observable<Order[]> {
    return this.get<Order[]>(this.endpoint);
  }

  getOrderById(id: number): Observable<Order> {
    return this.get<Order>(`${this.endpoint}/${id}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.post<Order>(this.endpoint, order);
  }

  updateOrder(id: number, order: Order): Observable<Order> {
    return this.put<Order>(`${this.endpoint}/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}