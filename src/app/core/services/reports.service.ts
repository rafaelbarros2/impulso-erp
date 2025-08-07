import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { FinancialReport, SalesReport } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ReportsService extends BaseApiService {
  
  getFinancialReport(): Observable<FinancialReport> {
    return this.get<FinancialReport>('/reports/finance');
  }

  getSalesReport(): Observable<SalesReport> {
    return this.get<SalesReport>('/reports/sales');
  }

  getFinancialReportByPeriod(startDate: string, endDate: string): Observable<FinancialReport> {
    return this.get<FinancialReport>(`/reports/finance?startDate=${startDate}&endDate=${endDate}`);
  }

  getSalesReportByPeriod(startDate: string, endDate: string): Observable<SalesReport> {
    return this.get<SalesReport>(`/reports/sales?startDate=${startDate}&endDate=${endDate}`);
  }
}