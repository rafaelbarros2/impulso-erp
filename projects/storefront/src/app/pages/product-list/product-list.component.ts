import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorefrontItemCardComponent } from '../../components/storefront-item-card/storefront-item-card.component';
import { CatalogService } from '../../services/catalog.service';
import { Product as CatalogProduct } from '../../models/catalog.models';
import { toStorefrontProduct } from '../../models/storefront-product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, StorefrontItemCardComponent],
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
            <input type="range" [min]="priceMin" [max]="priceMax"
                   [(ngModel)]="priceFilter" class="w-full">
            <div class="flex justify-between mt-1 text-sm text-gray-600">
              <span>{{ priceMin | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span class="font-semibold">{{ priceFilter | currency:'BRL':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <!-- Tamanhos -->
          <div class="mb-6">
            <h4 class="font-medium mb-2">Tamanhos</h4>
            <div class="grid grid-cols-4 gap-2">
              <button *ngFor="let s of sizesOptions"
                      type="button"
                      (click)="toggleSize(s)"
                      [ngClass]="{
                        'py-2 px-3 border rounded-lg text-sm transition-colors': true,
                        'bg-blue-600 text-white border-blue-600': selectedSizes.includes(s),
                        'border-gray-300 hover:bg-blue-50': !selectedSizes.includes(s)
                      }">
                {{ s }}
              </button>
            </div>
          </div>

          <!-- Cores -->
          <div class="mb-6">
            <h4 class="font-medium mb-2">Cores</h4>
            <div class="grid grid-cols-6 gap-2">
              <button *ngFor="let c of colorOptions"
                      type="button"
                      (click)="toggleColor(c)"
                      [class]="'w-10 h-10 rounded-full border-2 transition-transform ' + (selectedColors.includes(c) ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-110')"
                      [style.background-color]="colorToCss(c)"
                      [attr.aria-label]="c" [title]="c">
              </button>
            </div>
          </div>

          <!-- Desconto mínimo -->
          <div class="mb-6">
            <h4 class="font-medium mb-2">Desconto mínimo</h4>
            <div class="space-y-2 text-sm">
              <label class="flex items-center gap-2">
                <input type="radio" name="discount" [checked]="minDiscount===10" (change)="setMinDiscount(10)"> 10% ou mais
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="discount" [checked]="minDiscount===30" (change)="setMinDiscount(30)"> 30% ou mais
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="discount" [checked]="minDiscount===50" (change)="setMinDiscount(50)"> 50% ou mais
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
                 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6': view==='grid',
                 'space-y-4': view==='list'
               }">
            <ng-container *ngFor="let p of filteredProducts(); trackBy: trackById">
              <div *ngIf="view==='grid'">
                <app-storefront-item-card [product]="mapToStorefront(p)" [showActions]="true"></app-storefront-item-card>
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
        </main>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private catalog = inject(CatalogService);

  // Estado base
  allProducts = signal<CatalogProduct[]>([]);

  // UI/filters
  view: 'grid' | 'list' = 'grid';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' = 'relevance';
  priceMin = 0; priceMax = 1000; priceFilter = 1000;
  selectedSizes: string[] = [];
  selectedColors: string[] = [];
  minDiscount: number | null = null;
  sizesOptions = ['PP','P','M','G','GG','XG','37','38','39','40','41'];
  colorOptions = ['preto','branco','vermelho','azul','verde','amarelo','rosa','cinza','marrom','bege'];

  filteredProducts = computed(() => {
    let arr = this.applyAllFilters(this.allProducts());
    switch (this.sortBy) {
      case 'price-low': arr = [...arr].sort((a,b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case 'price-high': arr = [...arr].sort((a,b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case 'newest': arr = [...arr].sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()); break;
      default: break;
    }
    return arr;
  });

  ngOnInit(): void {
    this.catalog.listProducts().subscribe(list => {
      this.allProducts.set(list || []);
      if (list?.length) {
        const prices = list.map(p => p.price ?? 0);
        this.priceMin = Math.min(...prices);
        this.priceMax = Math.max(...prices);
        this.priceFilter = this.priceMax;
      }
    });
  }

  // Helpers de UI
  setView(v: 'grid' | 'list') { this.view = v; }
  clearFilters() { this.priceFilter = this.priceMax; this.sortBy = 'relevance'; this.selectedSizes = []; this.selectedColors = []; this.minDiscount = null; }
  toggleSize(size: string) { const s = new Set(this.selectedSizes); s.has(size) ? s.delete(size) : s.add(size); this.selectedSizes = Array.from(s); }
  toggleColor(color: string) { const s = new Set(this.selectedColors); s.has(color) ? s.delete(color) : s.add(color); this.selectedColors = Array.from(s); }
  setMinDiscount(val: number) { this.minDiscount = val; }
  trackById(_: number, item: CatalogProduct) { return item.id; }

  mapToStorefront(p: CatalogProduct) {
    return toStorefrontProduct({
      id: p.id, name: p.name, description: p.description,
      image: p.images[0] || '', images: p.images,
      price: p.price, oldPrice: (p as any).originalPrice, inStock: (p as any).inStock ?? true,
      category: 'Produtos', badges: []
    });
  }

  colorToCss(name: string): string {
    const map: Record<string,string> = { preto: '#000', branco: '#fff', vermelho: '#DC143C', azul: '#000080', verde: '#228B22', amarelo: '#FFD700', rosa: '#FF69B4', cinza: '#808080', marrom: '#8B4513', bege: '#F5F5DC' };
    return map[name] || name;
  }

  private applyAllFilters(list: CatalogProduct[]): CatalogProduct[] {
    return (list || [])
      .filter(p => (p.price ?? 0) <= (this.priceFilter || this.priceMax))
      .filter(p => {
        if (!this.minDiscount) return true;
        const op = (p as any).originalPrice as number | undefined;
        if (!op || !p.price) return false;
        const perc = Math.round(((op - p.price) / op) * 100);
        return perc >= (this.minDiscount as number);
      })
      .filter(p => {
        if (!this.selectedSizes.length) return true;
        const sizesAttr = (p.attributes || []).find(a => a.name.toLowerCase() === 'sizes');
        const values = (sizesAttr?.value || '').split(',').map(v => v.trim().toLowerCase());
        return this.selectedSizes.some(s => values.includes(String(s).toLowerCase()));
      })
      .filter(p => {
        if (!this.selectedColors.length) return true;
        const colorsAttr = (p.attributes || []).find(a => a.name.toLowerCase() === 'colors');
        const values = (colorsAttr?.value || '').split(',').map(v => v.trim().toLowerCase());
        return this.selectedColors.some(c => values.includes(c.toLowerCase()));
      });
  }
}

