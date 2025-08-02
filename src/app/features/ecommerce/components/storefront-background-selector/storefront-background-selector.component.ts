import { Component, OnInit, OnDestroy, input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BackgroundConfig, BackgroundService, BackgroundType } from '../../../../core/services/background.service';
import { DropdownModule } from 'primeng/dropdown';
import {  ButtonModule } from 'primeng/button';
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
  providers: [BackgroundService],
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
  
  private destroy$ = new Subject<void>();
  
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
  
  // Estados do componente
  selectedBackground: BackgroundOption | null = null;
  showCustomControls: boolean = false;
  customBackgroundValue: string = '';
  overlayEnabled: boolean = false;
  currentBackground: BackgroundConfig | null = null;
  
  constructor(private backgroundService: BackgroundService) {}

  ngOnInit(): void {
    this.subscribeToBackgroundChanges();
    this.subscribeToOverlayChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Se inscreve nas mudanças de background
   */
  private subscribeToBackgroundChanges(): void {
    this.backgroundService.currentBackground$
      .pipe(takeUntil(this.destroy$))
      .subscribe(background => {
        this.currentBackground = background;
        if (background) {
          // Encontra a opção correspondente
          const matchingOption = this.backgroundOptions.find(option => 
            option.value === background.id as BackgroundType
          );
          
          if (matchingOption) {
            this.selectedBackground = matchingOption;
            this.showCustomControls = matchingOption.value === 'custom';
          } else {
            // Background customizado
            this.selectedBackground = this.backgroundOptions.find(opt => opt.value === 'custom') || null;
            this.showCustomControls = true;
            this.customBackgroundValue = background.value || '';
          }
        }
      });
  }

  /**
   * Se inscreve nas mudanças de overlay
   */
  private subscribeToOverlayChanges(): void {
    this.backgroundService.overlayEnabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.overlayEnabled = enabled;
      });
  }

  /**
   * Manipula a mudança de background no dropdown
   * @param event Evento do PrimeNG dropdown
   */
  onBackgroundChange(event: any): void {
    const selectedOption: BackgroundOption = event.value;
    
    if (selectedOption) {
      this.showCustomControls = selectedOption.value === 'custom';
      
      if (selectedOption.value !== 'custom') {
        this.backgroundService.applyBackground(selectedOption.value);
        console.log(`Background alterado para: ${selectedOption.label}`);
      }
    }
  }

  /**
   * Aplica background personalizado
   */
  applyCustomBackground(): void {
    if (this.customBackgroundValue.trim()) {
      this.backgroundService.applyCustomBackground(this.customBackgroundValue.trim());
      console.log('Background personalizado aplicado:', this.customBackgroundValue);
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
    this.customBackgroundValue = '';
  }

  /**
   * Verifica se um background está aplicado (não é o padrão)
   */
  get hasBackgroundApplied(): boolean {
    return this.currentBackground?.id !== 'default';
  }

  /**
   * Retorna o ícone apropriado para o overlay toggle
   */
  get overlayToggleIcon(): string {
    return this.overlayEnabled ? 'pi pi-eye-slash' : 'pi pi-eye';
  }

  /**
   * Retorna o tooltip para o overlay toggle
   */
  get overlayToggleTooltip(): string {
    return this.overlayEnabled ? 'Desativar overlay' : 'Ativar overlay';
  }

  /**
   * Valida se o valor customizado é válido
   */
  get isCustomValueValid(): boolean {
    const value = this.customBackgroundValue.trim();
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
}