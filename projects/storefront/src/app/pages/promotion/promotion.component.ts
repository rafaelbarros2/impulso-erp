import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { RemoteHtmlInlineSectionComponent } from '../../sections/remote-html-inline-section.component';
import { RemoteHtmlIframeSectionComponent } from '../../sections/remote-html-iframe-section.component';
import { PromoListSectionComponent } from '../../sections/promo-list-section.component';

type RemoteHtmlInline = { type: 'remoteHtmlInline', src: string, height?: string };
type RemoteHtml = { type: 'remoteHtml', src: string, height?: string };
type PromoList = { type: 'promotionList', title?: string };
type Section = RemoteHtmlInline | RemoteHtml | PromoList;
type Layout = { id: string, vars?: Record<string,string> };
type PageData = { layout?: Layout, sections: Section[] };

@Component({
  standalone: true,
  selector: 'promotion-page',
  imports: [CommonModule, RouterModule, HttpClientModule,
    RemoteHtmlInlineSectionComponent, RemoteHtmlIframeSectionComponent, PromoListSectionComponent],
  templateUrl: './promotion.component.html'
})
export class PromotionComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  page = signal<PageData | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    // Recarrega quando o query param mudar
    this.route.queryParamMap.subscribe(async (params) => {
      const url = params.get('pageUrl');
      if (!url) {
        this.loading.set(false);
        this.error.set('Parâmetro "pageUrl" não informado.');
        return;
      }
      await this.loadPage(url);
    });
  }

  private async loadPage(url: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const page = await this.http.get<PageData>(url, { withCredentials: false }).toPromise();
      // Opcional: aplicar vars de layout como CSS custom properties
      this.applyLayoutVars(page?.layout?.vars || {});
      this.page.set(page || { sections: [] });
    } catch (e: any) {
      this.error.set('Falha ao carregar a página: ' + (e?.message || 'erro desconhecido'));
      this.page.set({ sections: [] });
    } finally {
      this.loading.set(false);
    }
  }

  private applyLayoutVars(vars: Record<string,string>) {
    const root = document.documentElement;
    Object.entries(vars || {}).forEach(([k,v]) => {
      root.style.setProperty(k, String(v));
    });
  }

  getSrc(section: Section): string {
    if (section.type === 'remoteHtmlInline' || section.type === 'remoteHtml') {
      return section.src;
    }
    return '';
  }

  getHeight(section: Section): string | undefined {
    if (section.type === 'remoteHtmlInline' || section.type === 'remoteHtml') {
      return section.height;
    }
    return undefined;
  }

  getTitle(section: Section): string {
    if (section.type === 'promotionList') {
      return section.title || 'Ofertas';
    }
    return '';
  }
}
