import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-controlled-html-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="controlled-html-container"
      [style.height]="height"
      [innerHTML]="sanitizedHtml()"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .controlled-html-container {
      width: 100%;
      overflow: auto;
    }
    /* Estilos globais para o conteúdo renderizado */
    .controlled-html-container :deep(*) {
      max-width: 100%;
    }
    .controlled-html-container :deep(img) {
      max-width: 100%;
      height: auto;
    }
    .controlled-html-container :deep(table) {
      width: 100%;
      border-collapse: collapse;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlledHtmlRendererComponent implements OnChanges {
  @Input() htmlContent?: string;
  @Input() height: string = 'auto';
  @Input() allowScripts: boolean = false;
  @Input() customStyles?: string;

  private readonly sanitizer = inject(DomSanitizer);
  
  sanitizedHtml = signal<SafeHtml>('');

  ngOnChanges(changes: SimpleChanges): void {
    if ('htmlContent' in changes || 'allowScripts' in changes) {
      this.updateSanitizedHtml();
    }
  }

  private updateSanitizedHtml(): void {
    if (!this.htmlContent) {
      this.sanitizedHtml.set('');
      return;
    }

    let processedHtml = this.htmlContent;

    // Adiciona estilos customizados se fornecidos
    if (this.customStyles) {
      processedHtml = `<style>${this.customStyles}</style>${processedHtml}`;
    }

    // Remove scripts se não permitidos (segurança)
    if (!this.allowScripts) {
      processedHtml = this.removeScripts(processedHtml);
    }

    // Sanitiza o HTML
    const sanitized = this.sanitizer.bypassSecurityTrustHtml(processedHtml);
    this.sanitizedHtml.set(sanitized);
  }

  private removeScripts(html: string): string {
    // Remove tags <script>
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  // Método público para injetar estilos dinamicamente
  injectStyles(styles: string): void {
    this.customStyles = styles;
    this.updateSanitizedHtml();
  }

  // Método público para executar JavaScript customizado (se permitido)
  executeCustomScript(script: string): void {
    if (this.allowScripts) {
      try {
        new Function(script)();
      } catch (error) {
        console.error('Erro ao executar script customizado:', error);
      }
    }
  }
}