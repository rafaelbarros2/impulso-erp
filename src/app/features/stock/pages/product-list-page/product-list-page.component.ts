import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../../core/services/loading.service';
import { ProductService } from '../../../../core/services/product.service';
import { LoadingSpinnerComponent, SkeletonLoaderComponent, EmptyStateComponent, EMPTY_STATES } from '../../../../shared';
import { finalize } from 'rxjs/operators';

interface Product {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  category?: string;
  priceCost: number;
  priceSale: number;
  stockQuantity: number;
  minStock: number;
  imageUrl?: string;
  active?: boolean;
  status?: 'Em Estoque' | 'Baixo Estoque' | 'Esgotado';
}

@Component({
  selector: 'app-product-list-page',
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
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  providers: [ConfirmationService, MessageService], // Provedores para serviços PrimeNG
  templateUrl: './product-list-page.component.html',
  styleUrl: './product-list-page.component.scss' // Você pode criar um SCSS específico se precisar
})
export class ProductListPageComponent implements OnInit {
  products: Product[] = [];
  selectedProducts: Product[] = [];
  globalFilter: string = '';
  hasError: boolean = false;
  
  // Loading states
  readonly LOADING_KEYS = LoadingService.KEYS;
  readonly EMPTY_STATES = EMPTY_STATES;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  getLoadingService(): LoadingService {
    return this.loadingService;
  }
  loadProducts(): void {
    this.hasError = false;
    
    // Use the loading service with the product service
    this.loadingService.withLoadingObservable(
      this.LOADING_KEYS.PRODUCTS,
      () => this.productService.getAllProducts()
    ).pipe(
      finalize(() => {
        // This will be called after loading completes or errors
      })
    ).subscribe({
      next: (products: Product[]) => {
        // Transform the API products to match our interface
        this.products = products.map(product => ({
          ...product,
          status: this.getStockStatus(product.stockQuantity),
          imageUrl: `https://placehold.co/100x100/E0F2F1/000000?text=${encodeURIComponent(product.name.substring(0, 6))}`
        }));
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.hasError = true;
        
        // Fallback to mock data for MVP
        this.loadMockProducts();
        
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Aviso', 
          detail: 'Erro ao carregar produtos da API. Exibindo dados de exemplo.' 
        });
      }
    });
  }




  private getStockStatus(stock: number): 'Em Estoque' | 'Baixo Estoque' | 'Esgotado' {
    if (stock === 0) return 'Esgotado';
    if (stock <= 10) return 'Baixo Estoque';
    return 'Em Estoque';
  }

  private loadMockProducts(): void {
    // Mock data as fallback
    this.products  = [
      { id: 1, name: 'Vestido Floral Verão', sku: 'VF1001', category: 'Vestidos', priceCost: 80.00, priceSale: 129.90, stockQuantity: 50, minStock: 10, status: 'Em Estoque', imageUrl: 'https://placehold.co/100x100/E0F2F1/000000?text=Vestido' },
      { id: 2, name: 'Calça Jeans Skinny', sku: 'CJ2002', category: 'Calças', priceCost: 50.00, priceSale: 89.50, stockQuantity: 10, minStock: 5, status: 'Baixo Estoque', imageUrl: 'https://placehold.co/100x100/FFF3E0/000000?text=Calça' },
      { id: 3, name: 'Blusa de Seda Branca', sku: 'BS3003', category: 'Blusas', priceCost: 40.00, priceSale: 75.00, stockQuantity: 0, minStock: 2, status: 'Esgotado', imageUrl: 'https://placehold.co/100x100/FCE4EC/000000?text=Blusa' },
      { id: 4, name: 'Tênis Esportivo Casual', sku: 'TE4004', category: 'Calçados', priceCost: 120.00, priceSale: 199.99, stockQuantity: 30, minStock: 8, status: 'Em Estoque', imageUrl: 'https://placehold.co/100x100/E8F5E8/000000?text=Tênis' },
      { id: 5, name: 'Saia Plissada Midi', sku: 'SP5005', category: 'Saias', priceCost: 60.00, priceSale: 95.00, stockQuantity: 5, minStock: 3, status: 'Baixo Estoque', imageUrl: 'https://placehold.co/100x100/F3E5F5/000000?text=Saia' },
    ];
  }

  onRetryLoad(): void {
    this.loadProducts();
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
        // Show loading during delete operation
        this.loadingService.setLoading(this.LOADING_KEYS.DELETING_PRODUCT, true);
        
        // Simulate API call with delay
        setTimeout(() => {
          try {
            // In a real app, this would be: this.productService.deleteProduct(product.id)
            this.products = this.products.filter(p => p.id !== product.id);
            
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Sucesso', 
              detail: 'Produto excluído com sucesso!' 
            });
          } catch (error) {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Erro', 
              detail: 'Erro ao excluir produto.' 
            });
          } finally {
            this.loadingService.setLoading(this.LOADING_KEYS.DELETING_PRODUCT, false);
          }
        }, 1500); // Simulate network delay
      },
      reject: () => {
        this.messageService.add({ 
          severity: 'info', 
          summary: 'Cancelado', 
          detail: 'Exclusão de produto cancelada.' 
        });
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
