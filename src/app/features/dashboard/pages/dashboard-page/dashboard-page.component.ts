import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import { SalesChartComponent } from '../../components/sales-chart/sales-chart.component';
import { ActivityFeedComponent } from '../../components/activity-feed/activity-feed.component';
import { CategoryChartComponent } from '../../components/category-chart/category-chart.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, SalesChartComponent, ActivityFeedComponent, CategoryChartComponent],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  // Dados mockados para os KPIs
  kpiData = [
    { label: 'Vendas do Mês', value: 'R$ 45.678,90' },
    { label: 'Novos Clientes', value: '12' },
    { label: 'Pedidos Pendentes', value: '8' },
    { label: 'Produtos em Baixo Estoque', value: '5' }
  ];

  // Dados mockados para a Atividade Recente
  activityData = [
    { icon: 'pi-user-plus', title: 'Novo cliente adicionado', subtitle: 'Carlos Pereira' },
    { icon: 'pi-file', title: 'Venda #1024 faturada', subtitle: 'Valor: R$ 1.250,00' },
    { icon: 'pi-box', title: 'Produto "Tênis" em baixo estoque', subtitle: 'Apenas 2 unidades restantes' }
  ];
}