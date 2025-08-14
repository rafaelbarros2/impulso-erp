import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigBootstrapService } from '../core/config-bootstrap.service';
import { PageConfig } from '../core/config.types';
import { CurrentLayoutService } from '../layout/current-layout.service';
import { LAYOUT_REGISTRY } from '../layout/layout-registry';

// Ajuste este import para o seu ThemeService real
import { ThemeService } from '../theme/theme.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn:'root' })
export class PageResolver implements Resolve<PageConfig> {
  private http = inject(HttpClient);
  private boot = inject(ConfigBootstrapService);
  private layout = inject(CurrentLayoutService);
  private theme = inject(ThemeService);

  async resolve(route: ActivatedRouteSnapshot): Promise<PageConfig> {
    const slug = route.paramMap.get('slug') ?? 'home';
    const href = typeof location !== 'undefined' ? location.href : 'http://localhost/';
    const url = new URL(href);

    // preview direto por querystring
    const previewPageUrl = url.searchParams.get('pageUrl');
    const pageId = url.searchParams.get('pageId'); // permite busca por UUID
    const tenantParam = url.searchParams.get('tenant') || 'demo';

    // tenta via site.pages do boot
    const site = this.boot.getSite();
    const pageUrl = previewPageUrl ?? site.pages[slug];

    // 1) Se pageId informado, tenta carregar do backend por UUID
    if (pageId) {
      const apiBase = (environment.apiUrl || '').replace(/\/$/, '');
      try {
        const cfgById = await this.http.get<PageConfig>(`${apiBase}/storefront/pages/${pageId}`).toPromise();
        // aplica layout/tokens e retorna
        const layoutId = (cfgById.layout?.id ?? site.defaultLayout ?? 'classic') as keyof typeof LAYOUT_REGISTRY;
        const preset = LAYOUT_REGISTRY[layoutId];
        const vars = { ...(preset?.vars ?? {}), ...(cfgById.layout?.vars ?? {}) };
        this.layout.set(layoutId, vars);
        if (cfgById.theme?.tokens) this.theme.applyTokens(cfgById.theme.tokens);
        return cfgById;
      } catch (e) {
        // Continua para outras estratégias
        console.warn('[PageResolver] Falha ao carregar por UUID, tentando outras fontes…', e);
      }
    }

    // 2) Se tiver URL direta configurada (no site.json/backend), usa
    if (pageUrl) {
      const cfg = await this.http.get<PageConfig>(pageUrl).toPromise();
      const layoutId = (cfg.layout?.id ?? site.defaultLayout ?? 'classic') as keyof typeof LAYOUT_REGISTRY;
      const preset = LAYOUT_REGISTRY[layoutId];
      const vars = { ...(preset?.vars ?? {}), ...(cfg.layout?.vars ?? {}) };
      this.layout.set(layoutId, vars);
      if (cfg.theme?.tokens) this.theme.applyTokens(cfg.theme.tokens);
      return cfg;
    }

    // 3) Fallback: página local servida pelo Angular
    return await this.http.get<PageConfig>(`/tenants/${tenantParam}/pages/${slug}.json`).toPromise();
  }
}
