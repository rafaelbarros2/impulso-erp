export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface DynamicFilter {
  name: string;
  label: string;
  type: FilterType;
  options: FilterOption[];
  selectedValues: string[];
  isVisible: boolean;
}

export type FilterType = 'checkbox' | 'color' | 'size' | 'range' | 'radio';

export interface FilterConfiguration {
  [attributeName: string]: {
    type: FilterType;
    label: string;
    priority: number; // ordem de exibição
    colorMapping?: Record<string, string>; // para tipo 'color'
    rangeConfig?: {
      min: number;
      max: number;
      step: number;
      suffix?: string;
    };
  };
}

export interface FilterState {
  priceRange: {
    min: number;
    max: number;
    current: number;
  };
  dynamicFilters: Record<string, string[]>;
  minDiscount: number | null;
}