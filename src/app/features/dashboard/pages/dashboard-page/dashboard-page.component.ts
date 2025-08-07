import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { SalesChartComponent } from '../../components/sales-chart/sales-chart.component';
import { ActivityFeedComponent } from '../../components/activity-feed/activity-feed.component';
import { CategoryChartComponent } from '../../components/category-chart/category-chart.component';
import { LoadingService } from '../../../../core/services/loading.service';
import { LoadingSpinnerComponent, SkeletonLoaderComponent, EmptyStateComponent, EMPTY_STATES } from '../../../../shared';
import { finalize } from 'rxjs/operators';
import { Observable, of, delay } from 'rxjs';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    SalesChartComponent,
    ActivityFeedComponent,
    CategoryChartComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  kpiData: any[] = [];
  activityData: any[] = [];
  hasError: boolean = false;
  
  // Loading states
  readonly LOADING_KEYS = LoadingService.KEYS;
  readonly EMPTY_STATES = EMPTY_STATES;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  getLoadingService(): LoadingService {
    return this.loadingService;
  }

  loadDashboardData(): void {
    this.hasError = false;
    
    // Simulate API call to load dashboard data
    this.loadingService.withLoadingObservable(
      this.LOADING_KEYS.DASHBOARD,
      () => {throw new Error('Dashboard API não implementada');} // TODO: Implementar service real
    ).pipe(
      finalize(() => {
        // This will be called after loading completes or errors
      })
    ).subscribe({
      next: (data: any) => {
        this.kpiData = data.kpis;
        this.activityData = data.activities;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.hasError = true;
        // this.loadMockData(); // Comentado: usando apenas dados reais da API
      }
    });
  }

  // private simulateDashboardDataLoad(): Observable<any> {
  //   // Simulate API call with delay and potential error
  //   return of({
  //     kpis: [
  //       { label: 'Vendas do Mês', value: 'R$ 45.678,90', icon: 'pi-chart-line', color: 'text-green-600', bgColor: 'bg-green-100' },
  //       { label: 'Novos Clientes', value: '12', icon: 'pi-users', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  //       { label: 'Pedidos Pendentes', value: '8', icon: 'pi-clock', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  //       { label: 'Produtos em Baixo Estoque', value: '5', icon: 'pi-exclamation-triangle', color: 'text-red-600', bgColor: 'bg-red-100' }
  //     ],
  //     activities: [
  //       { icon: 'pi-user-plus', title: 'Novo cliente adicionado', subtitle: 'Carlos Pereira', time: '2 minutos atrás' },
  //       { icon: 'pi-shopping-cart', title: 'Venda #1024 faturada', subtitle: 'Valor: R$ 1.250,00', time: '15 minutos atrás' },
  //       { icon: 'pi-box', title: 'Produto "Tênis" em baixo estoque', subtitle: 'Apenas 2 unidades restantes', time: '1 hora atrás' },
  //       { icon: 'pi-file', title: 'Relatório mensal gerado', subtitle: 'Vendas de Janeiro', time: '2 horas atrás' },
  //       { icon: 'pi-star', title: 'Nova avaliação recebida', subtitle: '5 estrelas - Cliente: Maria Silva', time: '3 horas atrás' }
  //     ]
  //   }).pipe(delay(2000)); // Simulate 2 second loading time
  // }

  // private loadMockData(): void {
  //   // Fallback mock data
  //   this.kpiData = [
  //     { label: 'Vendas do Mês', value: 'R$ 45.678,90', icon: 'pi-chart-line', color: 'text-green-600', bgColor: 'bg-green-100' },
  //     { label: 'Novos Clientes', value: '12', icon: 'pi-users', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  //     { label: 'Pedidos Pendentes', value: '8', icon: 'pi-clock', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  //     { label: 'Produtos em Baixo Estoque', value: '5', icon: 'pi-exclamation-triangle', color: 'text-red-600', bgColor: 'bg-red-100' }
  //   ];

  //   this.activityData = [
  //     { icon: 'pi-user-plus', title: 'Novo cliente adicionado', subtitle: 'Carlos Pereira', time: '2 minutos atrás' },
  //     { icon: 'pi-shopping-cart', title: 'Venda #1024 faturada', subtitle: 'Valor: R$ 1.250,00', time: '15 minutos atrás' },
  //     { icon: 'pi-box', title: 'Produto "Tênis" em baixo estoque', subtitle: 'Apenas 2 unidades restantes', time: '1 hora atrás' }
  //   ];
  // }

  onRetryLoad(): void {
    this.loadDashboardData();
  }
}