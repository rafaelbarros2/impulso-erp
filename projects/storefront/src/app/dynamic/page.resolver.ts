import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConfigBootstrapService } from '../core/config-bootstrap.service';
import { PageConfig } from '../core/config.types';
import { CurrentLayoutService } from '../layout/current-layout.service';
import { LAYOUT_REGISTRY } from '../layout/layout-registry';

// Ajuste este import para o seu ThemeService real
import { ThemeService } from '../theme/theme.service';

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

    // tenta via site.pages do boot
    const site = this.boot.getSite();
    const pageUrl = previewPageUrl ?? site.pages[slug];

    if (!pageUrl) {
      // fallback básico: public/tenants/demo/pages/{slug}.json
      return await this.http.get<PageConfig>(`/tenants/demo/pages/${slug}.json`).toPromise();
    }

    const cfg = await this.http.get<PageConfig>(pageUrl).toPromise();

    // aplica layout e tokens da página
    const layoutId = (cfg.layout?.id ?? site.defaultLayout ?? 'classic') as keyof typeof LAYOUT_REGISTRY;
    const preset = LAYOUT_REGISTRY[layoutId];
    const vars = { ...(preset?.vars ?? {}), ...(cfg.layout?.vars ?? {}) };
    this.layout.set(layoutId, vars);

    if (cfg.theme?.tokens) this.theme.applyTokens(cfg.theme.tokens);

    return cfg;
  }
}
