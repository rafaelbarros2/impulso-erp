import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreTheme, ThemeService } from '../../../../core/services/theme-service.service';
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
  imports: [DropdownModule,FormsModule,CommonModule],
  providers: [ThemeService],
})
export class StorefrontThemeSelectorComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  
  // Opções do dropdown
  themeOptions: ThemeOption[] = [];
  
  // Tema selecionado
  selectedTheme: ThemeOption | null = null;
  
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.initializeThemeOptions();
    this.subscribeToCurrentTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa as opções do dropdown com base nos temas disponíveis
   */
  private initializeThemeOptions(): void {
    const availableThemes = this.themeService.getAvailableThemes();
    
    this.themeOptions = availableThemes.map(theme => ({
      label: theme.name,
      value: theme.id,
      theme: theme
    }));
  }

  /**
   * Se inscreve no tema atual para sincronizar o dropdown
   */
  private subscribeToCurrentTheme(): void {
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentTheme => {
        if (currentTheme) {
          this.selectedTheme = this.themeOptions.find(option => 
            option.value === currentTheme.id
          ) || null;
        }
      });
  }

  /**
   * Manipula a mudança de tema no dropdown
   * @param event Evento do PrimeNG dropdown
   */
  onThemeChange(event: any): void {
    const selectedOption: ThemeOption = event.value;
    
    if (selectedOption && selectedOption.value) {
      this.themeService.applyTheme(selectedOption.value);
      console.log(`Tema alterado para: ${selectedOption.label}`);
    }
  }

  /**
   * Obtém a cor primária do tema selecionado para estilização
   */
  get selectedThemePrimaryColor(): string {
    return this.selectedTheme?.theme.primaryColor || '#D81B60';
  }

  /**
   * Obtém a cor secundária do tema selecionado para estilização
   */
  get selectedThemeSecondaryColor(): string {
    return this.selectedTheme?.theme.secondaryColor || '#F8BBD9';
  }
}