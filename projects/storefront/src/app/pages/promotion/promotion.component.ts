import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';

// SEÇÕES
import { RemoteHtmlInlineSectionComponent } from '../../sections/remote-html-inline-section.component';
import { RemoteHtmlIframeSectionComponent } from '../../sections/remote-html-iframe-section.component';
import { PromoListSectionComponent } from '../../sections/promo-list-section.component';
import { SimpleHtmlInjectorComponent } from '../../components/simple-html-injector/simple-html-injector.component';

// HERO
// Simplified: render only backend HTML

// 🔹 IMG fallback (evita HERO "vazio" quando não vem image no JSON)
const HERO_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&auto=format&fit=crop&w=1600';

type RemoteHtmlInline = {
  type: 'remoteHtmlInline';
  src: string;
  height?: string;
  fullBleed?: boolean;
  executeScripts?: boolean;
  injectTailwindCdn?: boolean;
  copyBodyClasses?: boolean;
  hoistAssets?: boolean;
};

type RemoteHtml = { type: 'remoteHtml'; src: string; height?: string; fullBleed?: boolean };

type PromoList = { 
  type: 'promotionList'; 
  title?: string; 
  fullBleed?: boolean;
  items?: Array<{
    id: string;
    title: string;
    description?: string;
    discount?: string;
    originalPrice?: number;
    salePrice?: number;
    image?: string;
    category?: string;
    validUntil?: string;
    isActive?: boolean;
  }>;
};

type Hero = {
  type: 'hero';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  image?: string;
  classes?: string;
  ctaClass?: string;
  fullBleed?: boolean;
  height?: string;
};

interface ExtractedTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  [key: string]: string;
}
type Section = RemoteHtmlInline | RemoteHtml | PromoList | Hero | FullHtml;

type Layout = { id: string; vars?: Record<string, string> };

type PageData = { layout?: Layout; sections: Section[] };

// Suporte a tipo 'fullHtml' para o template
type FullHtml = { type: 'fullHtml'; src?: string; htmlContent?: string; height?: string; fullBleed?: boolean; autoExtractTheme?: boolean };
type AnySection = Section | FullHtml;

@Component({
  standalone: true,
  selector: 'promotion-page',
  imports: [CommonModule, RouterModule, HttpClientModule, SimpleHtmlInjectorComponent],
  templateUrl: './promotion.component.html',
})
export class PromotionComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  htmlUrl = signal<string | undefined>(undefined);
  resolvedHeight = signal<string>('100vh');

  constructor() {
    console.log('[PromotionComponent] Initialized');
    if (!this.isBrowser) {
      // SSR: mantém estado estável para hidratação; client fará o load
      return;
    }
    this.route.queryParamMap.subscribe(async (params) => {
      const raw = params.get('pageUrl');
      const pageId = params.get('pageId');
      console.log('[PromotionComponent] pageUrl:', raw, 'pageId:', pageId);

      let finalUrl: string | null = null;
      if (raw) {
        finalUrl = this.normalizeAbsoluteUrl(raw);
      } else if (pageId) {
        const apiBase = (environment.apiUrl || '').replace(/\/$/, '');
        finalUrl = `${apiBase}/storefront/pages/${pageId}`;
      }

      if (!finalUrl) {
        this.loading.set(false);
        this.error.set('Informe ?pageUrl= ou ?pageId= na URL.');
        return;
      }

      await this.loadPage(finalUrl);
    });
  }

  private async loadPage(url: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      console.log('[PromotionComponent] Carregando página de:', url);
      
      // Busca o JSON de configuração
      const data: any = await this.http.get(url, { responseType: 'text', withCredentials: false }).toPromise();
      let pageConfig: any;
      
      try {
        pageConfig = JSON.parse(data);
      } catch {
        // Se não é JSON, trata como HTML direto
        this.htmlUrl.set(url);
        this.loading.set(false);
        return;
      }

      // Processa o JSON para encontrar seção com HTML
      if (pageConfig && typeof pageConfig === 'object') {
        const sections: any[] = pageConfig.sections || [];
        const htmlSection = sections.find(s => 
          s?.type === 'fullHtml' || 
          s?.type === 'remoteHtmlInline' || 
          s?.type === 'remoteHtml'
        );
        
        if (htmlSection) {
          // Se tem src, resolve a URL completa
          if (htmlSection.src) {
            const resolvedUrl = new URL(String(htmlSection.src), url).href;
            this.htmlUrl.set(resolvedUrl);
            console.log('[PromotionComponent] HTML URL resolvida:', resolvedUrl);
          }
          
          // Define altura se especificada
          if (htmlSection.height) {
            this.resolvedHeight.set(String(htmlSection.height));
          }
        } else {
          this.error.set('Nenhuma seção de HTML encontrada no JSON');
        }
      }
      
      this.loading.set(false);
    } catch (e: any) {
      console.error('[PromotionComponent] Erro ao carregar página:', e);
      this.error.set('Falha ao carregar o conteúdo: ' + (e?.message || 'erro desconhecido'));
      this.loading.set(false);
    }
  }
  

  private normalizeAbsoluteUrl(raw: string): string {
    let s = String(raw || '').trim();
    if (!s) return s;
    // Fix malformed like "http:localhost:8080/..." → "http://localhost:8080/..."
    if (/^https?:[^/]/i.test(s)) {
      s = s.replace(/^https?:/i, (m) => m + '//');
    }
    // If now valid absolute, return
    if (/^https?:\/\//i.test(s)) return s;
    // If looks like hostname[:port]/path (no scheme), assume http
    if (/^(localhost|127\.0\.0\.1|\[::1\]|[a-z0-9.-]+\.[a-z]{2,})(:\d+)?\//i.test(s)) {
      return 'http://' + s;
    }
    // Dev prefix: if user passes "tenants/..." or "/tenants/..." assume backend on :8080
    if (s.includes('tenants/')) {
      const path = s.startsWith('/') ? s : '/' + s;
      return `${window.location.origin}${path}`;
    }
    // Fallback to same-origin
    return s.startsWith('/') ? window.location.origin + s : s;
  }

  // Handlers para eventos do SimpleHtmlInjector
  onHtmlLoaded(): void {
    console.log('[PromotionComponent] HTML carregado com sucesso');
    this.loading.set(false);
  }

  onHtmlError(errorMsg: string): void {
    console.error('[PromotionComponent] Erro ao carregar HTML:', errorMsg);
    this.error.set(errorMsg);
    this.loading.set(false);
  }
}
