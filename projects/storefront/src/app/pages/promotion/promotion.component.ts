import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { RemoteHtmlInlineSectionComponent } from '../../sections/remote-html-inline-section.component';
import { PromoListSectionComponent } from '../../sections/promo-list-section.component';

type RemoteHtmlInline = { type: 'remoteHtmlInline', src: string, height?: string, hoistAssets?: boolean, copyBodyClasses?: boolean, executeScripts?: boolean };
type RemoteHtml = { type: 'remoteHtml', src: string, height?: string };
type PromoList = { type: 'promotionList', title?: string };
type Section = RemoteHtmlInline | RemoteHtml | PromoList;
type Layout = { id: string, vars?: Record<string,string> };
type PageData = { layout?: Layout, sections: Section[] };

@Component({
  standalone: true,
  selector: 'promotion-page',
  imports: [CommonModule, RouterModule, HttpClientModule,
    RemoteHtmlInlineSectionComponent, PromoListSectionComponent],
  templateUrl: './promotion.component.html'
})
export class PromotionComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly doc = inject(DOCUMENT);

  page = signal<PageData | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
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
    if (!this.isBrowser) return;
    const root = (this.doc?.documentElement) || document.documentElement;
    Object.entries(vars || {}).forEach(([k,v]) => root.style.setProperty(k, String(v)));
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

  getHoistAssets(section: Section): boolean {
    if (section.type === 'remoteHtmlInline') {
      return section.hoistAssets ?? true;
    }
    return true;
  }

  getCopyBodyClasses(section: Section): boolean {
    if (section.type === 'remoteHtmlInline') {
      return section.copyBodyClasses ?? true;
    }
    return true;
  }

  getExecuteScripts(section: Section): boolean {
    if (section.type === 'remoteHtmlInline') {
      return section.executeScripts ?? true;
    }
    return true;
  }

  getFullBleedClass(section: Section): string {
    const fullBleed = (section as any).fullBleed;
    return fullBleed 
      ? 'w-screen relative left-1/2 right-1/2 -mx-[50vw] pl-[50vw] pr-[50vw]'
      : 'mx-auto max-w-screen-xl px-4';
  }
}
