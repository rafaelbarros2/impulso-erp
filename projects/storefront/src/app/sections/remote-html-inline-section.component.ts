import { Component, Input, ViewChild, ElementRef, inject, OnChanges, SimpleChanges } from '@angular/core';
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

  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLElement>;

  @Input() height?: string;
  @Input() hoistAssets: boolean = true;
  @Input() copyBodyClasses: boolean = true;
  @Input() executeScripts: boolean = true;
  @Input() injectTailwindCdn: boolean = false;

  private _src: string | null = null;
  private baseUrl: string | null = null;
  private abort?: AbortController;
  private lastHtml = '';
  safeHtml: SafeHtml | null = null;

  @Input() set src(value: string | null) {
    this._src = (value || '').trim() || null;
    if (this._src) {
      if (this._src.includes('/tenants/')) {
        const path = this._src.startsWith('/') ? this._src : '/' + this._src;
        this.baseUrl = `http://localhost:8080${path}`;
      } else {
        try { this.baseUrl = new URL(this._src, window.location.href).toString(); } catch { this.baseUrl = this._src; }
      }
    }
  }
  get src(): string | null { return this._src; }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    if (changes['src'] && this._src) {
      console.debug('[Inline] set src:', this._src);
      this.loadHtml(this._src);
    }
  }

  private async loadHtml(url: string) {
    try {
      this.safeHtml = null;
      if (this.abort) this.abort.abort();
      this.abort = new AbortController();

      console.debug('[Inline] fetching:', url);
      const res = await fetch(url, { credentials: 'omit', signal: this.abort.signal });
      const html = await res.text();
      this.lastHtml = html;
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);

      queueMicrotask(() => {
        if (this.hoistAssets) this.hoistHeadAssets();
        if (this.injectTailwindCdn) this.ensureTailwindCdn();
        if (this.copyBodyClasses) this.applyBodyClassesFromHtml();
        if (this.executeScripts) this.execScripts();
      });
    } catch (e) {
      console.error('[Inline] load error:', e);
    }
  }

  private absolutize(u: string | null | undefined): string | null {
    if (!u) return null;
    const s = u.trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^(data:|blob:|javascript:)/i.test(s)) return s;
    try {
      return new URL(s, this.baseUrl || this._src || window.location.href).toString();
    } catch {
      return s;
    }
  }

  private hoistHeadAssets() {
    const host = this.containerRef?.nativeElement;
    if (!host) return;

    host.querySelectorAll('style').forEach((n, i) => {
      const s = document.createElement('style');
      s.setAttribute('data-remote-inline-style', String(i));
      s.textContent = n.textContent || '';
      document.head.appendChild(s);
      n.remove();
    });

    host.querySelectorAll('link[rel],link[href]').forEach((l: Element) => {
      const rel = l.getAttribute('rel') || 'stylesheet';
      const hrefAbs = this.absolutize(l.getAttribute('href'));
      if (!hrefAbs) return;
      if (document.head.querySelector(`link[href="${hrefAbs}"]`)) return;
      const clone = document.createElement('link');
      clone.rel = rel;
      clone.href = hrefAbs;
      const as = l.getAttribute('as'); if (as) (clone as any).as = as;
      document.head.appendChild(clone);
      l.remove();
    });
  }

  private applyBodyClassesFromHtml() {
    const m = this.lastHtml.match(/<body[^>]*class="([^"]+)"/i);
    if (m && m[1]) m[1].split(/\s+/).filter(Boolean).forEach(c => document.body.classList.add(c));
  }

  private ensureTailwindCdn() {
    const usesTW = /(h-|w-|p-|m-|grid|flex|bg-|text-|md:|lg:|xl:|rounded|shadow)/.test(this.lastHtml);
    const already = !!document.querySelector('script[src*="tailwindcss.com"]');
    if (!usesTW || already) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.tailwindcss.com';
    s.setAttribute('data-remote-tailwind-cdn', '1');
    document.head.appendChild(s);
  }

  private execScripts() {
    const host = this.containerRef?.nativeElement;
    if (!host) return;
    const olds = Array.from(host.querySelectorAll('script')) as HTMLScriptElement[];
    olds.forEach(old => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach(a => {
        if (a.name === 'src') {
          const abs = this.absolutize(a.value);
          if (abs) s.setAttribute('src', abs);
        } else {
          s.setAttribute(a.name, a.value);
        }
      });
      if (old.textContent) s.textContent = old.textContent;
      old.replaceWith(s);
    });
    console.debug('[Inline] executed scripts:', olds.length);
  }
}
