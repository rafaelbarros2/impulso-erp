import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Order, OrderItem } from '../../../../core/models';

interface OrderDisplay extends Omit<Order, 'status'> {
  status: 'Novo' | 'Separacao' | 'Embalagem' | 'Enviado' | 'Entregue' | 'Cancelado';
}

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    ToastModule
  ],
  providers: [CurrencyPipe, DatePipe, MessageService],
  templateUrl: './order-detail-modal.component.html',
  styleUrl: './order-detail-modal.component.scss'
})
export class OrderDetailModalComponent implements OnChanges {
  @Input() order: Order | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onUpdateStatus = new EventEmitter<void>();

  // Variável para o dropdown de status
  orderStatusOptions = [
    { label: 'Novo', value: 'Novo' },
    { label: 'Separação', value: 'Separacao' },
    { label: 'Embalagem', value: 'Embalagem' },
    { label: 'Enviado', value: 'Enviado' },
    { label: 'Entregue', value: 'Entregue' },
    { label: 'Cancelado', value: 'Cancelado' },
  ];

  selectedStatus: string | null = null;

  constructor(private messageService: MessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Sincroniza o status selecionado com o status do pedido quando ele muda
    if (changes['order'] && changes['order'].currentValue) {
      this.selectedStatus = changes['order'].currentValue.status;
    }
  }

  hideModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
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

  // Lógica para atualizar o status do pedido
  updateStatus(): void {
    if (this.order && this.selectedStatus) {
      // Simulação de atualização (em um projeto real, isso faria uma chamada de API)
      this.order.status = this.selectedStatus as any;
      this.messageService.add({
        severity: 'success',
        summary: 'Status Atualizado',
        detail: `Status do pedido ${this.order.orderNumber} alterado para ${this.selectedStatus}.`
      });
      
      // Emitir evento para a página pai recarregar a lista se necessário
      this.onUpdateStatus.emit();
      this.hideModal();
    }
  }
}
