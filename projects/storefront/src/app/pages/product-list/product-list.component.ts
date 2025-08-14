import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorefrontItemCardComponent } from '../../components/storefront-item-card/storefront-item-card.component';
import { DynamicFilterComponent } from '../../components/dynamic-filter/dynamic-filter.component';
import { CatalogService } from '../../services/catalog.service';
import { DynamicFiltersService } from '../../services/dynamic-filters.service';
import { Product as CatalogProduct } from '../../models/catalog.models';
import { DynamicFilter } from '../../models/dynamic-filters.models';
import { toStorefrontProduct } from '../../models/storefront-product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StorefrontItemCardComponent, DynamicFilterComponent],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Produtos</h1>
        <p class="text-gray-600">Explore nossa seleção com filtros avançados.</p>
      </div>

      <div class="flex gap-6">
        <!-- Sidebar de Filtros -->
        <aside class="hidden lg:block w-72 bg-white rounded-xl shadow p-4 h-max">
          <h3 class="text-lg font-semibold mb-3">Filtros</h3>

          <!-- Faixa de Preço -->
          <div class="mb-6">
            <h4 class="font-medium mb-2">Faixa de Preço</h4>
            <input type="range" [min]="filterState().priceRange.min" [max]="filterState().priceRange.max"
                   [value]="filterState().priceRange.current" (input)="updatePriceFilter($event)" class="w-full">
            <div class="flex justify-between mt-1 text-sm text-gray-600">
              <span>{{ filterState().priceRange.min | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span class="font-semibold">{{ filterState().priceRange.current | currency:'BRL':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <!-- Filtros Dinâmicos -->
          <app-dynamic-filter 
            *ngFor="let filter of dynamicFilters()" 
            [filter]="filter"
            (filterChange)="updateDynamicFilter(filter.name, $event)">
          </app-dynamic-filter>

          <!-- Desconto mínimo -->
          <div class="mb-6">
            <h4 class="font-medium mb-2">Desconto mínimo</h4>
            <div class="space-y-2 text-sm">
              <label class="flex items-center gap-2">
                <input type="radio" name="discount" [checked]="filterState().minDiscount===10" (change)="setMinDiscount(10)"> 10% ou mais
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="discount" [checked]="filterState().minDiscount===30" (change)="setMinDiscount(30)"> 30% ou mais
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="discount" [checked]="filterState().minDiscount===50" (change)="setMinDiscount(50)"> 50% ou mais
              </label>
            </div>
          </div>

          <button class="w-full px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  type="button" (click)="clearFilters()">
            Limpar filtros
          </button>
        </aside>

        <!-- Conteúdo principal -->
        <main class="flex-1 min-w-0">
          <!-- Barra de ordenação e layout -->
          <div class="bg-white rounded-lg shadow p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-600">Ordenar por:</span>
              <select class="border rounded-md px-2 py-1" [(ngModel)]="sortBy">
                <option value="relevance">Mais Relevantes</option>
                <option value="price-low">Menor Preço</option>
                <option value="price-high">Maior Preço</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-3 py-2 rounded hover:bg-gray-100" [class.text-blue-600]="view==='grid'" (click)="setView('grid')" title="Grade">▦</button>
              <button class="px-3 py-2 rounded hover:bg-gray-100" [class.text-blue-600]="view==='list'" (click)="setView('list')" title="Lista">≡</button>
            </div>
          </div>

          <!-- Grid de produtos -->
          <div [ngClass]="{
                 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch': view==='grid',
                 'space-y-4': view==='list'
               }">
            <ng-container *ngFor="let p of pagedProducts(); trackBy: trackById">
              <div *ngIf="view==='grid'" class="h-full">
                <app-storefront-item-card class="h-full" [product]="mapToStorefront(p)" [showActions]="true"></app-storefront-item-card>
              </div>
              <div *ngIf="view==='list'" class="bg-white rounded-lg shadow flex gap-4 p-3">
                <div class="w-40 h-40 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img [src]="p.images[0] || ''" [alt]="p.name" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-lg truncate">{{ p.name }}</h3>
                  <p class="text-gray-600 line-clamp-2" *ngIf="p.description">{{ p.description }}</p>
                  <div class="mt-2 text-blue-700 font-bold">{{ p.price | currency:'BRL' }}</div>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Paginação -->
          <div class="mt-8 flex justify-center" *ngIf="totalPages() > 1">
            <nav class="flex items-center gap-2">
              <button type="button" (click)="prevPage()" [disabled]="page===1"
                      class="px-3 py-2 rounded border bg-white disabled:opacity-50">«</button>

              <ng-container *ngFor="let p of visiblePages()">
                <span class="px-3 py-2" *ngIf="p === -1">…</span>
                <button *ngIf="p !== -1" type="button" (click)="setPage(p)"
                        [class]="'px-4 py-2 rounded ' + (page===p ? 'bg-blue-600 text-white' : 'bg-white border')">
                  {{ p }}
                </button>
              </ng-container>

              <button type="button" (click)="nextPage()" [disabled]="page===totalPages()"
                      class="px-3 py-2 rounded border bg-white disabled:opacity-50">»</button>
            </nav>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private catalog = inject(CatalogService);
  private dynamicFiltersService = inject(DynamicFiltersService);

  // Estado base
  allProducts = signal<CatalogProduct[]>([]);

  // UI/filters
  view: 'grid' | 'list' = 'grid';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' = 'relevance';
  
  // Estado dos filtros via serviço
  filterState = this.dynamicFiltersService.filterState;
  
  // Filtros dinâmicos gerados baseado nos produtos
  dynamicFilters = signal<DynamicFilter[]>([]);

  filteredProducts = computed(() => {
    let arr = this.dynamicFiltersService.applyFilters(this.allProducts());
    switch (this.sortBy) {
      case 'price-low': arr = [...arr].sort((a,b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case 'price-high': arr = [...arr].sort((a,b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case 'newest': arr = [...arr].sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()); break;
      default: break;
    }
    return arr;
  });

  // Paginação
  page = 1;
  pageSize = 8;
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)));
  pagedProducts = computed(() => {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  // Effect deve ser definido no nível da classe, não no ngOnInit
  private paginationEffect = effect(() => {
    const tp = this.totalPages();
    if (this.page > tp) {
      this.page = tp;
    }
    if (this.page < 1) {
      this.page = 1;
    }
  });

  ngOnInit(): void {
    this.catalog.listProducts().subscribe(list => {
      this.allProducts.set(list || []);
      if (list?.length) {
        const prices = list.map(p => p.price ?? 0);
        const priceMin = Math.min(...prices);
        const priceMax = Math.max(...prices);
        this.dynamicFiltersService.updatePriceRange(priceMin, priceMax, priceMax);
        
        // Gera filtros dinâmicos após carregar produtos
        const filters = this.dynamicFiltersService.generateDynamicFilters(list);
        this.dynamicFilters.set(filters);
      }
    });
  }

  // Helpers de UI
  setView(v: 'grid' | 'list') { this.view = v; }
  clearFilters() { 
    this.dynamicFiltersService.clearAllFilters(); 
    this.sortBy = 'relevance'; 
  }
  updatePriceFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    const current = this.filterState();
    this.dynamicFiltersService.updatePriceRange(
      current.priceRange.min, 
      current.priceRange.max, 
      Number(target.value)
    );
  }
  updateDynamicFilter(attributeName: string, selectedValues: string[]) {
    this.dynamicFiltersService.updateFilter(attributeName, selectedValues);
  }
  setMinDiscount(val: number) { 
    const current = this.filterState().minDiscount;
    this.dynamicFiltersService.updateMinDiscount(current === val ? null : val); 
  }
  trackById(_: number, item: CatalogProduct) { return item.id; }

  mapToStorefront(p: CatalogProduct) {
    return toStorefrontProduct({
      id: p.id, name: p.name, description: p.description,
      image: p.images[0] || '', images: p.images,
      price: p.price, oldPrice: (p as any).originalPrice, inStock: (p as any).inStock ?? true,
      category: 'Produtos', badges: []
    });
  }

  // Métodos de paginação
  setPage(p: number) { this.page = p; }
  nextPage() { if (this.page < this.totalPages()) this.page++; }
  prevPage() { if (this.page > 1) this.page--; }

  visiblePages(): number[] {
    const tp = this.totalPages();
    const cur = this.page;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    if (cur <= 4) return [1,2,3,4,5, -1, tp];
    if (cur >= tp - 3) return [1, -1, tp-4, tp-3, tp-2, tp-1, tp];
    return [1, -1, cur-1, cur, cur+1, -1, tp];
  }

}
