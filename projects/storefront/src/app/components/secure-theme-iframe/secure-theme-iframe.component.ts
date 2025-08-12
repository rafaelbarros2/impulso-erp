import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

export interface ExtractedTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  [key: string]: string;
}

@Component({
  selector: 'app-secure-theme-iframe',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="iframe-host" [style.height]="height">
      <iframe #frame ngSkipHydration
        sandbox="allow-scripts allow-same-origin allow-forms"
        referrerpolicy="no-referrer"
        loading="lazy"
        style="width:100%;height:100%;border:0"></iframe>
      <div *ngIf="error" class="error-box">{{ error }}</div>
    </div>
  `,
  styles: [`
    .iframe-host { width: 100%; position: relative; }
    .error-box { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:12px; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 6px; }
  `]
})
export class SecureThemeIframeComponent implements OnChanges, AfterViewInit, OnInit, OnDestroy {
  // Inputs compatíveis com o template existente
  @Input() src?: string;            // URL opcional para buscar HTML
  @Input() htmlContent?: string;    // HTML bruto vindo do backend
  @Input() height: string = '100%';
  @Input() autoExtractTheme = false; // compat (não usado aqui)

  @Output() themeExtracted = new EventEmitter<ExtractedTheme>(); // compat
  @Output() promoAction = new EventEmitter<any>();                // compat
  @Output() loadComplete = new EventEmitter<void>();
  @Output() loadError = new EventEmitter<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('frame') frame?: ElementRef<HTMLIFrameElement>;

  error: string | null = null;

  private readonly RESIZE_SCRIPT = `
    <script>
      const resizeObserver = new ResizeObserver(entries => {
        const height = document.body.scrollHeight;
        console.log('Sending height from iframe:', height);
        window.parent.postMessage({
          type: 'resize-iframe',
          height: height
        }, '*');
      });
      resizeObserver.observe(document.body);
    </script>
  `;

  ngOnInit() {
    window.addEventListener('message', this.handleIframeMessage.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handleIframeMessage.bind(this));
  }

  private handleIframeMessage(event: MessageEvent) {
    // Basic security check
    if (event.source !== this.frame?.nativeElement?.contentWindow) {
      return;
    }

    const data = event.data;
    console.log('Received message from iframe:', data);
    if (data && data.type === 'resize-iframe' && data.height) {
      const newHeight = String(data.height);
      this.height = /^\d+$/.test(newHeight) ? `${newHeight}px` : newHeight;
      this.cdr.markForCheck();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[SecureThemeIframeComponent] Changes detected:', changes);
    if ('src' in changes || 'htmlContent' in changes) {
      this.loadIntoIframe();
    }
  }

  ngAfterViewInit() {
    this.loadIntoIframe();
  }

  private async loadIntoIframe() {
    this.error = null;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      if (!this.frame?.nativeElement) return;

      try {
        const iframe = this.frame.nativeElement;
        
        if (this.src) {
          // Let the browser handle loading from src
          iframe.src = this.src;
          this.loadComplete.emit();
          return;
        }
        
        if (this.htmlContent) {
          const contentWithScript = this.htmlContent + this.RESIZE_SCRIPT;
          iframe.contentWindow?.document.open();
          iframe.contentWindow?.document.write(this.htmlContent); 
          iframe.contentWindow?.document.close();
          this.loadComplete.emit();
          return;
        }
        
        this.error = 'Nenhum conteúdo para exibir.';
        this.loadError.emit(this.error);
        this.cdr.markForCheck();
      } catch (e: any) {
        this.error = 'Falha ao carregar HTML.';
        this.loadError.emit(this.error);
        this.cdr.markForCheck();
      }
    });
  }

  // Processa o HTML para adicionar base href se necessário
  private processHtmlContent(html: string): string {
    if (!html) return html;
    
    // Se o HTML não tem <base> e queremos forçar URLs para localhost:8080
    if (!html.includes('<base') && this.src?.includes('localhost:8080')) {
      const baseUrl = this.extractBaseUrl(this.src);
      const baseTag = `<base href="${baseUrl}">`;
      
      // Insere o <base> no <head> se existir, senão no início
      if (html.includes('<head>')) {
        return html.replace('<head>', `<head>\n  ${baseTag}`);
      } else if (html.includes('<html>')) {
        return html.replace('<html>', `<html>\n<head>\n  ${baseTag}\n</head>`);
      } else {
        return `<head>\n  ${baseTag}\n</head>\n${html}`;
      }
    }
    
    return html;
  }

  private extractBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      pathParts.pop(); // Remove o arquivo (index.html)
      return `${urlObj.origin}${pathParts.join('/')}/`;
    } catch {
      return 'http://localhost:8080/';
    }
  }
}
