import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ThemeService } from '../../../../core/services/legacy-theme.service';
import { StoreTheme } from '../../../../core/models';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ThemeOption {
  label: string;
  value: string;
  theme: StoreTheme;
}

@Component({
  selector: 'app-storefront-theme-selector',
  templateUrl: './storefront-theme-selector.component.html',
  styleUrls: ['./storefront-theme-selector.component.scss'],
  standalone: true,
  imports: [DropdownModule, FormsModule, CommonModule],
  providers: [ThemeService],
})
export class StorefrontThemeSelectorComponent {
  
  // Injeção de dependência do serviço
  private themeService = inject(ThemeService);

  // Opções do dropdown
  themeOptions: ThemeOption[] = this.themeService.getAvailableThemes().map((theme: StoreTheme) => ({
    label: theme.name,
    value: theme.id,
    theme: theme
  }));

  // Signal para o tema selecionado no dropdown
  selectedTheme = signal<ThemeOption | null>(null);

  constructor() {
    // Inicializa o tema selecionado com base no tema atual do serviço
    const currentTheme = this.themeService.currentTheme();
    if (currentTheme) {
      this.selectedTheme.set(this.themeOptions.find(option => option.value === currentTheme.id) || null);
    }
  }

  /**
   * Manipula a mudança de tema no dropdown
   * @param event Evento do PrimeNG dropdown
   */
  onThemeChange(event: any): void {
    const selectedOption: ThemeOption = event.value;
    
    if (selectedOption && selectedOption.value) {
      this.themeService.setTheme(selectedOption.value);
      console.log(`Tema alterado para: ${selectedOption.label}`);
    }
  }

  /**
   * Obtém a cor primária do tema selecionado para estilização
   * usando um computed signal
   */
  selectedThemePrimaryColor = computed(() => {
    return this.selectedTheme()?.theme.primaryColor || '#D81B60';
  });

  /**
   * Obtém a cor secundária do tema selecionado para estilização
   * usando um computed signal
   */
  selectedThemeSecondaryColor = computed(() => {
    return this.selectedTheme()?.theme.secondaryColor || '#F8BBD9';
  });
}
