import { LayoutId } from './theme.interfaces';

export interface SiteConfig {
  tenantId?: string;
  storeId?: string;
  defaultLayout?: LayoutId;
  defaultThemeUrl?: string;
  pages: Record<string, string>;
}
