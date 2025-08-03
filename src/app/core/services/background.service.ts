import { Injectable, signal, Signal, effect } from '@angular/core';

// Interface para definir a estrutura de um background
export interface BackgroundConfig {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern' | 'image' | 'custom';
  value?: string; // CSS value (gradient, url, color, etc.)
  overlayOpacity?: number;
  overlayColor?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
}

// Tipos de background disponíveis
export type BackgroundType = 'default' | 'gradient-1' | 'gradient-2' | 'gradient-3' | 
                            'pattern-1' | 'pattern-2' | 'image-1' | 'image-2' | 'image-3' | 'custom';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  // Backgrounds predefinidos
  private backgroundPresets: Map<BackgroundType, BackgroundConfig> = new Map([
    ['default', {
      id: 'default',
      name: 'Padrão do Tema',
      type: 'solid',
      overlayOpacity: 0
    }],
    ['gradient-1', {
      id: 'gradient-1',
      name: 'Gradiente Suave',
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlayOpacity: 0.1,
      overlayColor: 'rgba(255, 255, 255, 0.1)'
    }],
    ['gradient-2', {
      id: 'gradient-2',
      name: 'Gradiente Vibrante',
      type: 'gradient',
      value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      overlayOpacity: 0.1,
      overlayColor: 'rgba(255, 255, 255, 0.1)'
    }],
    ['gradient-3', {
      id: 'gradient-3',
      name: 'Gradiente Escuro',
      type: 'gradient',
      value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      overlayOpacity: 0.15,
      overlayColor: 'rgba(0, 0, 0, 0.15)'
    }],
    ['pattern-1', {
      id: 'pattern-1',
      name: 'Padrão Geométrico',
      type: 'pattern',
      value: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,.15) 1px, transparent 0)',
      backgroundSize: '20px 20px',
      overlayOpacity: 0
    }],
    ['pattern-2', {
      id: 'pattern-2',
      name: 'Padrão Orgânico',
      type: 'pattern',
      value: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.1) 2px, rgba(255,255,255,.1) 4px)',
      overlayOpacity: 0
    }],
    ['image-1', {
      id: 'image-1',
      name: 'Imagem Fashion',
      type: 'image',
      value: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overlayOpacity: 0.7,
      overlayColor: 'rgba(0, 0, 0, 0.7)'
    }],
    ['image-2', {
      id: 'image-2',
      name: 'Imagem Minimalista',
      type: 'image',
      value: 'url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=2000")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overlayOpacity: 0.8,
      overlayColor: 'rgba(255, 255, 255, 0.8)'
    }],
    ['image-3', {
      id: 'image-3',
      name: 'Imagem Texturas',
      type: 'image',
      value: 'url("https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=2000")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overlayOpacity: 0.6,
      overlayColor: 'rgba(0, 0, 0, 0.6)'
    }]
  ]);

  // Estados privados usando Signals
  private _currentBackground = signal<BackgroundConfig | null>(null);
  private _overlayEnabled = signal<boolean>(false);

  // Signals públicos de leitura
  currentBackground: Signal<BackgroundConfig | null> = this._currentBackground.asReadonly();
  overlayEnabled: Signal<boolean> = this._overlayEnabled.asReadonly();

  constructor() {
    // Carrega configurações salvas ou aplica padrão
    this.loadSavedConfig();
    
    // Effect para aplicar mudanças automaticamente
    effect(() => {
      const bg = this._currentBackground();
      if (bg) {
        console.log('🎨 Background Service: Aplicando background', bg.name);
        this.setCssProperties(bg);
      }
    });
    
    // Effect para overlay
    effect(() => {
      const enabled = this._overlayEnabled();
      console.log('🎨 Background Service: Overlay', enabled ? 'ativado' : 'desativado');
      this.updateOverlayOpacity(enabled);
    });
  }

  /**
   * Aplica um background predefinido
   * @param backgroundType Tipo de background a ser aplicado
   */
  applyBackground(backgroundType: BackgroundType): void {
    console.log('🎨 Aplicando background:', backgroundType);
    const background = this.backgroundPresets.get(backgroundType);
    if (background) {
      this._currentBackground.set(background);
      localStorage.setItem('storefrontBackground', JSON.stringify(background));
      console.log(`✅ Background aplicado: ${background.name}`);
    } else {
      console.warn(`❌ Background "${backgroundType}" não encontrado`);
    }
  }

  /**
   * Aplica um background customizado
   * @param value Valor do background (URL, cor, gradiente, etc.)
   */
  applyCustomBackground(value: string): void {
    if (!value.trim()) return;

    console.log('🎨 Aplicando background customizado:', value);

    let backgroundConfig: BackgroundConfig;

    if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
      // É uma cor sólida
      backgroundConfig = {
        id: 'custom',
        name: 'Personalizado',
        type: 'solid',
        value: value,
        overlayOpacity: 0
      };
    } else if (value.startsWith('http') || value.startsWith('data:')) {
      // É uma URL de imagem
      backgroundConfig = {
        id: 'custom',
        name: 'Imagem Personalizada',
        type: 'image',
        value: `url("${value}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overlayOpacity: 0.5,
        overlayColor: 'rgba(0, 0, 0, 0.5)'
      };
    } else {
      // Tenta aplicar como CSS válido (gradiente, etc.)
      backgroundConfig = {
        id: 'custom',
        name: 'CSS Personalizado',
        type: 'custom',
        value: value,
        overlayOpacity: 0
      };
    }

    this._currentBackground.set(backgroundConfig);
    localStorage.setItem('storefrontBackground', JSON.stringify(backgroundConfig));
    console.log('✅ Background personalizado aplicado:', backgroundConfig);
  }

  /**
   * Alterna o estado do overlay
   */
  toggleOverlay(): void {
    const currentState = this._overlayEnabled();
    const newState = !currentState;
    
    this._overlayEnabled.set(newState);
    localStorage.setItem('storefrontOverlayEnabled', newState.toString());
    
    console.log(`Overlay ${newState ? 'ativado' : 'desativado'}`);
  }

  /**
   * Define o estado do overlay
   * @param enabled Estado do overlay
   */
  setOverlayEnabled(enabled: boolean): void {
    this._overlayEnabled.set(enabled);
    localStorage.setItem('storefrontOverlayEnabled', enabled.toString());
  }

  /**
   * Retorna os backgrounds disponíveis
   */
  getAvailableBackgrounds(): Array<{id: BackgroundType, name: string}> {
    return Array.from(this.backgroundPresets.entries()).map(([id, config]) => ({
      id,
      name: config.name
    }));
  }

  /**
   * Remove o background aplicado (volta ao padrão)
   */
  clearBackground(): void {
    this.applyBackground('default');
  }

  /**
   * CORRIGIDO: Define as propriedades CSS no elemento root e body
   * @param background Configuração do background
   */
  private setCssProperties(background: BackgroundConfig): void {
    const root = document.documentElement;
    const body = document.body;

    console.log('🎨 Aplicando CSS para background:', background.type, background.value);

    // Limpa propriedades anteriores
    this.clearAllBackgroundProperties();

    // Aplica novas propriedades baseado no tipo
    switch (background.type) {
      case 'solid':
        if (background.value) {
          body.style.background = background.value;
          body.style.backgroundImage = 'none';
          console.log('🎨 Cor sólida aplicada:', background.value);
        }
        break;

      case 'gradient':
        if (background.value) {
          root.style.setProperty('--bg-gradient', background.value);
          body.style.background = background.value;
          body.style.backgroundImage = background.value;
          body.style.backgroundAttachment = 'fixed';
          console.log('🎨 Gradiente aplicado:', background.value);
        }
        break;

      case 'pattern':
        if (background.value) {
          root.style.setProperty('--bg-pattern', background.value);
          body.style.background = 'var(--background-color, #f0f2f5)';
          body.style.backgroundImage = background.value;
          body.style.backgroundSize = background.backgroundSize || '20px 20px';
          body.style.backgroundAttachment = 'local';
          console.log('🎨 Padrão aplicado:', background.value);
        }
        break;

      case 'image':
        if (background.value) {
          root.style.setProperty('--bg-image', background.value);
          body.style.backgroundImage = background.value;
          body.style.backgroundSize = background.backgroundSize || 'cover';
          body.style.backgroundPosition = background.backgroundPosition || 'center';
          body.style.backgroundRepeat = background.backgroundRepeat || 'no-repeat';
          body.style.backgroundAttachment = background.backgroundAttachment || 'fixed';
          console.log('🎨 Imagem aplicada:', background.value);
        }
        break;

      case 'custom':
        if (background.value) {
          body.style.background = background.value;
          console.log('🎨 CSS personalizado aplicado:', background.value);
        }
        break;

      default:
        // Padrão - remove todas as propriedades
        console.log('🎨 Aplicando background padrão');
        break;
    }

    // Aplica propriedades de overlay
    if (background.overlayOpacity !== undefined) {
      root.style.setProperty('--bg-overlay-opacity', background.overlayOpacity.toString());
    }
    if (background.overlayColor) {
      root.style.setProperty('--bg-overlay-color', background.overlayColor);
    }
  }

  /**
   * NOVO: Limpa todas as propriedades de background
   */
  private clearAllBackgroundProperties(): void {
    const root = document.documentElement;
    const body = document.body;

    // Remove variáveis CSS
    root.style.removeProperty('--bg-gradient');
    root.style.removeProperty('--bg-image');
    root.style.removeProperty('--bg-pattern');
    
    // Limpa estilos do body
    body.style.removeProperty('background');
    body.style.removeProperty('background-image');
    body.style.removeProperty('background-size');
    body.style.removeProperty('background-position');
    body.style.removeProperty('background-repeat');
    body.style.removeProperty('background-attachment');
  }

  /**
   * Atualiza a opacidade do overlay
   * @param enabled Se o overlay está ativado
   */
  private updateOverlayOpacity(enabled: boolean): void {
    const root = document.documentElement;
    const currentBackground = this._currentBackground();
    
    if (enabled && currentBackground?.overlayOpacity !== undefined) {
      root.style.setProperty('--bg-overlay-opacity', currentBackground.overlayOpacity.toString());
    } else {
      root.style.setProperty('--bg-overlay-opacity', '0');
    }
  }

  /**
   * Carrega configurações salvas do localStorage
   */
  private loadSavedConfig(): void {
    // Carrega background salvo
    const savedBackground = localStorage.getItem('storefrontBackground');
    if (savedBackground) {
      try {
        const background: BackgroundConfig = JSON.parse(savedBackground);
        this._currentBackground.set(background);
        console.log('📂 Background carregado do localStorage:', background.name);
      } catch (error) {
        console.warn('Erro ao carregar background salvo:', error);
        this.applyBackground('default');
      }
    } else {
      this.applyBackground('default');
    }

    // Carrega estado do overlay
    const savedOverlayEnabled = localStorage.getItem('storefrontOverlayEnabled');
    if (savedOverlayEnabled !== null) {
      const enabled = savedOverlayEnabled === 'true';
      this._overlayEnabled.set(enabled);
    }
  }

  /**
   * Limpa todas as configurações salvas
   */
  clearSavedConfig(): void {
    localStorage.removeItem('storefrontBackground');
    localStorage.removeItem('storefrontOverlayEnabled');
    this.applyBackground('default');
    this.setOverlayEnabled(false);
  }

  /**
   * NOVO: Método para debug
   */
  getDebugState(): any {
    return {
      currentBackground: this._currentBackground(),
      overlayEnabled: this._overlayEnabled(),
      localStorage: {
        background: localStorage.getItem('storefrontBackground'),
        overlay: localStorage.getItem('storefrontOverlayEnabled')
      }
    };
  }
}