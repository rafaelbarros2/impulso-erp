import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { ActivityData, DashboardData, KpiData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseApiService {

  getDashboardData(): Observable<DashboardData> {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date();
    const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fazendo múltiplas chamadas para construir o dashboard
    return forkJoin({
      salesToday: this.get(`/reports/sales/daily/${today}`),
      salesMonth: this.get(`/reports/sales/overview?startDate=${startOfMonth}&endDate=${endOfMonth}`),
      financeOverview: this.get('/reports/finance/overview'),
      recentOrders: this.get('/orders?page=0&size=5&sort=createdAt,desc')
    }).pipe(
      map(data => this.transformToDashboardData(data))
    );
  }

  private transformToDashboardData(apiData: any): DashboardData {
    const { salesToday, salesMonth, financeOverview, recentOrders } = apiData;

    // Transformar dados em KPIs
    const kpis: KpiData[] = [
      {
        title: 'Vendas Hoje',
        value: this.formatCurrency(salesToday?.totalSales || 0),
        icon: 'pi-dollar',
        trend: this.calculateTrend(salesToday?.totalSales || 0, salesToday?.previousDayTotal || 0)
      },
      {
        title: 'Pedidos',
        value: (salesToday?.totalOrders || 0).toString(),
        icon: 'pi-shopping-cart',
        trend: this.calculateTrend(salesToday?.totalOrders || 0, salesToday?.previousDayOrders || 0)
      },
      {
        title: 'Receitas do Mês',
        value: this.formatCurrency(financeOverview?.totalReceivables || 0),
        icon: 'pi-money-bill',
        trend: '+0%'
      },
      {
        title: 'Produtos Vendidos',
        value: (salesToday?.totalItemsSold || 0).toString(),
        icon: 'pi-box',
        trend: '+0%'
      }
    ];

    // Transformar pedidos recentes em atividades
    const activities: ActivityData[] = (recentOrders?.content || []).slice(0, 5).map((order: any) => ({
      type: 'sale',
      message: `Nova venda realizada - Pedido #${order.id}`,
      time: this.formatTime(order.createdAt),
      amount: this.formatCurrency(order.totalAmount),
      client: order.clientName || 'Cliente não informado'
    }));

    return { kpis, activities };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private calculateTrend(current: number, previous: number): string {
    if (previous === 0) return '+0%';
    const percentage = ((current - previous) / previous) * 100;
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${Math.round(percentage)}%`;
  }
}