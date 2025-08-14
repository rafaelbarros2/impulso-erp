export type LayoutId = 'classic'|'sidebar'|'magazine'|'promotion';

export interface ExtractedTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  [key: string]: string;
}

export interface ThemeConfig {
  themeName?: string;
  tokens?: Record<string, any>;
  defaults?: { layoutId?: LayoutId };
  layouts?: Record<string, { vars?: Record<string,string> }>;
  pages?: Record<string,string>; // opcional: mapa de páginas
}

export interface ThemeTokens {
  colorPrimary600?: string;
  colorPrimary700?: string;
  heroText?: string;
  heroOverlayOpacity?: string;
}
export interface PageThemeConfig {
  tokens?: ThemeTokens;
}
