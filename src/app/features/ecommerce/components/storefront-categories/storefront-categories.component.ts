import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

// Services
import { LayoutService } from '../../../../core/services/layout.service';

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  itemCount?: number;
  featured?: boolean;
  color?: string;
  route?: string;
}

export type StoreType = 'fashion' | 'tech' | 'beauty' | 'marketplace' | 'food' | 'home';

@Component({
  selector: 'app-storefront-categories',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule
  ],providers: [LayoutService],
  templateUrl: './storefront-categories.component.html',
  styleUrls: ['./storefront-categories.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ]),
    trigger('cardHover', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class StorefrontCategoriesComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Inputs
  @Input() categories: CategoryItem[] = this.getFashionCategories();
  @Input() title: string = 'Compre por Categoria';
  @Input() subtitle: string = 'Encontre exatamente o que você procura';
  @Input() showTitle: boolean = true;
  @Input() showSubtitle: boolean = true;
  @Input() showItemCount: boolean = true;
  @Input() gridColumns: number = 4; // 1, 2, 3, 4, 5, 6
  @Input() cardStyle: 'default' | 'minimal' | 'card' | 'image' = 'default';
  
  // Outputs
  @Output() categoryClicked = new EventEmitter<CategoryItem>();
  
  // Estados do componente
  isVisible: boolean = true;
  hoveredCategoryId: string | null = null;
  
  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.subscribeToLayoutChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Se inscreve nas mudanças de visibilidade das categorias
   */
  private subscribeToLayoutChanges(): void {
    this.layoutService.categoriesVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.isVisible = visible;
      });
  }

  /**
   * Manipula clique na categoria
   * @param category Categoria clicada
   */
  onCategoryClick(category: CategoryItem): void {
    this.categoryClicked.emit(category);
  }

  /**
   * Manipula hover na categoria
   * @param categoryId ID da categoria
   */
  onCategoryHover(categoryId: string | null): void {
    this.hoveredCategoryId = categoryId;
  }

  /**
   * Retorna classes CSS para o grid baseado na quantidade de colunas
   */
  get gridClasses(): string {
    const columnClasses: { [key: string]: string } = {
      '1': 'grid-cols-1',
      '2': 'grid-cols-1 md:grid-cols-2',
      '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      '5': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      '6': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };
    
    return `grid gap-6 ${columnClasses[String(this.gridColumns)] || columnClasses['4']}`;
  }

  /**
   * Retorna classes CSS para o card baseado no estilo
   */
  getCategoryCardClasses(category: CategoryItem): string {
    const baseClasses = 'category-card group cursor-pointer transition-all duration-300';
    const styleClasses = {
      'default': 'bg-gradient-to-br from-primary to-accent text-white p-8 rounded-2xl hover:shadow-xl hover:-translate-y-2',
      'minimal': 'bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-primary hover:shadow-md',
      'card': 'bg-white shadow-md rounded-xl p-6 hover:shadow-xl hover:-translate-y-1',
      'image': 'relative overflow-hidden rounded-2xl h-48 bg-gray-200 hover:shadow-2xl hover:-translate-y-2'
    };
    
    const featuredClass = category.featured ? 'ring-2 ring-primary ring-offset-2' : '';
    
    return `${baseClasses} ${styleClasses[this.cardStyle]} ${featuredClass}`;
  }

  /**
   * Retorna estilo inline para categoria com imagem de fundo
   */
  getCategoryImageStyle(category: CategoryItem): any {
    if (this.cardStyle === 'image' && category.image) {
      return {
        'background-image': `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${category.image})`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    }
    return {};
  }

  /**
   * Retorna cor personalizada para a categoria
   */
  getCategoryColor(category: CategoryItem): string {
    return category.color || 'var(--primary-color, #3B82F6)';
  }

  // ========================================
  // DADOS MOCKADOS POR TIPO DE LOJA
  // ========================================

  /**
   * Categorias para loja de moda
   */
  private getFashionCategories(): CategoryItem[] {
    return [
      {
        id: 'vestidos',
        name: 'Vestidos',
        description: 'Elegantes e casuais',
        icon: 'pi pi-star',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 156,
        featured: true,
        color: '#D81B60',
        route: '/produtos/vestidos'
      },
      {
        id: 'calcados',
        name: 'Calçados',
        description: 'Sapatos, tênis e botas',
        icon: 'pi pi-shopping-bag',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 89,
        color: '#8E24AA',
        route: '/produtos/calcados'
      },
      {
        id: 'blusas',
        name: 'Blusas & Tops',
        description: 'Variadas e estilosas',
        icon: 'pi pi-heart',
        image: 'https://images.unsplash.com/photo-1591047139829-d91aec6fc87e?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 203,
        color: '#FF6B6B',
        route: '/produtos/blusas'
      },
      {
        id: 'calcas',
        name: 'Calças & Jeans',
        description: 'Conforto e estilo',
        icon: 'pi pi-palette',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 124,
        color: '#4ECDC4',
        route: '/produtos/calcas'
      },
      {
        id: 'acessorios',
        name: 'Acessórios',
        description: 'Bolsas, joias e mais',
        icon: 'pi pi-diamond',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 67,
        color: '#FFB74D',
        route: '/produtos/acessorios'
      },
      {
        id: 'lingerie',
        name: 'Lingerie',
        description: 'Íntima e confortável',
        icon: 'pi pi-heart-fill',
        image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 45,
        color: '#F48FB1',
        route: '/produtos/lingerie'
      }
    ];
  }

  /**
   * Categorias para loja de tecnologia
   */
  private getTechCategories(): CategoryItem[] {
    return [
      {
        id: 'smartphones',
        name: 'Smartphones',
        description: 'iPhones, Samsung e mais',
        icon: 'pi pi-mobile',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 45,
        featured: true,
        color: '#2196F3',
        route: '/produtos/smartphones'
      },
      {
        id: 'notebooks',
        name: 'Notebooks',
        description: 'Para trabalho e jogos',
        icon: 'pi pi-desktop',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 32,
        color: '#9C27B0',
        route: '/produtos/notebooks'
      },
      {
        id: 'headphones',
        name: 'Fones & Audio',
        description: 'Qualidade sonora premium',
        icon: 'pi pi-volume-up',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 67,
        color: '#FF5722',
        route: '/produtos/audio'
      },
      {
        id: 'gaming',
        name: 'Gaming',
        description: 'Consoles e acessórios',
        icon: 'pi pi-play',
        image: 'https://images.unsplash.com/photo-1592840062012-803ba5cd0275?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 89,
        color: '#4CAF50',
        route: '/produtos/gaming'
      },
      {
        id: 'acessorios-tech',
        name: 'Acessórios',
        description: 'Cabos, capas e mais',
        icon: 'pi pi-cog',
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 234,
        color: '#607D8B',
        route: '/produtos/acessorios-tech'
      },
      {
        id: 'smart-home',
        name: 'Casa Inteligente',
        description: 'Automação residencial',
        icon: 'pi pi-home',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 56,
        color: '#FF9800',
        route: '/produtos/smart-home'
      }
    ];
  }

  /**
   * Categorias para loja de beleza
   */
  private getBeautyCategories(): CategoryItem[] {
    return [
      {
        id: 'skincare',
        name: 'Skincare',
        description: 'Cuidados com a pele',
        icon: 'pi pi-heart',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 123,
        featured: true,
        color: '#E91E63',
        route: '/produtos/skincare'
      },
      {
        id: 'maquiagem',
        name: 'Maquiagem',
        description: 'Base, batom e sombras',
        icon: 'pi pi-palette',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 189,
        color: '#9C27B0',
        route: '/produtos/maquiagem'
      },
      {
        id: 'cabelos',
        name: 'Cabelos',
        description: 'Shampoos e tratamentos',
        icon: 'pi pi-star',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 87,
        color: '#FF5722',
        route: '/produtos/cabelos'
      },
      {
        id: 'perfumes',
        name: 'Perfumes',
        description: 'Fragrâncias exclusivas',
        icon: 'pi pi-star-fill',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 45,
        color: '#673AB7',
        route: '/produtos/perfumes'
      }
    ];
  }

  /**
   * Categorias para marketplace
   */
  private getMarketplaceCategories(): CategoryItem[] {
    return [
      {
        id: 'eletronicos',
        name: 'Eletrônicos',
        description: 'Tecnologia e gadgets',
        icon: 'pi pi-mobile',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 1245,
        featured: true,
        color: '#2196F3',
        route: '/categoria/eletronicos'
      },
      {
        id: 'moda-marketplace',
        name: 'Moda & Beleza',
        description: 'Roupas e cosméticos',
        icon: 'pi pi-heart',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 2367,
        color: '#E91E63',
        route: '/categoria/moda'
      },
      {
        id: 'casa-jardim',
        name: 'Casa & Jardim',
        description: 'Móveis e decoração',
        icon: 'pi pi-home',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 890,
        color: '#4CAF50',
        route: '/categoria/casa'
      },
      {
        id: 'esportes',
        name: 'Esportes & Lazer',
        description: 'Fitness e atividades',
        icon: 'pi pi-play',
        image: 'https://images.unsplash.com/photo-1571019613540-996a5b75f281?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 567,
        color: '#FF5722',
        route: '/categoria/esportes'
      },
      {
        id: 'livros',
        name: 'Livros & Mídia',
        description: 'Literatura e entretenimento',
        icon: 'pi pi-book',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 1123,
        color: '#795548',
        route: '/categoria/livros'
      },
      {
        id: 'automotivo',
        name: 'Automotivo',
        description: 'Peças e acessórios',
        icon: 'pi pi-car',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400&h=300',
        itemCount: 445,
        color: '#607D8B',
        route: '/categoria/automotivo'
      }
    ];
  }

  /**
   * Carrega categorias baseado no tipo de loja
   * @param storeType Tipo da loja
   */
  loadCategoriesByStoreType(storeType: StoreType): void {
    switch (storeType) {
      case 'fashion':
        this.categories = this.getFashionCategories();
        this.title = 'Compre por Categoria';
        this.subtitle = 'Encontre a peça perfeita para você';
        break;
      case 'tech':
        this.categories = this.getTechCategories();
        this.title = 'Tecnologia & Gadgets';
        this.subtitle = 'Os melhores produtos tech do mercado';
        break;
      case 'beauty':
        this.categories = this.getBeautyCategories();
        this.title = 'Beleza & Cuidados';
        this.subtitle = 'Produtos de beleza premium';
        break;
      case 'marketplace':
        this.categories = this.getMarketplaceCategories();
        this.title = 'Todas as Categorias';
        this.subtitle = 'Milhares de produtos em diversas categorias';
        break;
      default:
        this.categories = this.getFashionCategories();
    }
  }

  /**
   * Carrega categorias de moda (padrão)
   */
  loadFashionCategories(): void {
    this.loadCategoriesByStoreType('fashion');
  }

  /**
   * Carrega categorias de tecnologia
   */
  loadTechCategories(): void {
    this.loadCategoriesByStoreType('tech');
  }

  /**
   * Carrega categorias de beleza
   */
  loadBeautyCategories(): void {
    this.loadCategoriesByStoreType('beauty');
  }

  /**
   * Carrega categorias de marketplace
   */
  loadMarketplaceCategories(): void {
    this.loadCategoriesByStoreType('marketplace');
  }

  /**
   * TrackBy function para otimizar renderização das categorias
   * @param index Índice da categoria
   * @param category Objeto da categoria
   */
  trackByCategory(index: number, category: CategoryItem): string {
    return category.id;
  }
}