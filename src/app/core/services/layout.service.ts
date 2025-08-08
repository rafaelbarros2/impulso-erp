import { Injectable, signal, Signal, effect } from '@angular/core';
import { LayoutType } from '../models';

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
    
    // Effect para debug - monitora mudanças de layout
    effect(() => {
      console.log('🔄 Layout Signal atualizado para:', this._currentLayout());
    });
  }

  /**
   * Alterna entre os layouts grid e minimal
   * @param layout Tipo de layout a ser aplicado
   */
  setLayout(layout: LayoutType): void {
    console.log('📋 LayoutService.setLayout chamado com:', layout);
    console.log('📋 Layout anterior:', this._currentLayout());
    
    this._currentLayout.set(layout);
    localStorage.setItem('storefrontLayout', layout);
    
    console.log('📋 Layout alterado para:', this._currentLayout());
    console.log('📋 LocalStorage atualizado');
    
    // Dispara evento customizado para forçar atualização se necessário
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('layoutChanged', { 
        detail: { layout } 
      }));
    }, 0);
  }

  /**
   * Define a visibilidade do hero banner
   * @param isVisible O estado de visibilidade
   */
  setHeroVisible(isVisible: boolean): void {
    console.log('🏠 LayoutService.setHeroVisible chamado com:', isVisible);
    this._heroVisible.set(isVisible);
    localStorage.setItem('storefrontHeroVisible', isVisible.toString());
  }

  /**
   * Define a visibilidade das categorias
   * @param isVisible O estado de visibilidade
   */
  setCategoriesVisible(isVisible: boolean): void {
    console.log('📂 LayoutService.setCategoriesVisible chamado com:', isVisible);
    this._categoriesVisible.set(isVisible);
    localStorage.setItem('storefrontCategoriesVisible', isVisible.toString());
  }
  
  /**
   * Alterna a visibilidade do hero banner.
   */
  toggleHero(): void {
    const currentState = this._heroVisible();
    console.log('🏠 LayoutService.toggleHero - Estado atual:', currentState);
    this.setHeroVisible(!currentState);
  }

  /**
   * Alterna a visibilidade das categorias.
   */
  toggleCategories(): void {
    const currentState = this._categoriesVisible();
    console.log('📂 LayoutService.toggleCategories - Estado atual:', currentState);
    this.setCategoriesVisible(!currentState);
  }

  /**
   * Reseta todas as configurações para o padrão
   */
  resetToDefault(): void {
    console.log('🔄 LayoutService.resetToDefault chamado');
    this.setLayout('grid');
    this.setHeroVisible(true);
    this.setCategoriesVisible(true);
    console.log('Layout resetado para configurações padrão');
  }

  /**
   * Carrega configurações salvas do localStorage
   */
  private loadSavedConfig(): void {
    console.log('📂 Carregando configurações salvas do localStorage...');
    
    // Carrega layout
    const savedLayout = localStorage.getItem('storefrontLayout') as LayoutType;
    if (savedLayout && (savedLayout === 'grid' || savedLayout === 'minimal' || savedLayout === 'list')) {
      console.log('📋 Layout salvo encontrado:', savedLayout);
      this._currentLayout.set(savedLayout);
    } else {
      console.log('📋 Nenhum layout salvo encontrado, usando padrão: grid');
    }

    // Carrega visibilidade do hero
    const savedHeroVisible = localStorage.getItem('storefrontHeroVisible');
    if (savedHeroVisible !== null) {
      const isVisible = savedHeroVisible === 'true';
      console.log('🏠 Hero visibility salva encontrada:', isVisible);
      this._heroVisible.set(isVisible);
    }

    // Carrega visibilidade das categorias
    const savedCategoriesVisible = localStorage.getItem('storefrontCategoriesVisible');
    if (savedCategoriesVisible !== null) {
      const isVisible = savedCategoriesVisible === 'true';
      console.log('📂 Categories visibility salva encontrada:', isVisible);
      this._categoriesVisible.set(isVisible);
    }
    
    console.log('📂 Configurações carregadas. Estado final:');
    console.log('   - Layout:', this._currentLayout());
    console.log('   - Hero:', this._heroVisible());
    console.log('   - Categories:', this._categoriesVisible());
  }

  /**
   * Limpa todas as configurações salvas
   */
  clearSavedConfig(): void {
    console.log('🗑️ Limpando configurações salvas...');
    localStorage.removeItem('storefrontLayout');
    localStorage.removeItem('storefrontHeroVisible');
    localStorage.removeItem('storefrontCategoriesVisible');
    this.resetToDefault();
  }

  /**
   * Método para debug - retorna o estado atual
   */
  getDebugState(): any {
    return {
      currentLayout: this._currentLayout(),
      heroVisible: this._heroVisible(),
      categoriesVisible: this._categoriesVisible(),
      localStorage: {
        layout: localStorage.getItem('storefrontLayout'),
        hero: localStorage.getItem('storefrontHeroVisible'),
        categories: localStorage.getItem('storefrontCategoriesVisible')
      }
    };
  }
}