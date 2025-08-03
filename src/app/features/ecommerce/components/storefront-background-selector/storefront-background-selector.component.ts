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

interface BackgroundOption {
  label: string;
  value: BackgroundType;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-storefront-background-selector',
  templateUrl: './storefront-background-selector.component.html',
  imports: [DropdownModule, ButtonModule, InputTextModule, CommonModule, FormsModule, ChipModule, TooltipModule],
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

  // Estados do componente
  selectedBackground = signal<BackgroundOption | null>(null);
  showCustomControls = signal<boolean>(false);
  customBackgroundValue = signal<string>('');

  constructor() {}

  ngOnInit(): void {
    // Inicializa o estado do componente com base no Signal do serviço
    const currentBg = this.backgroundService.currentBackground();
    this.updateSelectedBackground(currentBg);

    // O uso de `effect` pode ser uma alternativa, mas
    // a injeção direta já garante a reatividade no template.
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
        this.showCustomControls.set(matchingOption.value === 'custom');
      } else {
        // Se for um background customizado, seleciona a opção "Personalizado"
        const customOption = this.backgroundOptions.find(opt => opt.value === 'custom');
        this.selectedBackground.set(customOption || null);
        this.showCustomControls.set(true);
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
  onBackgroundChange(event: { value: BackgroundOption }): void {
    const selectedOption: BackgroundOption = event.value;
    
    if (selectedOption) {
      this.showCustomControls.set(selectedOption.value === 'custom');
      
      if (selectedOption.value !== 'custom') {
        this.backgroundService.applyBackground(selectedOption.value);
        this.customBackgroundValue.set('');
        console.log(`Background alterado para: ${selectedOption.label}`);
      }
    }
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
   * Limpa o background (volta ao padrão)
   */
  clearBackground(): void {
    this.backgroundService.clearBackground();
    this.customBackgroundValue.set('');
  }

  /**
   * Verifica se um background está aplicado (não é o padrão)
   */
  hasBackgroundApplied = computed(() => {
    return this.currentBackground()?.id !== 'default';
  });

  /**
   * Retorna o ícone apropriado para o overlay toggle
   */
  overlayToggleIcon = computed(() => {
    return this.overlayEnabled() ? 'pi pi-eye-slash' : 'pi pi-eye';
  });

  /**
   * Retorna o tooltip para o overlay toggle
   */
  overlayToggleTooltip = computed(() => {
    return this.overlayEnabled() ? 'Desativar overlay' : 'Ativar overlay';
  });

  /**
   * Valida se o valor customizado é válido
   */
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

  /**
   * TrackBy function para o *ngFor
   */
  trackByFn(index: number, item: BackgroundOption): BackgroundType {
    return item.value;
  }
}
