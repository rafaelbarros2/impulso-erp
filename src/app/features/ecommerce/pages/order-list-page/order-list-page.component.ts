import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component'; // Importar o modal

// Interfaces para os dados
interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  totalAmount: number;
  orderDate: Date;
  status: 'Novo' | 'Separacao' | 'Embalagem' | 'Enviado' | 'Entregue' | 'Cancelado';
  items: OrderItem[];
}

@Component({
  selector: 'app-order-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    OrderDetailModalComponent // Importado
  ],
  providers: [ConfirmationService, MessageService, CurrencyPipe, DatePipe],
  templateUrl: './order-list-page.component.html',
  styleUrl: './order-list-page.component.scss'
})
export class OrderListPageComponent implements OnInit {
  orders: Order[] = [];
  selectedOrders: Order[] = [];
  globalFilter: string = '';

  displayOrderDetailModal: boolean = false;
  selectedOrder: Order | null = null;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // TODO: Implementar carregamento real de dados da API
    // this.orders = [
    //   {
    //     id: '1',
    //     orderNumber: 'PED-2025-001',
    //     clientName: 'Maria Silva',
    //     totalAmount: 189.90,
    //     orderDate: new Date('2025-08-01'),
    //     status: 'Separacao',
    //     items: [
    //       { name: 'Vestido Floral Verão', sku: 'VF1001', quantity: 1, price: 119.90 },
    //       { name: 'Saia Plissada Midi', sku: 'SP5005', quantity: 1, price: 95.00 }
    //     ]
    //   },
    //   {
    //     id: '2',
    //     orderNumber: 'PED-2025-002',
    //     clientName: 'João Santos',
    //     totalAmount: 220.00,
    //     orderDate: new Date('2025-07-30'),
    //     status: 'Enviado',
    //     items: [
    //       { name: 'Tênis Esportivo Casual', sku: 'TE4004', quantity: 1, price: 189.99 }
    //     ]
    //   },
    //   {
    //     id: '3',
    //     orderNumber: 'PED-2025-003',
    //     clientName: 'Ana Costa',
    //     totalAmount: 69.90,
    //     orderDate: new Date('2025-07-28'),
    //     status: 'Novo',
    //     items: [
    //       { name: 'Blusa de Seda Branca', sku: 'BS3003', quantity: 1, price: 69.90 }
    //     ]
    //   },
    //   {
    //     id: '4',
    //     orderNumber: 'PED-2025-004',
    //     clientName: 'Pedro Lima',
    //     totalAmount: 89.50,
    //     orderDate: new Date('2025-07-25'),
    //     status: 'Entregue',
    //     items: [
    //       { name: 'Calça Jeans Skinny', sku: 'CJ2002', quantity: 1, price: 89.50 }
    //     ]
    //   },
    // ];
    this.orders = []; // Removido dados mockados
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Novo':
        return 'warning';
      case 'Separacao':
        return 'info';
      case 'Embalagem':
        return 'help';
      case 'Enviado':
        return 'primary';
      case 'Entregue':
        return 'success';
      case 'Cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  openOrderDetail(order: Order): void {
    this.selectedOrder = order;
    this.displayOrderDetailModal = true;
  }

  onDeleteOrder(event: Event, order: Order): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir o pedido "${order.orderNumber}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.orders = this.orders.filter(o => o.id !== order.id);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Pedido excluído com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de pedido cancelada.' });
      }
    });
  }
}
