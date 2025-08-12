import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-simple-html-injector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="html-injector-container" [style.height]="height === 'auto' ? '100%' : height">
      <div *ngIf="loading()" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Carregando conteúdo...</span>
      </div>
      <div *ngIf="error()" class="error-state">
        <div class="error-message">{{ error() }}</div>
        <button (click)="retry()" class="retry-button">Tentar novamente</button>
      </div>
      <div 
        *ngIf="!loading() && !error() && sanitizedHtml()" 
        class="html-content"
        [innerHTML]="sanitizedHtml()">
      </div>
    </div>
  `,
  styles: [`
    .html-injector-container {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: #f9fafb; /* bg-gray-50 */
      color: #111827; /* text-gray-900 */
      min-height: 100vh;
      padding: 0;
      margin: 0;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .html-injector-container {
        background-color: #111827; /* dark:bg-gray-900 */
        color: #f9fafb; /* dark:text-gray-50 */
      }
    }
    
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #666;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-message {
      color: #dc3545;
      text-align: center;
      margin-bottom: 15px;
      padding: 10px;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }
    
    .retry-button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .retry-button:hover {
      background: #0056b3;
    }
    
    .html-content {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class SimpleHtmlInjectorComponent implements OnInit, OnChanges {
  @Input() htmlUrl?: string;
  @Input() height: string = 'auto';
  @Input() autoLoad: boolean = true;
  @Input() allowScripts: boolean = false;
  
  // Outputs
  loaded = output<void>();
  errorEmitted = output<string>();
  
  // Injeções
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  
  // Signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  sanitizedHtml = signal<SafeHtml>('');

  ngOnInit(): void {
    if (this.autoLoad && this.htmlUrl) {
      this.loadHtml();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('htmlUrl' in changes && this.autoLoad && this.htmlUrl) {
      this.loadHtml();
    }
  }

  loadHtml(): void {
    if (!this.htmlUrl) {
      this.error.set('URL do HTML não informada');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.sanitizedHtml.set('');

    console.log('[SimpleHtmlInjector] Carregando HTML de:', this.htmlUrl);

    this.http.get(this.htmlUrl, { 
      responseType: 'text',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }).pipe(
      catchError(err => {
        console.error('[SimpleHtmlInjector] Erro ao carregar HTML:', err);
        const errorMsg = `Erro ao carregar conteúdo: ${err.status} ${err.statusText || 'Erro desconhecido'}`;
        return of({ error: errorMsg });
      })
    ).subscribe({
      next: (response) => {
        if (typeof response === 'object' && 'error' in response) {
          this.error.set(response.error);
          this.errorEmitted.emit(response.error);
        } else {
          this.processHtml(response as string);
        }
        this.loading.set(false);
      },
      error: (err) => {
        const errorMsg = 'Falha na requisição: ' + (err.message || 'erro desconhecido');
        this.error.set(errorMsg);
        this.errorEmitted.emit(errorMsg);
        this.loading.set(false);
      }
    });
  }

  private processHtml(html: string): void {
    if (!html || html.trim() === '') {
      this.error.set('Conteúdo HTML vazio recebido');
      this.errorEmitted.emit('Conteúdo HTML vazio recebido');
      return;
    }

    console.log('[SimpleHtmlInjector] HTML recebido - tamanho:', html.length, 'caracteres');
    console.log('[SimpleHtmlInjector] Início do HTML:', html.substring(0, 200) + '...');

    let processedHtml = html;

    // Remove scripts se não permitidos
    if (!this.allowScripts) {
      processedHtml = this.removeScripts(processedHtml);
    }

    // Extrai e injeta estilos antes do HTML
    this.extractAndInjectStyles(html); // Usar HTML original para extrair estilos
    
    // Extrai apenas o conteúdo do body se for HTML completo
    processedHtml = this.extractBodyContent(processedHtml);
    
    // Sanitiza e injeta o HTML
    try {
      const sanitized = this.sanitizer.bypassSecurityTrustHtml(processedHtml);
      this.sanitizedHtml.set(sanitized);
      
      // Se scripts são permitidos, executa depois que o DOM for atualizado
      if (this.allowScripts) {
        setTimeout(() => this.executeScripts(processedHtml), 500);
      }
      
      this.loaded.emit();
      console.log('[SimpleHtmlInjector] HTML processado e injetado com sucesso');
    } catch (err) {
      console.error('[SimpleHtmlInjector] Erro ao sanitizar HTML:', err);
      this.error.set('Erro ao processar o conteúdo HTML');
      this.errorEmitted.emit('Erro ao processar o conteúdo HTML');
    }
  }

  private removeScripts(html: string): string {
    // Remove tags script
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  private extractBodyContent(html: string): string {
    console.log('[SimpleHtmlInjector] Extraindo conteúdo do body');
    
    // Se tem tags <body>, extrai o conteúdo
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      console.log('[SimpleHtmlInjector] Conteúdo do body extraído');
      return bodyMatch[1];
    }
    
    // Se não tem body, retorna o HTML como está
    console.log('[SimpleHtmlInjector] Nenhuma tag <body> encontrada, usando HTML completo');
    return html;
  }

  private extractAndInjectStyles(html: string): void {
    console.log('[SimpleHtmlInjector] Extraindo estilos do HTML');
    
    // Remove estilos anteriores se existirem
    const existingStyle = document.getElementById('injected-html-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Extrai todas as tags <style> do HTML
    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let allStyles = '';
    let match;
    
    while ((match = styleRegex.exec(html)) !== null) {
      let styleContent = match[1];
      
      // Se contém .hero-bg, adiciona !important ao background-image
      if (styleContent.includes('.hero-bg')) {
        console.log('[SimpleHtmlInjector] *** HERO-BG CSS ENCONTRADO - Aplicando !important ***');
        styleContent = styleContent.replace(
          /background-image:\s*([^;]+);/g, 
          'background-image: $1 !important;'
        );
        styleContent = styleContent.replace(
          /background-size:\s*([^;]+);/g, 
          'background-size: $1 !important;'
        );
        styleContent = styleContent.replace(
          /background-position:\s*([^;]+);/g, 
          'background-position: $1 !important;'
        );
        console.log('[SimpleHtmlInjector] CSS .hero-bg com !important:', styleContent);
      }
      
      allStyles += styleContent + '\n';
      console.log('[SimpleHtmlInjector] Estilo encontrado:', styleContent.substring(0, 100) + '...');
    }

    // Se encontrou estilos, injeta no head
    if (allStyles.trim()) {
      const style = document.createElement('style');
      style.id = 'injected-html-styles';
      style.textContent = allStyles;
      
      document.head.appendChild(style);
      console.log('[SimpleHtmlInjector] Estilos do HTML injetados no head');
      
      // Verificar se o estilo foi realmente aplicado
      setTimeout(() => {
        const heroElement = document.querySelector('.hero-bg');
        if (heroElement) {
          console.log('[SimpleHtmlInjector] *** VERIFICAÇÃO HERO-BG ***');
          console.log('Classes do elemento:', heroElement.className);
          
          // Remove classes conflitantes que podem sobrepor o background
          const conflictingClasses = [ 'bg-gray-900', 'bg-white', 'bg-gray-50'];
          let removedClasses: string[] = [];
          
          conflictingClasses.forEach(className => {
            if (heroElement.classList.contains(className)) {
              heroElement.classList.remove(className);
              removedClasses.push(className);
            }
          });
          
          if (removedClasses.length > 0) {
            console.log('[SimpleHtmlInjector] Classes conflitantes removidas:', removedClasses);
          }
          
          const computedStyle = window.getComputedStyle(heroElement);
          const backgroundImage = computedStyle.backgroundImage;
          console.log('Background-image aplicado:', backgroundImage);
          
          if (backgroundImage === 'none' || !backgroundImage.includes('unsplash')) {
            console.error('[SimpleHtmlInjector] PROBLEMA: Background-image ainda não aplicado!');
            
            // Força aplicação do background-image
            console.log('[SimpleHtmlInjector] Forçando aplicação da imagem hero...');
            (heroElement as HTMLElement).style.backgroundImage = "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1600')";
            (heroElement as HTMLElement).style.backgroundSize = "cover";
            (heroElement as HTMLElement).style.backgroundPosition = "center";
          } else {
            console.log('[SimpleHtmlInjector] ✅ Imagem hero aplicada com sucesso!');
          }
        } else {
          console.error('[SimpleHtmlInjector] PROBLEMA: Elemento .hero-bg não encontrado no DOM!');
        }
      }, 1000);
    
    } else {
      console.log('[SimpleHtmlInjector] Nenhum estilo encontrado no HTML');
    }

    // Também extrai e injeta links CSS externos
    this.extractAndInjectLinks(html);
  }

  private extractAndInjectLinks(html: string): void {
    console.log('[SimpleHtmlInjector] Extraindo links CSS do HTML');
    
    // Extrai links CSS (Tailwind, Google Fonts, etc.)
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
    const links = html.match(linkRegex);
    
    if (links) {
      links.forEach(linkHtml => {
        // Verifica se já existe no head
        const hrefMatch = linkHtml.match(/href=["']([^"']+)["']/i);
        if (hrefMatch && !document.querySelector(`link[href="${hrefMatch[1]}"]`)) {
          // Cria elemento link
          const linkElement = document.createElement('div');
          linkElement.innerHTML = linkHtml;
          const link = linkElement.firstChild as HTMLLinkElement;
          
          document.head.appendChild(link);
          console.log('[SimpleHtmlInjector] Link CSS injetado:', hrefMatch[1]);
        }
      });
    } else {
      console.log('[SimpleHtmlInjector] Nenhum link CSS encontrado');
    }
  }

  private executeScripts(html: string): void {
    if (!this.allowScripts) return;

    console.log('[SimpleHtmlInjector] Executando scripts do HTML injetado');
    
    // Extrai e executa scripts inline
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const scriptContent = match[1];
      if (scriptContent && scriptContent.trim()) {
        try {
          console.log('[SimpleHtmlInjector] Executando script:', scriptContent.substring(0, 100) + '...');
          
          // Verifica se o script contém DOMContentLoaded
          if (scriptContent.includes('DOMContentLoaded')) {
            // Remove o DOMContentLoaded listener e executa diretamente
            const cleanScript = scriptContent.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{/, '').replace(/\}\);?\s*$/, '');
            new Function(cleanScript).call(window);
          } else {
            // Executa o script normalmente
            new Function(scriptContent).call(window);
          }
          
          console.log('[SimpleHtmlInjector] Script executado com sucesso');
        } catch (error) {
          console.error('[SimpleHtmlInjector] Erro ao executar script:', error);
          console.error('Script content:', scriptContent);
        }
      }
    }
  }

  retry(): void {
    if (this.htmlUrl) {
      this.loadHtml();
    }
  }

  // Método público para carregar HTML manualmente
  loadFromUrl(url: string): void {
    this.htmlUrl = url;
    this.loadHtml();
  }
}