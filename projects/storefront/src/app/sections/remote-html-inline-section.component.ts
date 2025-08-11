import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'remote-html-inline',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="w-full" [style.minHeight]="height || '600px'">
    <ng-container *ngIf="safeHtml; else loading">
      <div #container class="remote-html" [innerHTML]="safeHtml"></div>
    </ng-container>
    <ng-template #loading>
      <div class="p-6 text-gray-500">Carregando…</div>
    </ng-template>
  </div>
  `
})
export class RemoteHtmlInlineSectionComponent implements OnChanges {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @Input() src!: string;
  @Input() height?: string;

  /** Quando true, promove <link>/<style> do HTML remoto para o <head> do host */
  @Input() hoistAssets: boolean = true;
  /** Quando true, copia classes do <body> remoto para document.body (ex.: 'bg-gray-50 dark') */
  @Input() copyBodyClasses: boolean = true;
  /** Quando true, reexecuta <script> do HTML remoto */
  @Input() executeScripts: boolean = true;

  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLElement>;

  safeHtml: SafeHtml | null = null;
  private lastHtml = '';

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['src'] && this.src) {
      // Força execução apenas no browser usando setTimeout
      setTimeout(() => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          console.log('[RemoteHtml] Browser detected, loading:', this.src);
          this.loadHtml(this.src);
        } else {
          console.log('[RemoteHtml] Server-side, skipping');
        }
      }, 0);
    }
  }

  private async loadHtml(url: string) {
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error(`Falha ao carregar HTML '${url}': ${res.status}`);
      this.lastHtml = await res.text();
      
      console.log('🔍 DEBUG HTML LOADING:');
      console.log('📄 Original HTML length:', this.lastHtml.length);
      console.log('📄 Has <style> tags:', this.lastHtml.includes('<style>'));
      console.log('📄 Has <script> tags:', this.lastHtml.includes('<script>'));
      console.log('📄 First 500 chars:', this.lastHtml.substring(0, 500));
      
      // Extrai apenas o conteúdo do <body> se for HTML completo
      let contentToRender = this.lastHtml;
      const bodyMatch = this.lastHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        contentToRender = bodyMatch[1];
        console.log('🎯 Extracted body content, length:', contentToRender.length);
      }
      
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(contentToRender);
      console.log('✅ SafeHtml created:', !!this.safeHtml);
      
      // Força detecção de mudança no Angular
      setTimeout(() => {
        if (this.hoistAssets) this.hoistHeadAssets();
        if (this.copyBodyClasses) this.applyBodyClassesFromHtml();
        if (this.executeScripts) this.execScripts();
        
        // Debug final DOM
        setTimeout(() => {
          const container = this.containerRef?.nativeElement;
          if (container) {
            console.log('🎯 Final DOM content:');
            console.log('📊 Container HTML length:', container.innerHTML.length);
            console.log('🎨 Has styles in DOM:', !!container.querySelector('style'));
            console.log('⚡ Has scripts in DOM:', !!container.querySelector('script'));
            console.log('📋 First 300 chars of rendered:', container.innerHTML.substring(0, 300));
            
            // Debug específico: verificar se os estilos foram aplicados
            const heroSection = container.querySelector('.hero-bg');
            if (heroSection) {
              const computedStyle = window.getComputedStyle(heroSection);
              console.log('🖼️ Hero background-image:', computedStyle.backgroundImage);
              console.log('🎨 Hero background-size:', computedStyle.backgroundSize);
              console.log('🎨 Hero height:', computedStyle.height);
            } else {
              console.log('❌ Hero section (.hero-bg) not found!');
              console.log('🔍 Available elements:', Array.from(container.querySelectorAll('*')).map(el => el.tagName + '.' + el.className).slice(0, 10));
            }
          }
        }, 500);
      }, 10);
    } catch (error) {
      console.error('[RemoteHtmlInline] Error loading HTML:', error);
    }
  }

  private hoistHeadAssets() {
    console.log('🎨 Hoisting head assets...');
    
    // MÉTODO 1: Pegar CSS do HTML original e injetar diretamente
    const cssMatch = this.lastHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (cssMatch) {
      console.log('💉 Found CSS in HTML, injecting directly into head...');
      cssMatch.forEach((styleTag, index) => {
        let cssContent = styleTag.replace(/<\/?style[^>]*>/gi, '');
        
        // Adiciona !important para forçar aplicação dos estilos principais
        cssContent = cssContent.replace(/background-image:\s*([^;]+);/g, 'background-image: $1 !important;');
        cssContent = cssContent.replace(/background-size:\s*([^;]+);/g, 'background-size: $1 !important;');
        cssContent = cssContent.replace(/background-position:\s*([^;]+);/g, 'background-position: $1 !important;');
        cssContent = cssContent.replace(/color:\s*([^;]+);/g, 'color: $1 !important;');
        cssContent = cssContent.replace(/background-color:\s*([^;]+);/g, 'background-color: $1 !important;');
        
        const styleElement = document.createElement('style');
        styleElement.textContent = cssContent;
        styleElement.setAttribute('data-remote-html', `inline-${index}`);
        
        // Remove duplicatas
        const existing = document.head.querySelector(`style[data-remote-html="inline-${index}"]`);
        if (existing) existing.remove();
        
        document.head.appendChild(styleElement);
        console.log('✅ CSS injected with !important:', cssContent.substring(0, 100) + '...');
      });
    }

    // MÉTODO 2: Links externos (FontAwesome, Google Fonts, etc) - FILTRANDO URLs VÁLIDAS
    const linkMatches = this.lastHtml.match(/<link[^>]+>/gi);
    if (linkMatches) {
      console.log('🔗 Found external links, filtering and injecting...');
      linkMatches.forEach(linkTag => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = linkTag;
        const linkElement = tempDiv.firstChild as HTMLLinkElement;
        
        if (linkElement && linkElement.href) {
          // Filtra apenas URLs externas válidas (https://) - ignora caminhos relativos
          if (linkElement.href.startsWith('https://')) {
            // Remove duplicatas
            const existing = document.head.querySelector(`link[href="${linkElement.href}"]`);
            if (!existing) {
              document.head.appendChild(linkElement.cloneNode(true));
              console.log('✅ External link injected:', linkElement.href);
            }
          } else {
            console.log('❌ Skipped local/relative link:', linkElement.href);
          }
        }
      });
    }

    // MÉTODO 3: Tradicional (caso algo sobrou no DOM)
    const host = this.containerRef?.nativeElement;
    if (host) {
      const nodes = Array.from(host.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"], link[rel="preload"][as="style"], style'));
      for (const n of nodes) {
        const href = (n as HTMLLinkElement).href || (n.getAttribute && n.getAttribute('href'));
        if (href && document.head.querySelector(`link[href="${href}"]`)) continue;
        document.head.appendChild(n.cloneNode(true));
        console.log('🔄 Moved to head:', href || 'inline style');
      }
    }
  }

  private applyBodyClassesFromHtml() {
    // Captura class="..." do <body> do HTML remoto
    const m = this.lastHtml.match(/<body[^>]*class="([^"]+)"/i);
    if (m && m[1]) {
      const classes = m[1].split(/\s+/).filter(Boolean);
      document.body.classList.add(...classes);
    }
  }

  private execScripts() {
    const host = this.containerRef?.nativeElement;
    if (!host) return;
    const scripts = Array.from(host.querySelectorAll('script')) as HTMLScriptElement[];
    for (const old of scripts) {
      const s = document.createElement('script');
      for (const { name, value } of Array.from(old.attributes)) {
        s.setAttribute(name, value);
      }
      if (old.textContent) s.textContent = old.textContent;
      old.replaceWith(s);
    }
  }
}
