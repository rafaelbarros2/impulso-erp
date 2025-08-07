import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { ReportsService, FinancialReport } from '../../../../core/services/reports.service';

@Component({
  selector: 'app-financial-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ToastModule,
    ButtonModule,
    RouterModule
  ],
  providers: [MessageService, CurrencyPipe, DatePipe],
  templateUrl: './financial-dashboard-page.component.html',
  styleUrl: './financial-dashboard-page.component.scss' // Referencia o novo arquivo SCSS
})
export class FinancialDashboardPageComponent implements OnInit {

  constructor(
    private reportsService: ReportsService,
    private messageService: MessageService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe
  ) {}

  // Estado de carregamento
  isLoading = false;
  hasError = false;

  // Dados para KPIs (inicializados com 0, serão carregados da API)
  totalReceivables: number = 0;
  totalPayables: number = 0;
  monthlyRevenue: number = 0;
  availableBalance: number = 0;
  overdueReceivables: number = 0;
  overduePayablesCount: number = 0;
  revenueGoal: number = 80000.00; // Meta fixa por enquanto
  projectedBalance7Days: number = 0;
  
  get revenuePercentage(): number {
    return this.revenueGoal > 0 ? (this.monthlyRevenue / this.revenueGoal) * 100 : 0;
  }
  
  get netBalance(): number {
    return this.monthlyRevenue - this.totalPayables;
  }

  lastUpdate: Date = new Date();

  // Dados para gráficos
  cashFlowChartData: any;
  cashFlowChartOptions: any;

  // Dados para categorias de despesa (Barras)
  expenseCategories: any[] = [];

  // Dados para a tabela de movimentações recentes
  recentTransactions: any[] = [];


  ngOnInit(): void {
    this.loadFinancialData();
  }

  loadFinancialData(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.reportsService.getFinancialReport().subscribe({
      next: (report: FinancialReport) => {
        // Atualizar KPIs
        this.totalReceivables = report.totalReceivables;
        this.totalPayables = report.totalPayables;
        this.monthlyRevenue = report.monthlyRevenue;
        this.availableBalance = report.availableBalance;
        this.overdueReceivables = report.overdueReceivables;
        this.overduePayablesCount = report.overduePayablesCount;
        this.projectedBalance7Days = report.projectedBalance7Days;
        
        // Atualizar gráficos e dados
        this.setupCashFlowChart(report.cashFlowData);
        this.expenseCategories = report.expenseCategories;
        this.recentTransactions = this.formatTransactions(report.recentTransactions);
        
        this.updateLastRefreshTime();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading financial report:', error);
        this.hasError = true;
        this.isLoading = false;
        
        // Fallback to setup mock data for display
        // this.setupMockData(); // Comentado: usando apenas dados reais da API
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro de Conexão',
          detail: 'Não foi possível carregar os dados financeiros. Exibindo dados de exemplo.',
          life: 5000
        });
      }
    });
  }

  // private setupMockData(): void {
  //   this.totalReceivables = 45280.00;
  //   this.totalPayables = 32150.00;
  //   this.monthlyRevenue = 78950.00;
  //   this.availableBalance = 13130.00;
  //   this.overdueReceivables = 2150.00;
  //   this.overduePayablesCount = 3;
  //   this.projectedBalance7Days = 15280.00;
    
  //   this.setupCashFlowChart();
  //   this.setupExpenseCategories();
  //   this.loadRecentTransactions();
  //   this.updateLastRefreshTime();
  // }

  private formatTransactions(transactions: any[]): any[] {
    return transactions.map(transaction => ({
      ...transaction,
      date: new Date(transaction.date),
      statusClass: this.getTransactionStatusClass(transaction.status)
    }));
  }

  private getTransactionStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'received':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  updateLastRefreshTime(): void {
    this.lastUpdate = new Date();
  }

  onRefreshData(): void {
    this.loadFinancialData();
    
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Atualizado', 
      detail: 'Dados financeiros atualizados com sucesso!',
      life: 3000
    });
  }

  setupCashFlowChart(cashFlowData?: any[]): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color'); // Cor do texto padrão
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary'); // Cor do texto secundário
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border'); // Cor da borda da superfície

    // Use API data if available, otherwise fallback to mock data
    const labels = cashFlowData?.map(item => item.month) || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    const revenueData = cashFlowData?.map(item => item.revenue) || [65000, 59000, 80000, 81000, 56000, 55000, 78950];
    const expenseData = cashFlowData?.map(item => item.expenses) || [45000, 42000, 55000, 48000, 32000, 35000, 32150];
    
    this.cashFlowChartData = {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: revenueData,
          borderColor: documentStyle.getPropertyValue('--success-green'), // Cor verde para receitas
          backgroundColor: documentStyle.getPropertyValue('--success-green-light'), // Cor de fundo suave
          tension: 0.4,
          fill: true,
          pointBackgroundColor: documentStyle.getPropertyValue('--success-green'),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Despesas',
          data: expenseData,
          borderColor: documentStyle.getPropertyValue('--danger-red'), // Cor vermelha para despesas
          backgroundColor: documentStyle.getPropertyValue('--danger-red-light'), // Cor de fundo suave
          tension: 0.4,
          fill: true,
          pointBackgroundColor: documentStyle.getPropertyValue('--danger-red'),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };

    this.cashFlowChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 'bold'
            },
            color: textColor // Usa a cor do tema para as legendas
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#374151',
          bodyColor: '#374151',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += this.currencyPipe.transform(context.parsed.y, 'BRL', 'symbol', '1.0-0', 'pt');
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              weight: '600'
            },
            color: textColorSecondary // Usa a cor do tema para os ticks do eixo X
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)' // Cor da grade mais suave
          },
          ticks: {
            callback: (value: any) => {
              return 'R$ ' + value.toLocaleString('pt-BR');
            },
            font: {
              weight: '600'
            },
            color: textColorSecondary // Usa a cor do tema para os ticks do eixo Y
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };
  }

  // setupExpenseCategories(): void {
  //   // Dados para as barras de categoria de despesa
  //   this.expenseCategories = [
  //     { name: 'Operacional', percentage: 45, color: 'var(--primary-blue)' },
  //     { name: 'Marketing', percentage: 25, color: 'var(--success-green)' },
  //     { name: 'Pessoal', percentage: 20, color: 'var(--warning-yellow)' },
  //     { name: 'Outros', percentage: 10, color: 'var(--danger-red)' },
  //   ];
  // }

  // loadRecentTransactions(): void {
  //   this.recentTransactions = [
  //     {
  //       date: new Date('2025-07-29'),
  //       description: 'Pagamento Fornecedor ABC',
  //       detail: 'Nota Fiscal #12345',
  //       category: 'Operacional',
  //       categoryColor: 'blue',
  //       amount: -2850.00,
  //       status: 'Pago',
  //       statusClass: 'status-paid'
  //     },
  //     {
  //       date: new Date('2025-07-28'),
  //       description: 'Recebimento Cliente XYZ',
  //       detail: 'Fatura #VEN-2025-001',
  //       category: 'Vendas',
  //       categoryColor: 'green',
  //       amount: 5200.00,
  //       status: 'Recebido',
  //       statusClass: 'status-received'
  //     },
  //     {
  //       date: new Date('2025-07-27'),
  //       description: 'Pagamento Aluguel',
  //       detail: 'Contrato #2025-AL-001',
  //       category: 'Despesas Fixas',
  //       categoryColor: 'purple',
  //       amount: -3500.00,
  //       status: 'Pendente',
  //       statusClass: 'status-pending'
  //     },
  //     {
  //       date: new Date('2025-07-26'),
  //       description: 'Compra de Material de Escritório',
  //       detail: 'Pedido #2025-MAT-005',
  //       category: 'Operacional',
  //       categoryColor: 'blue',
  //       amount: -450.00,
  //       status: 'Pago',
  //       statusClass: 'status-paid'
  //     },
  //     {
  //       date: new Date('2025-07-25'),
  //       description: 'Recebimento de Crediário',
  //       detail: 'Parcela 3/5 - Cliente Ana',
  //       category: 'Vendas',
  //       categoryColor: 'green',
  //       amount: 150.00,
  //       status: 'Recebido',
  //       statusClass: 'status-received'
  //     }
  //   ];
  // }

  // Helper para formatar datas na tabela
  formatTableDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  // Helper para determinar a cor do texto do saldo
  getNetBalanceSeverity(): string {
    if (this.netBalance > 0) {
      return 'success';
    } else if (this.netBalance < 0) {
      return 'danger';
    }
    return 'info';
  }
}
