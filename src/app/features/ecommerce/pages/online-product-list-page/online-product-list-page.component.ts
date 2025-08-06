import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { ToggleButtonModule } from 'primeng/togglebutton'; // Para ativar/desativar visibilidade

interface OnlineProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  onlinePrice: number; // Preço específico para online
  stock: number;
  status: 'Ativo' | 'Inativo'; // Status de visibilidade online
  image: string;
}

@Component({
  selector: 'app-online-product-list-page',
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
    ToggleButtonModule
  ],
  providers: [ConfirmationService, MessageService, CurrencyPipe],
  templateUrl: './online-product-list-page.component.html',
  styleUrl: './online-product-list-page.component.scss'
})
export class OnlineProductListPageComponent implements OnInit {
  onlineProducts: OnlineProduct[] = [];
  selectedOnlineProducts: OnlineProduct[] = [];
  globalFilter: string = '';

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    this.loadOnlineProducts();
  }

  loadOnlineProducts(): void {
    // Dados mockados para MVP. Em um projeto real, isso viria de um serviço.
    this.onlineProducts = [
      { id: '1', name: 'Vestido Floral Verão', sku: 'VF1001', category: 'Vestidos', price: 129.90, onlinePrice: 119.90, stock: 50, status: 'Ativo', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop' },
      { id: '2', name: 'Calça Jeans Skinny', sku: 'CJ2002', category: 'Calças', price: 89.50, onlinePrice: 89.50, stock: 10, status: 'Inativo', image: 'https://images.unsplash.com/photo-1541099645167-bb809425f705?w=300&h=300&fit=crop' },
      { id: '3', name: 'Blusa de Seda Branca', sku: 'BS3003', category: 'Blusas', price: 75.00, onlinePrice: 69.90, stock: 0, status: 'Inativo', image: 'https://images.unsplash.com/photo-1591047139829-d91aec6fc87e?w=300&h=300&fit=crop' },
      { id: '4', name: 'Tênis Esportivo Casual', sku: 'TE4004', category: 'Calçados', price: 199.99, onlinePrice: 189.99, stock: 30, status: 'Ativo', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop' },
      { id: '5', name: 'Saia Plissada Midi', sku: 'SP5005', category: 'Saias', price: 95.00, onlinePrice: 95.00, stock: 5, status: 'Ativo', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d2d?w=300&h=300&fit=crop' },
    ];
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Inativo':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  onAddNewOnlineProduct(): void {
    this.router.navigate(['/ecommerce/products/new']);
  }

  onEditOnlineProduct(product: OnlineProduct): void {
    this.router.navigate(['/ecommerce/products/edit', product.id]);
  }

  onDeleteOnlineProduct(event: Event, product: OnlineProduct): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir o produto online "${product.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.onlineProducts = this.onlineProducts.filter(p => p.id !== product.id);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto online excluído com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de produto online cancelada.' });
      }
    });
  }

  deleteSelectedOnlineProducts(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir os ${this.selectedOnlineProducts.length} produtos online selecionados?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        const selectedIds = new Set(this.selectedOnlineProducts.map(p => p.id));
        this.onlineProducts = this.onlineProducts.filter(p => !selectedIds.has(p.id));
        this.selectedOnlineProducts = [];
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produtos online selecionados excluídos com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de produtos online cancelada.' });
      }
    });
  }

  toggleProductStatus(product: OnlineProduct): void {
    product.status = product.status === 'Ativo' ? 'Inativo' : 'Ativo';
    this.messageService.add({
      severity: 'success',
      summary: 'Status Atualizado',
      detail: `Produto "${product.name}" agora está ${product.status}.`
    });
  }

  onImageError(event: any): void {
    // Fallback image if original fails to load
    event.target.src = 'https://placehold.co/100x100/E0F2F1/000000?text=Sem+Imagem';
  }
}
