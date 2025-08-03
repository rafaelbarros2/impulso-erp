import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
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
export class StorefrontBackgroundSelectorComponent implements OnInit, OnDestroy {

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
  currentBackground = this.backgroundService.currentBackground;
  overlayEnabled = this.backgroundService.overlayEnabled;

  // Estados do componente usando Signals
  selectedBackground = signal<BackgroundOption | null>(null);
  customBackgroundValue = signal<string>('');
  isApplying = signal<boolean>(false);

  // Computed properties
  showCustomControls = computed(() => this.selectedBackground()?.value === 'custom');
  hasBackgroundApplied = computed(() => this.currentBackground()?.id !== 'default');
  overlayToggleIcon = computed(() => this.overlayEnabled() ? 'pi pi-eye-slash' : 'pi pi-eye');
  overlayToggleTooltip = computed(() => this.overlayEnabled() ? 'Desativar overlay' : 'Ativar overlay');
  
  isCustomValueValid = computed(() => {
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
  });

  constructor() {
    // Effect para sincronizar com mudanças do serviço
    effect(() => {
      const currentBg = this.currentBackground();
      this.updateSelectedBackground(currentBg);
    }, { allowSignalWrites: true });

    // Effect para debug
    effect(() => {
      const selectedBg = this.selectedBackground();
      const currentBg = this.currentBackground();
      console.log('🎨 Background Selector - Estado:', {
        selected: selectedBg?.label,
        current: currentBg?.name,
        overlayEnabled: this.overlayEnabled()
      });
    });
  }

  ngOnInit(): void {
    console.log('🎨 Background Selector inicializado');
    
    // Força a sincronização inicial
    const currentBg = this.currentBackground();
    this.updateSelectedBackground(currentBg);
    
    // Debug inicial
    setTimeout(() => {
      this.debugBackground();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Cleanup se necessário
  }

  /**
   * MELHORADO: Atualiza o estado do dropdown e dos controles com base no background atual
   */
  private updateSelectedBackground(background: BackgroundConfig | null): void {
    if (background) {
      const matchingOption = this.backgroundOptions.find(option => 
        option.value === background.id as BackgroundType
      );
      
      if (matchingOption) {
        this.selectedBackground.set(matchingOption);
        this.customBackgroundValue.set(''); // Limpa custom se não for custom
      } else {
        // Se for um background customizado, seleciona a opção "Personalizado"
        const customOption = this.backgroundOptions.find(opt => opt.value === 'custom');
        this.selectedBackground.set(customOption || null);
        this.customBackgroundValue.set(background.value || '');
      }
    } else {
      // Nenhum background aplicado, seleciona o padrão
      const defaultOption = this.backgroundOptions.find(opt => opt.value === 'default');
      this.selectedBackground.set(defaultOption || null);
      this.customBackgroundValue.set('');
    }

    console.log('🎨 Background selecionado atualizado:', this.selectedBackground()?.label);
  }

  /**
   * MELHORADO: Manipula a mudança de background no dropdown
   */
  onBackgroundChange(event: any): void {
    const selectedOption: BackgroundOption = event.value;
    
    if (!selectedOption) return;

    console.log('🎨 Mudança de background solicitada:', selectedOption.label);
    
    this.selectedBackground.set(selectedOption);
    this.isApplying.set(true);
    
    if (selectedOption.value !== 'custom') {
      try {
        this.backgroundService.applyBackground(selectedOption.value);
        this.customBackgroundValue.set('');
        console.log(`✅ Background aplicado: ${selectedOption.label}`);
        
        // Debug imediato após aplicação
        setTimeout(() => {
          this.debugBackground();
          this.isApplying.set(false);
        }, 500);
        
      } catch (error) {
        console.error('❌ Erro ao aplicar background:', error);
        this.isApplying.set(false);
      }
    } else {
      this.isApplying.set(false);
    }
  }

  /**
   * MELHORADO: Manipula mudança no input customizado
   */
  onCustomValueChange(event: any): void {
    const value = event.target.value;
    this.customBackgroundValue.set(value);
    console.log('🎨 Valor customizado alterado:', value);
  }

  /**
   * MELHORADO: Aplica background personalizado
   */
  applyCustomBackground(): void {
    const value = this.customBackgroundValue().trim();
    if (!value || !this.isCustomValueValid()) {
      console.warn('❌ Valor customizado inválido:', value);
      return;
    }

    console.log('🎨 Aplicando background customizado:', value);
    this.isApplying.set(true);

    try {
      this.backgroundService.applyCustomBackground(value);
      console.log('✅ Background personalizado aplicado:', value);
      
      // Debug após aplicação
      setTimeout(() => {
        this.debugBackground();
        this.isApplying.set(false);
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro ao aplicar background customizado:', error);
      this.isApplying.set(false);
    }
  }

  /**
   * Alterna o estado do overlay
   */
  toggleOverlay(): void {
    console.log('🎨 Alternando overlay. Estado atual:', this.overlayEnabled());
    this.backgroundService.toggleOverlay();
  }

  /**
   * Manipula mudança no overlay switch
   */
  onOverlayChange(event: any): void {
    console.log('🎨 Overlay switch alterado:', event.checked);
    this.backgroundService.setOverlayEnabled(event.checked);
  }

  /**
   * Limpa o background (volta ao padrão)
   */
  clearBackground(): void {
    console.log('🎨 Limpando background');
    this.backgroundService.clearBackground();
    this.customBackgroundValue.set('');
    
    // Debug após limpeza
    setTimeout(() => {
      this.debugBackground();
    }, 300);
  }

  /**
   * MELHORADO: Debug do estado do background
   */
  debugBackground(): void {
    console.log('🐛 ===== DEBUG BACKGROUND SELECTOR =====');
    
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    
    console.log('🐛 Body computed styles:');
    console.log('  - background:', computedStyle.background);
    console.log('  - background-image:', computedStyle.backgroundImage);
    console.log('  - background-size:', computedStyle.backgroundSize);
    console.log('  - background-position:', computedStyle.backgroundPosition);
    console.log('  - background-repeat:', computedStyle.backgroundRepeat);
    console.log('  - background-attachment:', computedStyle.backgroundAttachment);
    console.log('  - background-color:', computedStyle.backgroundColor);
    
    console.log('🐛 Inline styles:');
    console.log('  - background:', body.style.background || 'none');
    console.log('  - background-image:', body.style.backgroundImage || 'none');
    
    // Service state
    console.log('🐛 Background service state:', this.backgroundService.getDebugState());
    
    // Component state
    console.log('🐛 Component state:');
    console.log('  - selectedBackground:', this.selectedBackground()?.label);
    console.log('  - customValue:', this.customBackgroundValue());
    console.log('  - overlayEnabled:', this.overlayEnabled());
    console.log('  - isApplying:', this.isApplying());
    
    // Verifica conflitos CSS
    const conflictingElements = document.querySelectorAll('[style*="background"]');
    console.log('🐛 Elementos com background inline:', conflictingElements.length);
    
    console.log('🐛 ============================');
  }

  /**
   * NOVO: Força aplicação de background para teste
   */
  forceTestBackground(): void {
    const body = document.body;
    
    console.log('🔧 Forçando background de teste...');
    
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
    
    // Adiciona classe de debug
    body.classList.add('debug-background-applied');
    
    console.log('✅ Background de teste aplicado forçadamente');
    
    setTimeout(() => {
      this.debugBackground();
    }, 100);
  }

  /**
   * NOVO: Remove todos os backgrounds para teste
   */
  clearAllBackgrounds(): void {
    const body = document.body;
    
    console.log('🧹 Removendo todos os backgrounds...');
    
    // Remove todas as propriedades de background
    body.style.removeProperty('background');
    body.style.removeProperty('background-image');
    body.style.removeProperty('background-size');
    body.style.removeProperty('background-position');
    body.style.removeProperty('background-repeat');
    body.style.removeProperty('background-attachment');
    body.style.removeProperty('background-color');
    
    // Remove classe de debug
    body.classList.remove('debug-background-applied');
    
    console.log('✅ Todos os backgrounds removidos');
    
    setTimeout(() => {
      this.debugBackground();
    }, 100);
  }

  /**
   * TrackBy function para o *ngFor
   */
  trackByFn(index: number, item: BackgroundOption): BackgroundType {
    return item.value;
  }
}