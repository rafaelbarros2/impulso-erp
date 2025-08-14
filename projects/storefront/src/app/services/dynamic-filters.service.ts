import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/catalog.models';
import { 
  DynamicFilter, 
  FilterConfiguration, 
  FilterOption, 
  FilterState, 
  FilterType 
} from '../models/dynamic-filters.models';

@Injectable({
  providedIn: 'root'
})
export class DynamicFiltersService {
  private _filterState = signal<FilterState>({
    priceRange: { min: 0, max: 1000, current: 1000 },
    dynamicFilters: {},
    minDiscount: null
  });

  // Configuração padrão de filtros - pode ser expandida conforme necessário
  private defaultFilterConfig: FilterConfiguration = {
    'tamanho': {
      type: 'size',
      label: 'Tamanhos',
      priority: 1
    },
    'tamanhos': {
      type: 'size', 
      label: 'Tamanhos',
      priority: 1
    },
    'sizes': {
      type: 'size',
      label: 'Tamanhos', 
      priority: 1
    },
    'cor': {
      type: 'color',
      label: 'Cores',
      priority: 2,
      colorMapping: {
        'preto': '#000000',
        'branco': '#FFFFFF',
        'vermelho': '#DC143C',
        'azul': '#000080',
        'verde': '#228B22',
        'amarelo': '#FFD700',
        'rosa': '#FF69B4',
        'cinza': '#808080',
        'marrom': '#8B4513',
        'bege': '#F5F5DC'
      }
    },
    'cores': {
      type: 'color',
      label: 'Cores',
      priority: 2,
      colorMapping: {
        'preto': '#000000',
        'branco': '#FFFFFF', 
        'vermelho': '#DC143C',
        'azul': '#000080',
        'verde': '#228B22',
        'amarelo': '#FFD700',
        'rosa': '#FF69B4',
        'cinza': '#808080',
        'marrom': '#8B4513',
        'bege': '#F5F5DC'
      }
    },
    'colors': {
      type: 'color',
      label: 'Cores',
      priority: 2,
      colorMapping: {
        'preto': '#000000',
        'branco': '#FFFFFF',
        'vermelho': '#DC143C', 
        'azul': '#000080',
        'verde': '#228B22',
        'amarelo': '#FFD700',
        'rosa': '#FF69B4',
        'cinza': '#808080',
        'marrom': '#8B4513',
        'bege': '#F5F5DC'
      }
    },
    'marca': {
      type: 'checkbox',
      label: 'Marcas',
      priority: 3
    },
    'marcas': {
      type: 'checkbox',
      label: 'Marcas', 
      priority: 3
    },
    'brands': {
      type: 'checkbox',
      label: 'Marcas',
      priority: 3
    },
    'material': {
      type: 'checkbox',
      label: 'Material',
      priority: 4
    },
    'categoria': {
      type: 'checkbox',
      label: 'Categoria',
      priority: 5
    },
    'tipo': {
      type: 'checkbox',
      label: 'Tipo',
      priority: 6
    },
    'estilo': {
      type: 'checkbox',
      label: 'Estilo',
      priority: 7
    }
  };

  filterState = this._filterState.asReadonly();

  /**
   * Gera filtros dinâmicos baseado nos produtos disponíveis
   */
  generateDynamicFilters(products: Product[]): DynamicFilter[] {
    const attributeGroups = this.groupAttributesByName(products);
    const filters: DynamicFilter[] = [];

    Object.entries(attributeGroups).forEach(([attributeName, values]) => {
      const config = this.getFilterConfig(attributeName);
      if (!config) return;

      const options = this.createFilterOptions(values);
      if (options.length === 0) return;

      filters.push({
        name: attributeName,
        label: config.label,
        type: config.type,
        options: options.sort((a, b) => (b.count || 0) - (a.count || 0)),
        selectedValues: this._filterState().dynamicFilters[attributeName] || [],
        isVisible: options.length > 1 // Só mostra se há mais de uma opção
      });
    });

    // Ordena por prioridade
    return filters.sort((a, b) => {
      const priorityA = this.getFilterConfig(a.name)?.priority || 999;
      const priorityB = this.getFilterConfig(b.name)?.priority || 999;
      return priorityA - priorityB;
    });
  }

  /**
   * Atualiza o estado de um filtro específico
   */
  updateFilter(attributeName: string, selectedValues: string[]): void {
    const current = this._filterState();
    this._filterState.set({
      ...current,
      dynamicFilters: {
        ...current.dynamicFilters,
        [attributeName]: selectedValues
      }
    });
  }

  /**
   * Atualiza a faixa de preço
   */
  updatePriceRange(min: number, max: number, current: number): void {
    const state = this._filterState();
    this._filterState.set({
      ...state,
      priceRange: { min, max, current }
    });
  }

  /**
   * Atualiza desconto mínimo
   */
  updateMinDiscount(discount: number | null): void {
    const current = this._filterState();
    this._filterState.set({
      ...current,
      minDiscount: discount
    });
  }

  /**
   * Limpa todos os filtros
   */
  clearAllFilters(): void {
    const current = this._filterState();
    this._filterState.set({
      priceRange: { ...current.priceRange, current: current.priceRange.max },
      dynamicFilters: {},
      minDiscount: null
    });
  }

  /**
   * Aplica todos os filtros a uma lista de produtos
   */
  applyFilters(products: Product[]): Product[] {
    const state = this._filterState();
    
    return products.filter(product => {
      // Filtro de preço
      if ((product.price || 0) > state.priceRange.current) {
        return false;
      }

      // Filtro de desconto
      if (state.minDiscount !== null) {
        const originalPrice = (product as any).originalPrice;
        if (!originalPrice || !product.price) return false;
        const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
        if (discountPercent < state.minDiscount) return false;
      }

      // Filtros dinâmicos
      for (const [attributeName, selectedValues] of Object.entries(state.dynamicFilters)) {
        if (selectedValues.length === 0) continue;

        const productAttribute = product.attributes?.find(
          attr => attr.name.toLowerCase() === attributeName.toLowerCase()
        );

        if (!productAttribute) return false;

        const productValues = productAttribute.value
          .split(',')
          .map(v => v.trim().toLowerCase());

        const hasMatch = selectedValues.some(selectedValue =>
          productValues.includes(selectedValue.toLowerCase())
        );

        if (!hasMatch) return false;
      }

      return true;
    });
  }

  /**
   * Obtém configuração de um filtro específico
   */
  getFilterConfig(attributeName: string) {
    return this.defaultFilterConfig[attributeName.toLowerCase()];
  }

  /**
   * Obtém mapeamento de cor para CSS
   */
  getColorMapping(attributeName: string): Record<string, string> | undefined {
    return this.getFilterConfig(attributeName)?.colorMapping;
  }

  private groupAttributesByName(products: Product[]): Record<string, Set<string>> {
    const groups: Record<string, Set<string>> = {};

    products.forEach(product => {
      product.attributes?.forEach(attr => {
        const attrName = attr.name.toLowerCase();
        if (!groups[attrName]) {
          groups[attrName] = new Set();
        }

        // Divide valores separados por vírgula
        attr.value.split(',').forEach(value => {
          const trimmedValue = value.trim();
          if (trimmedValue) {
            groups[attrName].add(trimmedValue);
          }
        });
      });
    });

    return groups;
  }

  private createFilterOptions(values: Set<string>): FilterOption[] {
    return Array.from(values).map(value => ({
      value: value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count: 1 // Pode ser calculado baseado nos produtos reais
    }));
  }
}