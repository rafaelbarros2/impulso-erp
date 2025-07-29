import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog'; // Para o modal de confirmação
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Para o modal de confirmação
import { ConfirmationService, MessageService } from 'primeng/api'; // Para o modal de confirmação e mensagens
import { ToastModule } from 'primeng/toast'; // Para exibir mensagens de sucesso/erro
import { FormsModule } from '@angular/forms'; // Necessário para ngModel

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'Em Estoque' | 'Baixo Estoque' | 'Esgotado';
  imageUrl: string;
}

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Adicionado para ngModel
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService], // Provedores para serviços PrimeNG
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss' // Você pode criar um SCSS específico se precisar
})
export class ProductListPageComponent implements OnInit {
  products: Product[] = [];
  selectedProducts: Product[] = [];
  globalFilter: string = '';

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Simula o carregamento de produtos para o MVP
    this.loadProducts();
  }

  loadProducts(): void {
    // Dados mockados para MVP. Em um projeto real, isso viria de um serviço.
    this.products = [
      { id: '1', name: 'Vestido Floral Verão', sku: 'VF1001', category: 'Vestidos', price: 129.90, stock: 50, status: 'Em Estoque', imageUrl: 'https://placehold.co/100x100/E0F2F1/000000?text=Vestido' },
      { id: '2', name: 'Calça Jeans Skinny', sku: 'CJ2002', category: 'Calças', price: 89.50, stock: 10, status: 'Baixo Estoque', imageUrl: 'https://placehold.co/100x100/FFF3E0/000000?text=Calça' },
      { id: '3', name: 'Blusa de Seda Branca', sku: 'BS3003', category: 'Blusas', price: 75.00, stock: 0, status: 'Esgotado', imageUrl: 'https://placehold.co/100x100/FCE4EC/000000?text=Blusa' },
      { id: '4', name: 'Tênis Esportivo Casual', sku: 'TE4004', category: 'Calçados', price: 199.99, stock: 30, status: 'Em Estoque', imageUrl: 'https://placehold.co/100x100/E8F5E8/000000?text=Tênis' },
      { id: '5', name: 'Saia Plissada Midi', sku: 'SP5005', category: 'Saias', price: 95.00, stock: 5, status: 'Baixo Estoque', imageUrl: 'https://placehold.co/100x100/F3E5F5/000000?text=Saia' },
    ];
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Em Estoque':
        return 'success';
      case 'Baixo Estoque':
        return 'warning';
      case 'Esgotado':
        return 'danger';
      default:
        return 'info';
    }
  }

  onAddNewProduct(): void {
    this.router.navigate(['/stock/products/new']);
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/stock/products/edit', product.id]);
  }

  onDeleteProduct(event: Event, product: Product): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir o produto "${product.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        // Lógica para excluir o produto no MVP (simulação)
        this.products = this.products.filter(p => p.id !== product.id);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto excluído com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de produto cancelada.' });
      }
    });
  }

  // Método para lidar com a exclusão de múltiplos produtos (se houver seleção)
  deleteSelectedProducts(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir os ${this.selectedProducts.length} produtos selecionados?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        const selectedIds = new Set(this.selectedProducts.map(p => p.id));
        this.products = this.products.filter(p => !selectedIds.has(p.id));
        this.selectedProducts = []; // Limpa a seleção
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produtos selecionados excluídos com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de produtos cancelada.' });
      }
    });
  }
}
