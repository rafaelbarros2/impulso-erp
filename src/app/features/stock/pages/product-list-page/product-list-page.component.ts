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
import { Product } from '../../../../core/models';
import { LoadingSpinnerComponent, SkeletonLoaderComponent, EmptyStateComponent, EMPTY_STATES } from '../../../../shared';
import { finalize } from 'rxjs/operators';

interface ProductDisplay extends Product {
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
        this.products = []; // Clear any existing data
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro de Conexão', 
          detail: 'Não foi possível carregar os produtos. Verifique sua conexão com a internet.' 
        });
      }
    });
  }




  private getStockStatus(stock: number): 'Em Estoque' | 'Baixo Estoque' | 'Esgotado' {
    if (stock === 0) return 'Esgotado';
    if (stock <= 10) return 'Baixo Estoque';
    return 'Em Estoque';
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
        if (product.id) {
          this.productService.deleteProduct(product.id.toString()).subscribe({
            next: () => {
              this.products = this.products.filter(p => p.id !== product.id);
              this.messageService.add({ 
                severity: 'success', 
                summary: 'Sucesso', 
                detail: 'Produto excluído com sucesso!' 
              });
            },
            error: (error) => {
              console.error('Error deleting product:', error);
              this.messageService.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Erro ao excluir produto.' 
              });
            }
          });
        }
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
