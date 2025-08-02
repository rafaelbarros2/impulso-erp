import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService, LayoutType } from '../../../../core/services/layout.service';
import { Button } from "primeng/button";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { StorefrontThemeSelectorComponent } from '../storefront-theme-selector/storefront-theme-selector.component';
import { StorefrontBackgroundSelectorComponent } from '../storefront-background-selector/storefront-background-selector.component';
import { TooltipModule } from 'primeng/tooltip';

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
  imports: [Button, CommonModule, InputSwitchModule, FormsModule, StorefrontThemeSelectorComponent, StorefrontBackgroundSelectorComponent,TooltipModule],
  templateUrl: './storefront-header.component.html',
  styleUrl: './storefront-header.component.scss',
  standalone: true,
  providers: [LayoutService]
})
export class StorefrontHeaderComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Inputs
  @Input() storeName: string = 'FashionERP Store';
  @Input() cartInfo: CartInfo = { itemCount: 0 };
  @Input() showLogo: boolean = true;
  @Input() showControls: boolean = true;
  
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
  
  // Estados do componente
  currentLayout: LayoutType = 'grid';
  heroVisible: boolean = true;
  categoriesVisible: boolean = true;
  
  // Estados da UI
  isMobileMenuOpen: boolean = false;
  
  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.subscribeToLayoutChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Se inscreve nas mudanças de layout
   */
  private subscribeToLayoutChanges(): void {
    // Layout atual
    this.layoutService.currentLayout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(layout => {
        this.currentLayout = layout;
      });
    
    // Visibilidade do hero
    this.layoutService.heroVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.heroVisible = visible;
      });
    
    // Visibilidade das categorias
    this.layoutService.categoriesVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.categoriesVisible = visible;
      });
  }

  /**
   * Altera o layout
   * @param layout Tipo de layout
   */
  onLayoutChange(layout: LayoutType): void {
    this.layoutService.setLayout(layout);
    console.log(`Layout alterado para: ${layout}`);
  }

  /**
   * Alterna a visibilidade do hero
   */
  toggleHero(): void {
    this.layoutService.toggleHero();
  }

  /**
   * Alterna a visibilidade das categorias
   */
  toggleCategories(): void {
    this.layoutService.toggleCategories();
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
   * Verifica se um layout está ativo
   * @param layout Tipo de layout
   */
  isLayoutActive(layout: LayoutType): boolean {
    return this.currentLayout === layout;
  }

  /**
   * Retorna o ícone do toggle do hero
   */
  get heroToggleIcon(): string {
    return this.heroVisible ? 'pi pi-eye' : 'pi pi-eye-slash';
  }

  /**
   * Retorna o tooltip do toggle do hero
   */
  get heroToggleTooltip(): string {
    return this.heroVisible ? 'Ocultar Hero Section' : 'Mostrar Hero Section';
  }

  /**
   * Retorna o ícone do toggle das categorias
   */
  get categoriesToggleIcon(): string {
    return this.categoriesVisible ? 'pi pi-eye' : 'pi pi-eye-slash';
  }

  /**
   * Retorna o tooltip do toggle das categorias
   */
  get categoriesToggleTooltip(): string {
    return this.categoriesVisible ? 'Ocultar Categorias' : 'Mostrar Categorias';
  }

  /**
   * Retorna a classe CSS para o botão de layout ativo
   * @param layout Tipo de layout
   */
  getLayoutButtonClass(layout: LayoutType): string {
    const baseClass = 'layout-btn';
    return this.isLayoutActive(layout) ? `${baseClass} active` : baseClass;
  }

  /**
   * Retorna a classe CSS para o toggle do hero
   */
  get heroToggleClass(): string {
    const baseClass = 'hero-toggle-btn';
    return this.heroVisible ? `${baseClass} active` : baseClass;
  }

  /**
   * Retorna a classe CSS para o toggle das categorias
   */
  get categoriesToggleClass(): string {
    const baseClass = 'categories-toggle-btn';
    return this.categoriesVisible ? `${baseClass} active` : baseClass;
  }

  /**
   * Formata o valor total do carrinho
   */
  get formattedCartTotal(): string {
    if (this.cartInfo.totalValue) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(this.cartInfo.totalValue);
    }
    return '';
  }

  /**
   * Verifica se deve mostrar o total do carrinho
   */
  get shouldShowCartTotal(): boolean {
    return this.cartInfo.totalValue !== undefined && this.cartInfo.totalValue > 0;
  }
}
