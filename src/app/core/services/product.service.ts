import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  category?: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  minStock: number;
  imageUrl?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService {
  private endpoint = '/products';

  getAllProducts(): Observable<Product[]> {
    return this.get<Product[]>(this.endpoint);
  }

  getProductById(id: string): Observable<Product> {
    return this.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.post<Product>(this.endpoint, product);
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.put<Product>(`${this.endpoint}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.get<Product[]>(`${this.endpoint}/search?name=${searchTerm}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.get<Product[]>(`${this.endpoint}/category/${category}`);
  }

  getProductBySku(sku: string): Observable<Product> {
    return this.get<Product>(`${this.endpoint}/sku/${sku}`);
  }
}