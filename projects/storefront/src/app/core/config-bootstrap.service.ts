import { Injectable, inject, Provider, APP_INITIALIZER } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { SiteConfig, ThemeConfig } from './config.types';
import { CurrentLayoutService } from '../layout/current-layout.service';
import { LAYOUT_REGISTRY } from '../layout/layout-registry';
import { extractSubdomain } from './extract-subdomain';

// Ajuste este import para o seu ThemeService real
import { ThemeService } from '../theme/theme.service';
import { environment } from '../../environments/environment';

const SITE_KEY = makeStateKey<SiteConfig>('site-config');

@Injectable({ providedIn:'root' })
export class ConfigBootstrapService {
  private http = inject(HttpClient);
  private ts = inject(TransferState);
  private layout = inject(CurrentLayoutService);
  private theme = inject(ThemeService);

  site: SiteConfig = { pages: {} };

  async init(): Promise<void> {
    const host = typeof location !== 'undefined' ? location.host : 'localhost';
    const sub = extractSubdomain(host) ?? 'demo';
    const apiBase = (environment.apiUrl || '').replace(/\/$/, '');

    // 1) Busca o tema/layout do backend (usando base da env)
    let themeCfg: ThemeConfig | null = null;
    try {
      themeCfg = await this.http.get<ThemeConfig>(`${apiBase}/ecommerce/themes/${sub}`).toPromise();
    } catch (e) {
      // Fallback: usar configuração mínima local se API estiver indisponível
      try {
        const site = await this.http.get<SiteConfig>('/site.json').toPromise();
        this.site = site || { pages: {} };
      } catch {
        this.site = { pages: {} };
      }
    }

    // 2) Aplica tokens (se houver)
    if (themeCfg?.tokens) this.theme.applyTokens(themeCfg.tokens);

    // 3) Seleciona layout default e aplica vars (preset + vars do backend)
    const layoutId = (themeCfg?.defaults?.layoutId ?? this.site.defaultLayout ?? 'classic') as keyof typeof LAYOUT_REGISTRY;
    const preset = LAYOUT_REGISTRY[layoutId];
    const vars = { ...(preset?.vars ?? {}), ...(themeCfg?.layouts?.[layoutId]?.vars ?? {}) };
    this.layout.set(layoutId, vars);

    // 4) Deriva um SiteConfig mínimo (usa pages do backend se existir)
    if (themeCfg) {
      this.site = {
        defaultLayout: layoutId,
        pages: themeCfg?.pages ?? this.site.pages ?? {}
      };
    }

    // disponibiliza via TransferState
    this.ts.set(SITE_KEY, this.site);
  }

  getSite(): SiteConfig { return this.site; }
}

export function provideConfigInitializer(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    deps: [ConfigBootstrapService],
    useFactory: (svc: ConfigBootstrapService) => () => svc.init()
  };
}
