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
import { CalendarModule } from 'primeng/calendar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Payable } from '../../../../core/models';

@Component({
  selector: 'app-payables-list-page',
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
  templateUrl: './payables-list-page.component.html',
  styleUrl: './payables-list-page.component.scss'
})
export class PayablesListPageComponent implements OnInit {
  payables: Payable[] = [];
  selectedPayables: Payable[] = [];
  globalFilter: string = '';
  dateFilter: Date | null = null;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.loadPayables();
  }

  loadPayables(): void {
    // TODO: Implementar carregamento real de dados da API
    // this.payables = [
    //   { id: '1', description: 'Aluguel Escritório', supplierName: 'Imobiliária Central', amount: 1500.00, dueDate: new Date('2025-07-05'), status: 'Pago', paymentDate: new Date('2025-07-04') },
    //   { id: '2', description: 'Conta de Luz', supplierName: 'Energia Elétrica S.A.', amount: 250.50, dueDate: new Date('2025-07-28'), status: 'Atrasado' },
    //   { id: '3', description: 'Compra de Tecidos', supplierName: 'Tecelagem Fina', amount: 800.00, dueDate: new Date('2025-08-10'), status: 'Pendente' },
    //   { id: '4', description: 'Salário Funcionário A', supplierName: 'Funcionário A', amount: 2000.00, dueDate: new Date('2025-07-30'), status: 'Pendente' },
    //   { id: '5', description: 'Manutenção de Equipamentos', supplierName: 'Tech Services', amount: 450.00, dueDate: new Date('2025-07-15'), status: 'Pago', paymentDate: new Date('2025-07-15') },
    // ];
    this.payables = []; // Removido dados mockados
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Pendente':
        return 'info';
      case 'Pago':
        return 'success';
      case 'Atrasado':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  onAddNewPayable(): void {
    this.router.navigate(['/finance/payables/new']);
  }

  onEditPayable(payable: Payable): void {
    this.router.navigate(['/finance/payables/edit', payable.id]);
  }

  onDeletePayable(event: Event, payable: Payable): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir a conta a pagar "${payable.description}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.payables = this.payables.filter(p => p.id !== payable.id);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta a pagar excluída com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de conta a pagar cancelada.' });
      }
    });
  }

  deleteSelectedPayables(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir as ${this.selectedPayables.length} contas a pagar selecionadas?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        const selectedIds = new Set(this.selectedPayables.map(p => p.id));
        this.payables = this.payables.filter(p => !selectedIds.has(p.id));
        this.selectedPayables = [];
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Contas a pagar selecionadas excluídas com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de contas a pagar cancelada.' });
      }
    });
  }

  // Função para marcar como pago (MVP simplificado)
  markAsPaid(payable: Payable): void {
    if (payable.status !== 'Pago') {
      payable.status = 'Pago';
      payable.paymentDate = new Date(); // Data atual como data de pagamento
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Conta a pagar "${payable.description}" marcada como paga!` });
    } else {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: `Conta a pagar "${payable.description}" já está como paga.` });
    }
  }

  // Função para aplicar filtro de data
  onDateFilterChange(dt: any): void {
    if (this.dateFilter) {
      const filterDate = this.dateFilter.toDateString();
      dt.filter(filterDate, 'dueDate', 'dateEq'); // 'dateEq' é um filtro customizado que você precisaria implementar ou usar um filtro de range
    } else {
      dt.filter(null, 'dueDate', 'dateEq');
    }
  }
}
