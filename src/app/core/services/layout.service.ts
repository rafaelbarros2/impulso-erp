import { Injectable, signal, Signal } from '@angular/core';

// Tipos de layout predefinidos
export type LayoutType = 'grid' | 'minimal' | 'list';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  // Estados privados usando Signals
  private _currentLayout = signal<LayoutType>('grid');
  private _heroVisible = signal<boolean>(true);
  private _categoriesVisible = signal<boolean>(true);

  // Observables públicos
  currentLayout: Signal<LayoutType> = this._currentLayout.asReadonly();
  heroVisible: Signal<boolean> = this._heroVisible.asReadonly();
  categoriesVisible: Signal<boolean> = this._categoriesVisible.asReadonly();

  constructor() {
    // Carrega configurações salvas do localStorage
    this.loadSavedConfig();
  }

  /**
   * Alterna entre os layouts grid e minimal
   * @param layout Tipo de layout a ser aplicado
   */
  setLayout(layout: LayoutType): void {
    this._currentLayout.set(layout);
    localStorage.setItem('storefrontLayout', layout);
    console.log(`Layout alterado para: ${layout}`);
  }

  /**
   * Define a visibilidade do hero banner
   * @param isVisible O estado de visibilidade
   */
  setHeroVisible(isVisible: boolean): void {
    this._heroVisible.set(isVisible);
    localStorage.setItem('storefrontHeroVisible', isVisible.toString());
  }

  /**
   * Define a visibilidade das categorias
   * @param isVisible O estado de visibilidade
   */
  setCategoriesVisible(isVisible: boolean): void {
    this._categoriesVisible.set(isVisible);
    localStorage.setItem('storefrontCategoriesVisible', isVisible.toString());
  }
  
  /**
   * Alterna a visibilidade do hero banner.
   */
  toggleHero(): void {
    this.setHeroVisible(!this._heroVisible());
  }

  /**
   * Alterna a visibilidade das categorias.
   */
  toggleCategories(): void {
    this.setCategoriesVisible(!this._categoriesVisible());
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
      this._currentLayout.set(savedLayout);
    }

    // Carrega visibilidade do hero
    const savedHeroVisible = localStorage.getItem('storefrontHeroVisible');
    if (savedHeroVisible !== null) {
      this._heroVisible.set(savedHeroVisible === 'true');
    }

    // Carrega visibilidade das categorias
    const savedCategoriesVisible = localStorage.getItem('storefrontCategoriesVisible');
    if (savedCategoriesVisible !== null) {
      this._categoriesVisible.set(savedCategoriesVisible === 'true');
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
