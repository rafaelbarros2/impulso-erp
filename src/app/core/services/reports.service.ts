import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface FinancialReport {
  totalReceivables: number;
  totalPayables: number;
  monthlyRevenue: number;
  availableBalance: number;
  overdueReceivables: number;
  overduePayablesCount: number;
  revenueGoal: number;
  projectedBalance7Days: number;
  cashFlowData: CashFlowItem[];
  expenseCategories: ExpenseCategory[];
  recentTransactions: Transaction[];
}

export interface SalesReport {
  totalSales: number;
  salesGrowth: number;
  averageTicket: number;
  conversionRate: number;
  topProducts: ProductSales[];
  salesByPeriod: SalesByPeriod[];
  salesByCategory: SalesByCategory[];
}

export interface CashFlowItem {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface Transaction {
  id: number;
  date: Date;
  description: string;
  detail: string;
  category: string;
  categoryColor: string;
  amount: number;
  status: string;
  statusClass: string;
}

export interface ProductSales {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface SalesByPeriod {
  period: string;
  sales: number;
  orders: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  percentage: number;
}

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