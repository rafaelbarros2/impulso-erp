import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Product as CatalogProduct } from '../../models/catalog.models';
import { SeoService } from '../../services/seo.service';
import { StorefrontItemCardComponent } from '../../components/storefront-item-card/storefront-item-card.component';
import { toStorefrontProduct } from '../../models/storefront-product.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StorefrontItemCardComponent],
  template: `
    <div class="container mx-auto px-4 py-6" *ngIf="category as cat">
      <!-- Breadcrumb e título -->
      <div class="mb-6">
        <a routerLink="/" class="text-sm text-gray-500 hover:text-gray-700">Home</a>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-sm text-gray-700">{{ cat.name }}</span>
        <h1 class="text-2xl font-bold mt-2">{{ cat.name }}</h1>
        <p class="text-gray-600" *ngIf="cat.description">{{ cat.description }}</p>
      </div>

      <div class="flex gap-6">
        <!-- Sidebar de Filtros (estilo index.html) -->
        <aside class="hidden lg:block w-72 bg-white rounded-xl shadow p-4 h-max">
          <h3 class="text-lg font-semibold mb-3">Filtros</h3>

          <!-- Faixa de Preço -->
          <div class="mb-6">
            <h4 class="font-medium mb-2">Faixa de Preço</h4>
            <input type="range" [min]="priceMin" [max]="priceMax"
                   [(ngModel)]="priceFilter" (change)="onPriceChange()"
                   class="w-full">
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
                      [attr.aria-label]="c"
                      [title]="c">
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
              <select class="border rounded-md px-2 py-1"
                      [(ngModel)]="sortBy" (change)="applySorting()">
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

          <!-- Rodapé informativo -->
          <div class="mt-8 text-xs text-gray-500">
            <strong>TransferState:</strong> dados carregados para "{{ cat.slug }}" às {{ getCurrentTime() }}
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class CategoryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  
  // Dados resolvidos pelo categoryResolver
  category: Category = this.route.snapshot.data['category'];

  // Estado de UI/filtragem
  view: 'grid' | 'list' = 'grid';
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'newest' = 'relevance';
  priceMin = 0;
  priceMax = 1000;
  priceFilter = 1000;
  selectedSizes: string[] = [];
  selectedColors: string[] = [];
  minDiscount: number | null = null;
  sizesOptions: string[] = ['PP','P','M','G','GG','XG','37','38','39','40','41'];
  colorOptions: string[] = ['preto','branco','vermelho','azul','verde','amarelo','rosa','cinza','marrom','bege'];

  productsSignal = signal<CatalogProduct[]>([]);
  filteredProducts = computed(() => {
    const max = this.priceFilter || this.priceMax;
    let arr = (this.productsSignal() || []).filter(p => (p.price ?? 0) <= max);

    // Desconto mínimo (se houver originalPrice)
    if (this.minDiscount) {
      arr = arr.filter(p => {
        const op = (p as any).originalPrice as number | undefined;
        if (!op || !p.price) return false;
        const perc = Math.round(((op - p.price) / op) * 100);
        return perc >= (this.minDiscount as number);
      });
    }

    // Tamanhos
    if (this.selectedSizes.length) {
      arr = arr.filter(p => {
        const sizesAttr = (p.attributes || []).find(a => a.name.toLowerCase() === 'sizes');
        if (!sizesAttr?.value) return false;
        const values = sizesAttr.value.split(',').map(s => s.trim().toLowerCase());
        return this.selectedSizes.some(s => values.includes(String(s).toLowerCase()));
      });
    }

    // Cores
    if (this.selectedColors.length) {
      arr = arr.filter(p => {
        const colorsAttr = (p.attributes || []).find(a => a.name.toLowerCase() === 'colors');
        if (!colorsAttr?.value) return false;
        const values = colorsAttr.value.split(',').map(c => c.trim().toLowerCase());
        return this.selectedColors.some(c => values.includes(c.toLowerCase()));
      });
    }

    switch (this.sortBy) {
      case 'price-low':
        arr = [...arr].sort((a,b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-high':
        arr = [...arr].sort((a,b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'newest':
        arr = [...arr].sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      default:
        // relevance: mantém ordem original
        break;
    }
    return arr;
  });

  ngOnInit(): void {
    // Configura SEO para a categoria
    const baseUrl = this.getBaseUrl();
    if (this.category) {
      this.seoService.setCategorySeo(this.category, baseUrl);
    }
    // Inicializa estado de produtos e limites de preço
    const products = this.category ? (this.category.products ?? []) : [];
    this.productsSignal.set(products);
    if (products.length) {
      const prices = products.map(p => p.price ?? 0);
      this.priceMin = Math.min(...prices);
      this.priceMax = Math.max(...prices);
      this.priceFilter = this.priceMax;
    }
  }

  ngOnDestroy(): void {
    // Limpa SEO tags ao sair da página
    this.seoService.clearSeoTags();
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://storefront.example.com'; // Fallback para SSR
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  // UI handlers
  setView(v: 'grid' | 'list') { this.view = v; }
  applySorting() { /* computed reage a sortBy */ }
  onPriceChange() { /* computed reage a priceFilter */ }

  clearFilters() {
    // Sem filtros = preço no máximo e ordenação por relevância
    this.priceFilter = this.priceMax;
    this.sortBy = 'relevance';
    this.selectedSizes = [];
    this.selectedColors = [];
    this.minDiscount = null;
  }

  trackById(index: number, item: CatalogProduct): string { return item.id; }

  mapToStorefront(p: CatalogProduct) {
    // Ajusta objeto para o card reutilizável
    return toStorefrontProduct({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.images[0] || '',
      images: p.images,
      price: p.price,
      oldPrice: (p as any).originalPrice,
      inStock: (p as any).inStock ?? true,
      category: this.category.name || 'Geral',
      badges: []
    });
  }

  toggleSize(size: string) {
    const set = new Set(this.selectedSizes);
    set.has(size) ? set.delete(size) : set.add(size);
    this.selectedSizes = Array.from(set);
  }

  toggleColor(color: string) {
    const set = new Set(this.selectedColors);
    set.has(color) ? set.delete(color) : set.add(color);
    this.selectedColors = Array.from(set);
  }

  setMinDiscount(val: number) {
    this.minDiscount = val;
  }

  colorToCss(name: string): string {
    const map: Record<string,string> = {
      preto: '#000000', branco: '#FFFFFF', vermelho: '#DC143C', azul: '#000080',
      verde: '#228B22', amarelo: '#FFD700', rosa: '#FF69B4', cinza: '#808080',
      marrom: '#8B4513', bege: '#F5F5DC'
    };
    return map[name] || name;
  }
}
