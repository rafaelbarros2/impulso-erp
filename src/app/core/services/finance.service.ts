import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface Receivable {
  id?: number;
  description: string;
  amount: number;
  dueDate: Date;
  status: string;
  clientId?: number;
}

export interface Payable {
  id?: number;
  description: string;
  amount: number;
  dueDate: Date;
  status: string;
  supplierId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService extends BaseApiService {
  private receivablesEndpoint = '/receivables';
  private payablesEndpoint = '/payables';

  // Receivables
  getAllReceivables(): Observable<Receivable[]> {
    return this.get<Receivable[]>(this.receivablesEndpoint);
  }

  getReceivableById(id: number): Observable<Receivable> {
    return this.get<Receivable>(`${this.receivablesEndpoint}/${id}`);
  }

  createReceivable(receivable: Receivable): Observable<Receivable> {
    return this.post<Receivable>(this.receivablesEndpoint, receivable);
  }

  updateReceivable(id: number, receivable: Receivable): Observable<Receivable> {
    return this.put<Receivable>(`${this.receivablesEndpoint}/${id}`, receivable);
  }

  deleteReceivable(id: number): Observable<void> {
    return this.delete<void>(`${this.receivablesEndpoint}/${id}`);
  }

  // Payables
  getAllPayables(): Observable<Payable[]> {
    return this.get<Payable[]>(this.payablesEndpoint);
  }

  getPayableById(id: number): Observable<Payable> {
    return this.get<Payable>(`${this.payablesEndpoint}/${id}`);
  }

  createPayable(payable: Payable): Observable<Payable> {
    return this.post<Payable>(this.payablesEndpoint, payable);
  }

  updatePayable(id: number, payable: Payable): Observable<Payable> {
    return this.put<Payable>(`${this.payablesEndpoint}/${id}`, payable);
  }

  deletePayable(id: number): Observable<void> {
    return this.delete<void>(`${this.payablesEndpoint}/${id}`);
  }
}