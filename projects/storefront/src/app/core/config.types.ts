export type LayoutId = 'classic'|'sidebar'|'magazine'|'promotion';

export interface ThemeConfig {
  themeName?: string;
  tokens?: Record<string, any>;
  defaults?: { layoutId?: LayoutId };
  layouts?: Record<string, { vars?: Record<string,string> }>;
  pages?: Record<string,string>; // opcional: mapa de páginas
}

export interface SiteConfig {
  tenantId?: string;
  storeId?: string;
  defaultLayout?: LayoutId;
  defaultThemeUrl?: string;
  pages: Record<string, string>;
}

export interface PageConfig {
  layout?: { id?: LayoutId; vars?: Record<string,string> };
  theme?: { tokens?: Record<string, any> };
  sections: Array<any>;
}
