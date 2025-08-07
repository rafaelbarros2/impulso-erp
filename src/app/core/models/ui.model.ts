import { BaseEntity, ThemeMode } from './core.model';

export interface UIState extends BaseEntity {
  theme: ThemeMode;
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
  notifications: Notification[];
  modals: {
    [key: string]: boolean;
  };
  preferences: UIPreferences;
}

export interface Notification extends BaseEntity {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
  autoClose?: boolean;
  duration?: number;
  persistent?: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
  icon?: string;
}

export interface UIPreferences {
  language: string;
  dateFormat: string;
  timezone: string;
  currency: string;
  numberFormat: string;
  theme: ThemeMode;
  sidebar: {
    defaultOpen: boolean;
    defaultCollapsed: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    autoClose: boolean;
    defaultDuration: number;
  };
  table: {
    defaultPageSize: number;
    denseMode: boolean;
    showBorders: boolean;
  };
}

export interface ModalOptions {
  id: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  scrollable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  closeOnEscape?: boolean;
  data?: any;
}

export interface LoadingOptions {
  message?: string;
  backdrop?: boolean;
  delay?: number;
  minDuration?: number;
}

export interface ThemeSettings {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    light: string;
    dark: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    unit: number;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface LayoutSettings {
  header: {
    fixed: boolean;
    height: number;
  };
  sidebar: {
    fixed: boolean;
    width: number;
    collapsedWidth: number;
  };
  footer: {
    fixed: boolean;
    height: number;
  };
  content: {
    padding: number;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: NavigationItem[];
  badge?: {
    text: string;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  };
  permission?: string;
  visible?: boolean;
  disabled?: boolean;
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface ToastOptions {
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  closeable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ConfirmOptions {
  message: string;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

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
  backgroundImage?: string;
  cardStyle?: 'default' | 'minimal' | 'bordered' | 'glassmorphism';
}

export interface BackgroundConfig {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern' | 'image' | 'custom';
  value?: string;
  overlayOpacity?: number;
  overlayColor?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
}

export type BackgroundType = 'default' | 'gradient-1' | 'gradient-2' | 'gradient-3' | 
                           'pattern-1' | 'pattern-2' | 'image-1' | 'image-2' | 'image-3' | 'custom';

export type LayoutType = 'grid' | 'minimal' | 'list';