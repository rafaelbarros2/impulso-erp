import { Injectable, signal, effect } from '@angular/core';

export type LayoutType = 'grid' | 'minimal' | 'list';

@Injectable({ providedIn: 'root' })
export class CoreLayoutService {
  private _layout = signal<LayoutType>('grid');
  private _heroVisible = signal(true);
  private _categoriesVisible = signal(true);

  readonly layout = this._layout.asReadonly();
  readonly heroVisible = this._heroVisible.asReadonly();
  readonly categoriesVisible = this._categoriesVisible.asReadonly();

  constructor() {
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      const L = localStorage.getItem('storefrontLayout');
      const H = localStorage.getItem('storefrontHeroVisible');
      const C = localStorage.getItem('storefrontCategoriesVisible');
      if (L) this._layout.set(L as LayoutType);
      if (H) this._heroVisible.set(H === '1');
      if (C) this._categoriesVisible.set(C === '1');

      effect(() => localStorage.setItem('storefrontLayout', this._layout()));
      effect(() => localStorage.setItem('storefrontHeroVisible', this._heroVisible() ? '1' : '0'));
      effect(() => localStorage.setItem('storefrontCategoriesVisible', this._categoriesVisible() ? '1' : '0'));
    }
  }

  setLayout(v: LayoutType) { this._layout.set(v); }
  toggleHero() { this._heroVisible.update(v => !v); }
  toggleCategories() { this._categoriesVisible.update(v => !v); }
}
