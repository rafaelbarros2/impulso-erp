import { Injectable, signal, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { BackgroundConfig } from '../../models/interfaces/background.interfaces';

@Injectable({ providedIn: 'root' })
export class CoreBackgroundService {
  private catalog = new Map<string, BackgroundConfig>([
    ['solid-primary', { id: 'solid-primary', name: 'Primário', type: 'solid', value: 'var(--color-primary-600)' }],
    ['gradient-hero', { id: 'gradient-hero', name: 'Gradiente do Tema', type: 'gradient',
      value: 'linear-gradient(135deg, var(--hero-start, var(--color-primary-500)), var(--hero-end, var(--color-primary-700)))' }],
    ['image-1', { id: 'image-1', name: 'Blue Hero', type: 'image',
      value: 'url(https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1600&auto=format&fit=crop)',
      backgroundSize: 'cover', backgroundPosition: 'center', overlayOpacity: .35, overlayColor: 'rgba(0,0,0,.35)' }],
  ]);

  private _currentId = signal<string>(this.loadId() || 'gradient-hero');
  readonly currentId = this._currentId.asReadonly();

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Optional() @Inject(DOCUMENT) private doc: Document | null,
  ) {
    this.isBrowser = isPlatformBrowser(platformId) && !!this.doc;

    if (this.isBrowser) {
      const cfg = this.catalog.get(this._currentId())!;
      this.applyCssVars(cfg);
    }
  }

  list(): BackgroundConfig[] { return Array.from(this.catalog.values()); }
  get current(): BackgroundConfig { return this.catalog.get(this._currentId())!; }

  set(id: string) {
    if (!this.catalog.has(id)) return;
    this._currentId.set(id);
    this.saveId(id);
    if (this.isBrowser) this.applyCssVars(this.catalog.get(id)!);
  }

  private applyCssVars(cfg: BackgroundConfig) {
    if (!this.isBrowser) return;
    const root = this.doc!.documentElement;
    if (cfg.type === 'image') {
      root.style.setProperty('--hero-bg',
        `${cfg.value} ${cfg.backgroundPosition || 'center'}/${cfg.backgroundSize || 'cover'} ${cfg.backgroundRepeat || 'no-repeat'}`);
    } else {
      root.style.setProperty('--hero-bg', cfg.value || 'transparent');
    }
    root.style.setProperty('--hero-overlay-color', cfg.overlayColor || 'transparent');
    root.style.setProperty('--hero-overlay-opacity', String(cfg.overlayOpacity ?? 0));
  }

  private loadId(): string | null { try { return localStorage.getItem('storefrontBgId'); } catch { return null; } }
  private saveId(id: string) { try { localStorage.setItem('storefrontBgId', id); } catch {} }
}
