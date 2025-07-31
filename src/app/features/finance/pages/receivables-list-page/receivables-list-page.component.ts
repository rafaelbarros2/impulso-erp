import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar'; // Para filtro de data
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface Receivable {
  id: string;
  description: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  status: 'Pendente' | 'Recebido' | 'Atrasado';
  paymentDate?: Date;
}

@Component({
  selector: 'app-receivables-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CalendarModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService, CurrencyPipe],
  templateUrl: './receivables-list-page.component.html',
  styleUrl: './receivables-list-page.component.scss'
})
export class ReceivablesListPageComponent implements OnInit {
  receivables: Receivable[] = [];
  selectedReceivables: Receivable[] = [];
  globalFilter: string = '';
  dateFilter: Date | null = null;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.loadReceivables();
  }

  loadReceivables(): void {
    // Dados mockados para MVP. Em um projeto real, isso viria de um serviço.
    this.receivables = [
      { id: '1', description: 'Venda PDV - Cliente Maria', clientName: 'Maria Silva', amount: 349.90, dueDate: new Date('2025-07-30'), status: 'Recebido', paymentDate: new Date('2025-07-29') },
      { id: '2', description: 'Serviço de Consultoria', clientName: 'Empresa ABC', amount: 1200.00, dueDate: new Date('2025-08-15'), status: 'Pendente' },
      { id: '3', description: 'Venda Online - Cliente João', clientName: 'João Santos', amount: 550.75, dueDate: new Date('2025-07-20'), status: 'Atrasado' },
      { id: '4', description: 'Aluguel de Espaço', clientName: 'Imobiliária X', amount: 2500.00, dueDate: new Date('2025-08-05'), status: 'Pendente' },
      { id: '5', description: 'Venda PDV - Cliente Ana', clientName: 'Ana Costa', amount: 199.90, dueDate: new Date('2025-07-25'), status: 'Recebido', paymentDate: new Date('2025-07-25') },
    ];
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Pendente':
        return 'info';
      case 'Recebido':
        return 'success';
      case 'Atrasado':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  onAddNewReceivable(): void {
    this.router.navigate(['/finance/receivables/new']);
  }

  onEditReceivable(receivable: Receivable): void {
    this.router.navigate(['/finance/receivables/edit', receivable.id]);
  }

  onDeleteReceivable(event: Event, receivable: Receivable): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir o recebível "${receivable.description}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.receivables = this.receivables.filter(r => r.id !== receivable.id);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Recebível excluído com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de recebível cancelada.' });
      }
    });
  }

  deleteSelectedReceivables(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir os ${this.selectedReceivables.length} recebíveis selecionados?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        const selectedIds = new Set(this.selectedReceivables.map(r => r.id));
        this.receivables = this.receivables.filter(r => !selectedIds.has(r.id));
        this.selectedReceivables = [];
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Recebíveis selecionados excluídos com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de recebíveis cancelada.' });
      }
    });
  }

  // Função para marcar como recebido (MVP simplificado)
  markAsReceived(receivable: Receivable): void {
    if (receivable.status !== 'Recebido') {
      receivable.status = 'Recebido';
      receivable.paymentDate = new Date(); // Data atual como data de pagamento
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Recebível "${receivable.description}" marcado como recebido!` });
    } else {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: `Recebível "${receivable.description}" já está como recebido.` });
    }
  }

  // Função para aplicar filtro de data
  onDateFilterChange(dt: any): void {
    if (this.dateFilter) {
      // Formata a data para comparação apenas por dia, mês e ano
      const filterDate = this.dateFilter.toDateString();
      dt.filter(filterDate, 'dueDate', 'dateEq'); // 'dateEq' é um filtro customizado que você precisaria implementar ou usar um filtro de range
    } else {
      dt.filter(null, 'dueDate', 'dateEq');
    }
  }

  // Função customizada para filtro de data exata (exemplo, pode ser mais complexa)
  // Nota: Para usar 'dateEq' diretamente no p-table, você precisaria estender o filtro do PrimeNG
  // ou fazer a filtragem manualmente no seu getter de `filteredReceivables` se houver um.
  // Para este exemplo, o filtro de data no p-table pode precisar de um range ou de uma conversão de string.
}
