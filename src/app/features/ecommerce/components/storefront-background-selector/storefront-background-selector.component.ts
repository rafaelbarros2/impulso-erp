import { Component, OnInit, OnDestroy, input, inject, signal, computed, Signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BackgroundConfig, BackgroundService, BackgroundType } from '../../../../core/services/background.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';

interface BackgroundOption {
  label: string;
  value: BackgroundType;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-storefront-background-selector',
  templateUrl: './storefront-background-selector.component.html',
  imports: [DropdownModule, ButtonModule, InputTextModule, CommonModule, FormsModule, ChipModule, TooltipModule, InputSwitchModule],
  standalone: true,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-10px)' }))
      ])
    ])
  ]
})
export class StorefrontBackgroundSelectorComponent implements OnInit {

  // Injeção de dependências
  private readonly backgroundService = inject(BackgroundService);
  
  // Opções do dropdown
  backgroundOptions: BackgroundOption[] = [
    { label: 'Padrão do Tema', value: 'default', icon: 'pi pi-palette', description: 'Cor padrão do tema selecionado' },
    { label: 'Gradiente Suave', value: 'gradient-1', icon: 'pi pi-circle', description: 'Gradiente roxo suave' },
    { label: 'Gradiente Vibrante', value: 'gradient-2', icon: 'pi pi-circle', description: 'Gradiente rosa vibrante' },
    { label: 'Gradiente Escuro', value: 'gradient-3', icon: 'pi pi-circle', description: 'Gradiente azul escuro' },
    { label: 'Padrão Geométrico', value: 'pattern-1', icon: 'pi pi-th-large', description: 'Pontos geométricos' },
    { label: 'Padrão Orgânico', value: 'pattern-2', icon: 'pi pi-bars', description: 'Listras diagonais' },
    { label: 'Imagem Fashion', value: 'image-1', icon: 'pi pi-image', description: 'Loja de roupas' },
    { label: 'Imagem Minimalista', value: 'image-2', icon: 'pi pi-image', description: 'Fundo clean e moderno' },
    { label: 'Imagem Texturas', value: 'image-3', icon: 'pi pi-image', description: 'Texturas abstratas' },
    { label: 'Personalizado', value: 'custom', icon: 'pi pi-cog', description: 'URL ou CSS personalizado' }
  ];
  
  // Sinais do serviço
  currentBackground: Signal<BackgroundConfig | null> = this.backgroundService.currentBackground;
  overlayEnabled: Signal<boolean> = this.backgroundService.overlayEnabled;

  // Estados do componente - SEM ngModel, usando apenas Signals
  selectedBackground = signal<BackgroundOption | null>(null);
  customBackgroundValue = signal<string>('');

  // Computed properties como getters
  get showCustomControls(): boolean {
    return this.selectedBackground()?.value === 'custom';
  }

  get hasBackgroundApplied(): boolean {
    return this.currentBackground()?.id !== 'default';
  }

  get overlayToggleIcon(): string {
    return this.overlayEnabled() ? 'pi pi-eye-slash' : 'pi pi-eye';
  }

  get overlayToggleTooltip(): string {
    return this.overlayEnabled() ? 'Desativar overlay' : 'Ativar overlay';
  }

  get isCustomValueValid(): boolean {
    const value = this.customBackgroundValue().trim();
    if (!value) return false;
    
    // Valida URLs, cores hex, RGB, HSL ou CSS válido
    return value.startsWith('http') || 
           value.startsWith('data:') ||
           value.startsWith('#') ||
           value.startsWith('rgb') ||
           value.startsWith('hsl') ||
           value.includes('gradient') ||
           value.includes('repeating');
  }

  constructor() {}

  ngOnInit(): void {
    console.log('🎨 Background Selector inicializado');
    
    // Inicializa o estado do componente com base no Signal do serviço
    const currentBg = this.backgroundService.currentBackground();
    this.updateSelectedBackground(currentBg);
    
    console.log('🎨 Selected background após init:', this.selectedBackground());

    // if (!environment.production) {
    setTimeout(() => {
      this.debugBackground();
    }, 2000);
  // }
  }

  /**
   * Atualiza o estado do dropdown e dos controles com base no background atual.
   * @param background A configuração de background atual.
   */
  private updateSelectedBackground(background: BackgroundConfig | null): void {
    if (background) {
      const matchingOption = this.backgroundOptions.find(option => option.value === background.id as BackgroundType);
      
      if (matchingOption) {
        this.selectedBackground.set(matchingOption);
      } else {
        // Se for um background customizado, seleciona a opção "Personalizado"
        const customOption = this.backgroundOptions.find(opt => opt.value === 'custom');
        this.selectedBackground.set(customOption || null);
        this.customBackgroundValue.set(background.value || '');
      }
    } else {
      // Nenhum background aplicado, seleciona o padrão
      this.selectedBackground.set(this.backgroundOptions.find(opt => opt.value === 'default') || null);
    }
  }

  /**
   * Manipula a mudança de background no dropdown
   * @param event Evento do PrimeNG dropdown
   */
  onBackgroundChange(event: any): void {
    const selectedOption: BackgroundOption = event.value;
    
    if (selectedOption) {
      this.selectedBackground.set(selectedOption);
      
      if (selectedOption.value !== 'custom') {
        this.backgroundService.applyBackground(selectedOption.value);
        this.customBackgroundValue.set('');
        console.log(`Background alterado para: ${selectedOption.label}`);
      }
    }
  }

  /**
   * Manipula mudança no input customizado
   * @param event Evento do input
   */
  onCustomValueChange(event: any): void {
    this.customBackgroundValue.set(event.target.value);
  }

  /**
   * Aplica background personalizado
   */
  applyCustomBackground(): void {
    const value = this.customBackgroundValue().trim();
    if (value) {
      this.backgroundService.applyCustomBackground(value);
      console.log('Background personalizado aplicado:', value);
    }
  }

  /**
   * Alterna o estado do overlay
   */
  toggleOverlay(): void {
    this.backgroundService.toggleOverlay();
  }

  /**
   * Manipula mudança no overlay switch
   * @param event Evento do switch
   */
  onOverlayChange(event: any): void {
    // O toggle já é chamado pelo evento onChange do switch
    this.backgroundService.setOverlayEnabled(event.checked);
  }

  /**
   * Limpa o background (volta ao padrão)
   */
  clearBackground(): void {
    this.backgroundService.clearBackground();
    this.customBackgroundValue.set('');
  }

  /**
   * TrackBy function para o *ngFor
   */
  trackByFn(index: number, item: BackgroundOption): BackgroundType {
    return item.value;
  }

  debugBackground(): void {
  console.log('🐛 ===== DEBUG BACKGROUND =====');
  
  const body = document.body;
  const computedStyle = window.getComputedStyle(body);
  
  console.log('🐛 Body background-image:', computedStyle.backgroundImage);
  console.log('🐛 Body background-size:', computedStyle.backgroundSize);
  console.log('🐛 Body background-position:', computedStyle.backgroundPosition);
  console.log('🐛 Body background-repeat:', computedStyle.backgroundRepeat);
  console.log('🐛 Body background-attachment:', computedStyle.backgroundAttachment);
  console.log('🐛 Body background-color:', computedStyle.backgroundColor);
  
  // Verifica se há conflitos
  const conflictingElements = document.querySelectorAll('[style*="background"]');
  console.log('🐛 Elementos com background inline:', conflictingElements.length);
  
  // Background service state
  console.log('🐛 Background service state:', this.backgroundService.getDebugState());
  
  console.log('🐛 ============================');
}

/**
 * Força aplicação de background para teste
 */
forceTestBackground(): void {
  const body = document.body;
  
  // Força um background de teste
  body.style.setProperty('background-image', 
    'url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=2000")', 
    'important'
  );
  body.style.setProperty('background-size', 'cover', 'important');
  body.style.setProperty('background-position', 'center', 'important');
  body.style.setProperty('background-repeat', 'no-repeat', 'important');
  body.style.setProperty('background-attachment', 'fixed', 'important');
  body.style.setProperty('min-height', '100vh', 'important');
  
  console.log('🔧 Background de teste aplicado forçadamente');
}

/**
 * Remove todos os backgrounds para teste
 */
clearAllBackgrounds(): void {
  const body = document.body;
  
  // Remove todas as propriedades de background
  body.style.removeProperty('background');
  body.style.removeProperty('background-image');
  body.style.removeProperty('background-size');
  body.style.removeProperty('background-position');
  body.style.removeProperty('background-repeat');
  body.style.removeProperty('background-attachment');
  body.style.removeProperty('background-color');
  
  console.log('🧹 Todos os backgrounds removidos');
}
}