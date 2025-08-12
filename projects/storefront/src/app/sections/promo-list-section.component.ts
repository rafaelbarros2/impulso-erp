import { Component, Input, OnInit, OnDestroy, OnChanges, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount?: string;
  originalPrice?: number;
  salePrice?: number;
  image?: string;
  category?: string;
  validUntil?: string;
  isActive?: boolean;
}

interface PromotionFilter {
  category?: string;
  minDiscount?: number;
  maxPrice?: number;
  searchTerm?: string;
  isActive?: boolean;
}

@Component({
  selector: 'promo-list-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="my-8">
      <h3 class="text-2xl font-bold mb-4">{{ title || 'Ofertas' }}</h3>
      
      <!-- Loading State -->
      <div *ngIf="loading()" class="p-4 border rounded text-gray-500 animate-pulse">
        Carregando promoções...
      </div>
      
      <!-- Error State -->
      <div *ngIf="error()" class="p-4 border rounded bg-red-50 text-red-700 border-red-200">
        {{ error() }}
      </div>
      
      <!-- Empty State -->
      <div *ngIf="!loading() && !error() && !promotionsSignal().length" 
           class="p-4 border rounded text-gray-500">
        Nenhuma promoção encontrada.
      </div>
      
      <!-- Promotions Grid -->
      <div *ngIf="!loading() && !error() && promotionsSignal().length" 
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let promo of filteredPromotions(); trackBy: trackById" 
             class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          
          <!-- Image -->
          <div *ngIf="promo.image" class="aspect-video bg-gray-200">
            <img [src]="promo.image" 
                 [alt]="promo.title"
                 class="w-full h-full object-cover"
                 (error)="onImageError($event)">
          </div>
          
          <!-- Content -->
          <div class="p-4">
            <h4 class="font-semibold text-lg mb-2 line-clamp-2">{{ promo.title }}</h4>
            <p *ngIf="promo.description" class="text-gray-600 text-sm mb-3 line-clamp-3">
              {{ promo.description }}
            </p>
            
            <!-- Discount Badge -->
            <div *ngIf="promo.discount" 
                 class="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              {{ promo.discount }}
            </div>
            
            <!-- Prices -->
            <div *ngIf="promo.originalPrice || promo.salePrice" class="flex items-center gap-2 mb-2">
              <span *ngIf="promo.salePrice" class="text-lg font-bold text-green-600">
                {{ formatCurrency(promo.salePrice) }}
              </span>
              <span *ngIf="promo.originalPrice && promo.salePrice" 
                    class="text-sm text-gray-500 line-through">
                {{ formatCurrency(promo.originalPrice) }}
              </span>
            </div>
            
            <!-- Category & Valid Until -->
            <div class="flex justify-between items-center text-xs text-gray-500">
              <span *ngIf="promo.category" class="bg-gray-100 px-2 py-1 rounded">
                {{ promo.category }}
              </span>
              <span *ngIf="promo.validUntil">
                Válido até {{ formatDate(promo.validUntil) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Debug Info (only in dev mode) -->
      <div *ngIf="showDebug()" class="mt-4 p-3 bg-gray-100 rounded text-xs">
        <strong>Debug:</strong><br>
        Filtros ativos: {{ stringifyFilter(currentFilter()) }}<br>
        Total de promoções: {{ promotionsSignal().length }}<br>
        Filtradas: {{ filteredPromotions().length }}
      </div>
    </section>
  `,
  styles: [`
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class PromoListSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title?: string;
  @Input() promotions: Promotion[] = [];
  
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  promotionsSignal = signal<Promotion[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentFilter = signal<PromotionFilter>({});
  showDebug = signal<boolean>(false);
  
  ngOnInit() {
    // Set initial promotions from input
    this.promotionsSignal.set(this.promotions);
    
    if (this.isBrowser) {
      this.initializePostMessageListener();
      this.checkDebugMode();
    }
  }
  
  ngOnChanges() {
    // Update promotions when input changes
    this.promotionsSignal.set(this.promotions);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializePostMessageListener() {
    // Listen for filter updates via postMessage
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'PROMOTION_FILTER_UPDATE') {
        console.log('[PromoList] Received filter via postMessage:', event.data.filter);
        this.currentFilter.set(event.data.filter || {});
      }
    });
  }
  
  private checkDebugMode() {
    const urlParams = new URLSearchParams(window.location.search);
    this.showDebug.set(urlParams.get('debug') === '1' || urlParams.get('debug') === 'true');
  }
  
  
  filteredPromotions = signal<Promotion[]>([]);
  
  constructor() {
    // Reactive filtering based on current filter using effects
    effect(() => {
      this.promotionsSignal();
      this.currentFilter();
      this.applyFilters();
    });
  }
  
  private applyFilters() {
    const filter = this.currentFilter();
    let filtered = this.promotionsSignal();
    
    if (filter.category) {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase().includes(filter.category!.toLowerCase())
      );
    }
    
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }
    
    if (filter.maxPrice) {
      filtered = filtered.filter(p => 
        !p.salePrice || p.salePrice <= filter.maxPrice!
      );
    }
    
    if (filter.isActive !== undefined) {
      filtered = filtered.filter(p => p.isActive === filter.isActive);
    }
    
    this.filteredPromotions.set(filtered);
  }
  
  trackById(index: number, item: Promotion): string {
    return item.id;
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
  
  stringifyFilter(filter: PromotionFilter): string {
    return JSON.stringify(filter);
  }
  
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY3Njk3ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTJweCI+UHJvbW/Dp8OjbzwvdGV4dD48L3N2Zz4=';
    }
  }
}
