import { Injectable, signal, Signal } from '@angular/core';

// Interface para definir a estrutura de um tema
export interface StoreTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  fontFamily: string;
  backgroundImage?: string; // URL da imagem de fundo (opcional)
  cardStyle?: 'default' | 'minimal' | 'bordered' | 'glassmorphism'; // Estilo do card
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Temas mockados para demonstração
  private themes: StoreTheme[] = [
    {
      id: 'fashion-chic',
      name: 'Fashion Chic (Rosa)',
      primaryColor: '#D81B60', // Rosa escuro
      secondaryColor: '#FFCDD2', // Rosa claro
      accentColor: '#8E24AA', // Roxo
      backgroundColor: '#FCE4EC', // Rosa muito claro
      cardBackground: '#FFFFFF',
      textColor: '#424242',
      fontFamily: "'Playfair Display', serif",
      backgroundImage: 'https://images.unsplash.com/photo-1513094708712-5881665a3424?auto=format&fit=crop&q=80&w=1920&h=1080',
      cardStyle: 'bordered'
    },
    {
      id: 'tech-minimal',
      name: 'Tech Minimal (Azul)',
      primaryColor: '#3B82F6', // Azul primário
      secondaryColor: '#EFF6FF', // Azul claro
      accentColor: '#1D4ED8', // Azul escuro
      backgroundColor: '#F8FAFC', // Cinza muito claro
      cardBackground: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: "'Inter', sans-serif",
      backgroundImage: 'https://images.unsplash.com/photo-1519389950473-47ba0cfaee5d?auto=format&fit=crop&q=80&w=1920&h=1080',
      cardStyle: 'minimal'
    },
    {
      id: 'sport-power',
      name: 'Sport Power (Verde)',
      primaryColor: '#10B981', // Verde esporte
      secondaryColor: '#ECFDF5', // Verde claro
      accentColor: '#059669', // Verde escuro
      backgroundColor: '#F0FDF4', // Verde muito claro
      cardBackground: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: "'Roboto Condensed', sans-serif",
      backgroundImage: 'https://images.unsplash.com/photo-1542291026-7eec264c655f?auto=format&fit=crop&q=80&w=1920&h=1080',
      cardStyle: 'default'
    },
    {
      id: 'makeup-glam',
      name: 'Maquiagem Glam (Roxo)',
      primaryColor: '#8B5CF6', // Roxo
      secondaryColor: '#F3E8FF', // Roxo claro
      accentColor: '#D946EF', // Rosa choque
      backgroundColor: '#FDF2F8', // Rosa/roxo muito claro
      cardBackground: 'rgba(255, 255, 255, 0.7)', // Fundo translúcido
      textColor: '#4C0519', // Cor de texto escura para contraste
      fontFamily: "'Montserrat', sans-serif",
      backgroundImage: 'https://images.unsplash.com/photo-1557850841-f7615951d384?auto=format&fit=crop&q=80&w=1920&h=1080',
      cardStyle: 'glassmorphism' // Exemplo de glassmorphism
    }
  ];

  private _currentTheme = signal<StoreTheme | null>(null);
  currentTheme: Signal<StoreTheme | null> = this._currentTheme.asReadonly();

  constructor() {
    // Tenta carregar o tema do localStorage ou aplica um padrão
    const savedThemeId = localStorage.getItem('currentThemeId');
    if (savedThemeId) {
      this.applyTheme(savedThemeId);
    } else {
      // Aplica o tema 'fashion-chic' como padrão se nenhum for salvo
      this.applyTheme('fashion-chic');
    }
  }

  /**
   * Aplica um tema com base no seu ID.
   * @param themeId O ID do tema a ser aplicado.
   */
  applyTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      this._currentTheme.set(theme);
      this.setCssVariables(theme);
      localStorage.setItem('currentThemeId', theme.id);
    } else {
      console.warn(`Tema com ID "${themeId}" não encontrado.`);
    }
  }

  /**
   * Retorna a lista de temas disponíveis.
   * @returns Um array de StoreTheme.
   */
  getAvailableThemes(): StoreTheme[] {
    return this.themes;
  }

  /**
   * Define as variáveis CSS customizadas no elemento <html> do documento.
   * @param theme O objeto de tema a ser aplicado.
   */
  private setCssVariables(theme: StoreTheme): void {
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--card-background', theme.cardBackground);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--font-family', theme.fontFamily);

    // Aplica a imagem de fundo ao <body> ou <html>
    if (theme.backgroundImage) {
      root.style.setProperty('--background-image', `url(${theme.backgroundImage})`);
      root.style.setProperty('--background-size', 'cover');
      root.style.setProperty('--background-position', 'center');
      root.style.setProperty('--background-repeat', 'no-repeat');
      root.style.setProperty('--background-attachment', 'fixed'); // Para fixar o fundo
    } else {
      root.style.removeProperty('--background-image');
      root.style.removeProperty('--background-size');
      root.style.removeProperty('--background-position');
      root.style.removeProperty('--background-repeat');
      root.style.removeProperty('--background-attachment');
    }
  }
}
