import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  @Input() src!: string;
  @Input() height?: string;

  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLElement>;

  safeHtml: SafeHtml | null = null;

  private lastHtml = '';

private async loadHtml(url: string) {
  const res = await fetch(url, { credentials: 'omit' });
  if (!res.ok) throw new Error(`Falha ao carregar HTML '${url}': ${res.status}`);
  this.lastHtml = await res.text();
  this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.lastHtml);
  queueMicrotask(() => { this.hoistHeadAssets(); this.copyBodyClasses(); this.execScripts(); });
}

private hoistHeadAssets() {
  const host = this.containerRef?.nativeElement;
  if (!host) return;
  host.querySelectorAll('link[rel="stylesheet"],link[rel="preconnect"],link[rel="preload"][as="style"],style')
    .forEach(n => document.head.appendChild(n.cloneNode(true)));
}

private copyBodyClasses() {
  const m = this.lastHtml.match(/<body[^>]*class="([^"]+)"/i);
  if (m && m[1]) document.body.classList.add(...m[1].split(/\s+/).filter(Boolean));
}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['src'] && this.src) {
      await this.loadHtml(this.src);
    }
  }

  // private async loadHtml(url: string) {
  //   const res = await fetch(url, { credentials: 'omit' });
  //   if (!res.ok) throw new Error(`Falha ao carregar HTML '${url}': ${res.status}`);
  //   const html = await res.text();
  //   this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  //   queueMicrotask(() => this.execScripts());
  // }

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
