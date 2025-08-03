import { Component, OnInit, inject, Input, Output, EventEmitter, Signal, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { LayoutService, LayoutType } from '../../../../core/services/layout.service';
import { StorefrontThemeSelectorComponent } from '../storefront-theme-selector/storefront-theme-selector.component';
import { StorefrontBackgroundSelectorComponent } from '../storefront-background-selector/storefront-background-selector.component';

interface LayoutOption {
  type: LayoutType;
  label: string;
  icon: string;
  description: string;
}

interface CartInfo {
  itemCount: number;
  totalValue?: number;
}

@Component({
  selector: 'app-storefront-header',
  imports: [
    ButtonModule, 
    CommonModule, 
    InputSwitchModule, 
    FormsModule, 
    StorefrontThemeSelectorComponent, 
    StorefrontBackgroundSelectorComponent, 
    TooltipModule
  ],
  templateUrl: './storefront-header.component.html',
  styleUrl: './storefront-header.component.scss',
  standalone: true
})
export class StorefrontHeaderComponent implements OnInit {
  
  // Injeção de dependências
  private readonly layoutService = inject(LayoutService);
  private readonly currencyPipe = inject(CurrencyPipe);

  // Inputs
  @Input() storeName: string = 'FashionERP Store';
  @Input() cartInfo: CartInfo = { itemCount: 0 };
  @Input() showLogo: boolean = true;
  @Input() showControls: boolean = true;
  @Input() showHeroControls: boolean = true;
  @Input() showCategoriesControls: boolean = true;
  
  // Outputs
  @Output() cartClicked = new EventEmitter<void>();
  @Output() logoClicked = new EventEmitter<void>();

  // Layout options
  layoutOptions: LayoutOption[] = [
    {
      type: 'grid',
      label: 'Grid',
      icon: 'pi pi-th-large',
      description: 'Layout em grid moderno'
    },
    {
      type: 'minimal',
      label: 'Minimal',
      icon: 'pi pi-stop',
      description: 'Layout minimalista'
    }
  ];

  // Estados reativos usando Signals do serviço
  currentLayout: Signal<LayoutType> = this.layoutService.currentLayout;
  heroVisible: Signal<boolean> = this.layoutService.heroVisible;
  categoriesVisible: Signal<boolean> = this.layoutService.categoriesVisible;
  
  // Estados da UI
  isMobileMenuOpen: boolean = false;
  
  constructor() {
    // Effect para debugar mudanças de layout
    effect(() => {
      //console.log('🎯 Header detectou mudança de layout:', this.currentLayout());
    });
  }

  ngOnInit(): void {
    //console.log('🎯 Header inicializado. Layout atual:', this.currentLayout());
    
    // Debug inicial
    setTimeout(() => {
      //console.log('🎯 Debug estado do header:');
      //console.log('   - Layout atual:', this.currentLayout());
      //console.log('   - Hero visível:', this.heroVisible());
      //console.log('   - Categories visíveis:', this.categoriesVisible());
      //console.log('   - Layout service debug:', this.layoutService.getDebugState());
    }, 1000);
  }

  /**
   * CORRIGIDO: Altera o layout
   * @param layout Tipo de layout a ser aplicado
   */
  onLayoutChange(layout: LayoutType): void {
    //console.log('🔄 Header.onLayoutChange chamado');
    //console.log('🔄 Layout solicitado:', layout);
    //console.log('🔄 Layout atual antes da mudança:', this.currentLayout());
    
    // Força um delay pequeno para garantir que o estado seja atualizado
    setTimeout(() => {
      this.layoutService.setLayout(layout);
      //console.log('🔄 Layout alterado via service');
      
      // Verifica se a mudança foi efetiva
      setTimeout(() => {
        //console.log('🔄 Verificação pós-mudança:', this.currentLayout());
      }, 100);
    }, 0);
  }

  /**
   * Alterna a visibilidade do hero (agora chamando o service)
   */
  toggleHero(): void {
    //console.log('🏠 Header.toggleHero chamado');
    //console.log('🏠 Estado atual do hero:', this.heroVisible());
    this.layoutService.toggleHero();
    
    setTimeout(() => {
      //console.log('🏠 Novo estado do hero:', this.heroVisible());
    }, 100);
  }

  /**
   * Alterna a visibilidade das categorias (agora chamando o service)
   */
  toggleCategories(): void {
    //console.log('📂 Header.toggleCategories chamado');
    //console.log('📂 Estado atual das categories:', this.categoriesVisible());
    this.layoutService.toggleCategories();
    
    setTimeout(() => {
      //console.log('📂 Novo estado das categories:', this.categoriesVisible());
    }, 100);
  }

  /**
   * Manipula clique no carrinho
   */
  onCartClick(): void {
    this.cartClicked.emit();
  }

  /**
   * Manipula clique no logo
   */
  onLogoClick(): void {
    this.logoClicked.emit();
  }

  /**
   * Alterna menu mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Fecha menu mobile
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * CORRIGIDO: Verifica se um layout está ativo
   * @param layout Tipo de layout
   */
  isLayoutActive(layout: LayoutType): boolean {
    const isActive = this.currentLayout() === layout;
    //console.log(`🎯 isLayoutActive(${layout}):`, isActive, '(atual:', this.currentLayout(), ')');
    return isActive;
  }

  /**
   * Retorna o ícone do toggle do hero
   */
  get heroToggleIcon(): string {
    return this.heroVisible() ? 'pi pi-eye' : 'pi pi-eye-slash';
  }

  /**
   * Retorna o tooltip do toggle do hero
   */
  get heroToggleTooltip(): string {
    return this.heroVisible() ? 'Ocultar Hero Section' : 'Mostrar Hero Section';
  }

  /**
   * Retorna o ícone do toggle das categorias
   */
  get categoriesToggleIcon(): string {
    return this.categoriesVisible() ? 'pi pi-eye' : 'pi pi-eye-slash';
  }

  /**
   * Retorna o tooltip do toggle das categorias
   */
  get categoriesToggleTooltip(): string {
    return this.categoriesVisible() ? 'Ocultar Categorias' : 'Mostrar Categorias';
  }

  /**
   * CORRIGIDO: Retorna a classe CSS para o botão de layout ativo
   * @param layout Tipo de layout
   */
  getLayoutButtonClass(layout: LayoutType): string {
    const baseClass = 'layout-btn';
    const isActive = this.isLayoutActive(layout);
    const finalClass = isActive ? `${baseClass} active` : baseClass;
    
    //console.log(`🎨 getLayoutButtonClass(${layout}):`, finalClass);
    return finalClass;
  }

  /**
   * Retorna a classe CSS para o toggle do hero
   */
  get heroToggleClass(): string {
    const baseClass = 'hero-toggle-btn';
    return this.heroVisible() ? `${baseClass} active` : baseClass;
  }

  /**
   * Retorna a classe CSS para o toggle das categorias
   */
  get categoriesToggleClass(): string {
    const baseClass = 'categories-toggle-btn';
    return this.categoriesVisible() ? `${baseClass} active` : baseClass;
  }

  /**
   * Formata o valor total do carrinho
   */
  get formattedCartTotal(): string {
    if (this.cartInfo.totalValue) {
      return this.currencyPipe.transform(this.cartInfo.totalValue, 'BRL', 'symbol', '1.2-2', 'pt-BR') || '';
    }
    return '';
  }

  /**
   * Verifica se deve mostrar o total do carrinho
   */
  get shouldShowCartTotal(): boolean {
    return this.cartInfo.totalValue !== undefined && this.cartInfo.totalValue > 0;
  }

  /**
   * Método para debug - mostra o estado atual
   */
  debugCurrentState(): void {
    //console.log('🐛 DEBUG Estado atual do Header:');
    //console.log('   - Layout:', this.currentLayout());
    //console.log('   - Hero:', this.heroVisible());
    //console.log('   - Categories:', this.categoriesVisible());
    //console.log('   - Service Debug:', this.layoutService.getDebugState());
  }
}