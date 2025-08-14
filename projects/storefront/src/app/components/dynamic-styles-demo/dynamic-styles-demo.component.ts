import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicStylesService } from '../../services/dynamic-styles.service';

@Component({
  selector: 'app-dynamic-styles-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dynamic-styles-demo">
      <div class="demo-header">
        <h2>Demonstração de Estilos Dinâmicos</h2>
        <div class="demo-controls">
          <button (click)="loadExampleStyles()" [disabled]="state().isLoading">
            {{ state().isLoading ? 'Carregando...' : 'Carregar Exemplo' }}
          </button>
          <button (click)="clearStyles()" [disabled]="!state().isLoaded">
            Limpar Estilos
          </button>
        </div>
      </div>

      <div class="demo-status" [ngClass]="getStatusClass()">
        <strong>Status:</strong>
        <span *ngIf="state().isLoading">Carregando estilos dinâmicos...</span>
        <span *ngIf="state().isLoaded && !state().error">
          ✅ Estilos carregados com sucesso! 
          <small>({{ state().lastUpdated | date:'short' }})</small>
        </span>
        <span *ngIf="state().error">
          ❌ Erro: {{ state().error }}
        </span>
        <span *ngIf="!state().isLoaded && !state().isLoading && !state().error">
          ⏳ Aguardando carregamento de estilos dinâmicos
        </span>
      </div>

      <div class="demo-config" *ngIf="state().currentConfig">
        <h3>Configuração Atual:</h3>
        <div class="config-summary">
          <div><strong>Tenant:</strong> {{ state().currentConfig?.tenant }}</div>
          <div><strong>Versão:</strong> {{ state().currentConfig?.version }}</div>
          <div><strong>Componentes configurados:</strong> {{ getComponentCount() }}</div>
        </div>
      </div>

      <div class="demo-preview">
        <h3>Prévia dos Estilos:</h3>
        <div class="style-samples">
          <div class="sample-card" [ngClass]="getSampleCardClass()">
            <h4>Card de Exemplo</h4>
            <p>Este card demonstra os estilos dinâmicos aplicados</p>
            <div class="sample-badges">
              <span class="badge badge-sale">PROMOÇÃO</span>
              <span class="badge badge-new">NOVO</span>
            </div>
            <div class="sample-buttons">
              <button class="btn btn-primary">Primário</button>
              <button class="btn btn-secondary">Secundário</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dynamic-styles-demo {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .demo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .demo-controls {
      display: flex;
      gap: 12px;
    }

    .demo-controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: #2563eb;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .demo-controls button:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .demo-controls button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .demo-status {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .demo-status.loading {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      color: #92400e;
    }

    .demo-status.success {
      background: #d1fae5;
      border: 1px solid #10b981;
      color: #065f46;
    }

    .demo-status.error {
      background: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
    }

    .demo-status.idle {
      background: #f1f5f9;
      border: 1px solid #94a3b8;
      color: #475569;
    }

    .demo-config {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .config-summary {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .demo-preview {
      background: white;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .sample-card {
      padding: 20px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      transition: all 0.3s;
    }

    .sample-card.dynamic-loaded {
      /* Estilos serão aplicados dinamicamente */
    }

    .sample-badges {
      display: flex;
      gap: 8px;
      margin: 12px 0;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-sale {
      background: #ef4444;
      color: white;
    }

    .badge-new {
      background: #22c55e;
      color: white;
    }

    .sample-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    @media (max-width: 640px) {
      .demo-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class DynamicStylesDemoComponent implements OnInit {
  private dynamicStylesService = inject(DynamicStylesService);
  
  state = this.dynamicStylesService.state;

  ngOnInit() {
    console.log('[DynamicStylesDemoComponent] Component initialized');
  }

  loadExampleStyles() {
    console.log('[DynamicStylesDemoComponent] Loading example styles...');
    this.dynamicStylesService.loadStyles('/dynamic-styles-example.json').subscribe();
  }

  clearStyles() {
    console.log('[DynamicStylesDemoComponent] Clearing styles...');
    this.dynamicStylesService.clearStyles();
  }

  getStatusClass(): string {
    const currentState = this.state();
    if (currentState.isLoading) return 'loading';
    if (currentState.error) return 'error';
    if (currentState.isLoaded) return 'success';
    return 'idle';
  }

  getComponentCount(): number {
    const config = this.state().currentConfig;
    return config?.components ? Object.keys(config.components).length : 0;
  }

  getSampleCardClass(): string {
    const isLoaded = this.state().isLoaded;
    return isLoaded ? 'dynamic-loaded' : '';
  }
}