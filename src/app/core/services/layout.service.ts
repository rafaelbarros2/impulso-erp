import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Interface para definir os tipos de layout disponíveis
export interface LayoutConfig {
  type: 'grid' | 'minimal';
  heroVisible: boolean;
  categoriesVisible: boolean;
}

// Tipos de layout predefinidos
export type LayoutType = 'grid' | 'minimal';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  
  // Estados privados
  private _currentLayout = new BehaviorSubject<LayoutType>('grid');
  private _heroVisible = new BehaviorSubject<boolean>(true);
  private _categoriesVisible = new BehaviorSubject<boolean>(true);

  // Observables públicos
  currentLayout$: Observable<LayoutType> = this._currentLayout.asObservable();
  heroVisible$: Observable<boolean> = this._heroVisible.asObservable();
  categoriesVisible$: Observable<boolean> = this._categoriesVisible.asObservable();

  constructor() {
    // Carrega configurações salvas do localStorage
    this.loadSavedConfig();
  }

  /**
   * Alterna entre os layouts grid e minimal
   * @param layout Tipo de layout a ser aplicado
   */
  setLayout(layout: LayoutType): void {
    this._currentLayout.next(layout);
    localStorage.setItem('storefrontLayout', layout);
    console.log(`Layout alterado para: ${layout}`);
  }

  /**
   * Retorna o layout atual
   */
  getCurrentLayout(): LayoutType {
    return this._currentLayout.value;
  }

  /**
   * Alterna a visibilidade da seção hero
   */
  toggleHero(): void {
    const currentState = this._heroVisible.value;
    const newState = !currentState;
    
    this._heroVisible.next(newState);
    localStorage.setItem('storefrontHeroVisible', newState.toString());
    
    console.log(`Hero Section ${newState ? 'mostrada' : 'ocultada'}`);
  }

  /**
   * Define a visibilidade da seção hero
   * @param visible Estado de visibilidade
   */
  setHeroVisible(visible: boolean): void {
    this._heroVisible.next(visible);
    localStorage.setItem('storefrontHeroVisible', visible.toString());
  }

  /**
   * Retorna se o hero está visível
   */
  isHeroVisible(): boolean {
    return this._heroVisible.value;
  }

  /**
   * Alterna a visibilidade da seção de categorias
   */
  toggleCategories(): void {
    const currentState = this._categoriesVisible.value;
    const newState = !currentState;
    
    this._categoriesVisible.next(newState);
    localStorage.setItem('storefrontCategoriesVisible', newState.toString());
    
    console.log(`Categories Section ${newState ? 'mostrada' : 'ocultada'}`);
  }

  /**
   * Define a visibilidade da seção de categorias
   * @param visible Estado de visibilidade
   */
  setCategoriesVisible(visible: boolean): void {
    this._categoriesVisible.next(visible);
    localStorage.setItem('storefrontCategoriesVisible', visible.toString());
  }

  /**
   * Retorna se as categorias estão visíveis
   */
  areCategoriesVisible(): boolean {
    return this._categoriesVisible.value;
  }

  /**
   * Retorna a configuração atual completa
   */
  getCurrentConfig(): LayoutConfig {
    return {
      type: this._currentLayout.value,
      heroVisible: this._heroVisible.value,
      categoriesVisible: this._categoriesVisible.value
    };
  }

  /**
   * Aplica uma configuração completa
   * @param config Configuração de layout
   */
  applyConfig(config: LayoutConfig): void {
    this.setLayout(config.type);
    this.setHeroVisible(config.heroVisible);
    this.setCategoriesVisible(config.categoriesVisible);
  }

  /**
   * Reseta todas as configurações para o padrão
   */
  resetToDefault(): void {
    this.setLayout('grid');
    this.setHeroVisible(true);
    this.setCategoriesVisible(true);
    console.log('Layout resetado para configurações padrão');
  }

  /**
   * Carrega configurações salvas do localStorage
   */
  private loadSavedConfig(): void {
    // Carrega layout
    const savedLayout = localStorage.getItem('storefrontLayout') as LayoutType;
    if (savedLayout && (savedLayout === 'grid' || savedLayout === 'minimal')) {
      this._currentLayout.next(savedLayout);
    }

    // Carrega visibilidade do hero
    const savedHeroVisible = localStorage.getItem('storefrontHeroVisible');
    if (savedHeroVisible !== null) {
      this._heroVisible.next(savedHeroVisible === 'true');
    }

    // Carrega visibilidade das categorias
    const savedCategoriesVisible = localStorage.getItem('storefrontCategoriesVisible');
    if (savedCategoriesVisible !== null) {
      this._categoriesVisible.next(savedCategoriesVisible === 'true');
    }
  }

  /**
   * Limpa todas as configurações salvas
   */
  clearSavedConfig(): void {
    localStorage.removeItem('storefrontLayout');
    localStorage.removeItem('storefrontHeroVisible');
    localStorage.removeItem('storefrontCategoriesVisible');
    this.resetToDefault();
  }
}