// Configuração de estilo para um componente específico
export interface ComponentStyle {
  selector: string;
  styles: Record<string, string | number>;
  classes?: string[];
  animations?: AnimationConfig[];
}

// Configuração de animação
export interface AnimationConfig {
  name: string;
  duration: string;
  timing: string;
  keyframes: Record<string, Record<string, string>>;
}

// Configuração de estilo para cards de produto
export interface ProductCardStyle {
  background: string | BackgroundConfig;
  border: BorderConfig;
  borderRadius: string;
  padding: string;
  shadow: string;
  hoverEffect: HoverEffectConfig;
  layout: CardLayoutConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  colors: CardColorConfig;
}

// Configuração de background (pode ser cor sólida, gradiente ou imagem)
export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'pattern';
  value: string;
  opacity?: number;
  position?: string;
  size?: string;
  repeat?: string;
}

// Configuração de borda
export interface BorderConfig {
  width: string;
  style: string;
  color: string;
  radius?: string;
}

// Configuração de efeito hover
export interface HoverEffectConfig {
  transform?: string;
  shadow?: string;
  background?: string;
  transition?: string;
  scale?: number;
}

// Configuração de layout do card
export interface CardLayoutConfig {
  direction: 'column' | 'row';
  imageRatio: string;
  contentAlign: 'left' | 'center' | 'right';
  spacing: string;
}

// Configuração de tipografia
export interface TypographyConfig {
  title: TextStyleConfig;
  description: TextStyleConfig;
  price: TextStyleConfig;
  badge: TextStyleConfig;
}

// Configuração de estilo de texto
export interface TextStyleConfig {
  fontSize: string;
  fontWeight: string;
  color: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: string;
}

// Configuração de espaçamento
export interface SpacingConfig {
  padding: string;
  margin: string;
  gap: string;
}

// Configuração de cores do card
export interface CardColorConfig {
  background: string;
  text: string;
  accent: string;
  border: string;
  badge: BadgeColorConfig;
  button: ButtonColorConfig;
}

// Configuração de cores de badge
export interface BadgeColorConfig {
  sale: { background: string; color: string };
  new: { background: string; color: string };
  featured: { background: string; color: string };
}

// Configuração de cores de botão
export interface ButtonColorConfig {
  primary: { background: string; color: string; hover: string };
  secondary: { background: string; color: string; hover: string };
}

// Configuração de menu/navegação
export interface MenuStyle {
  background: string | BackgroundConfig;
  border?: BorderConfig;
  shadow?: string;
  borderRadius?: string;
  padding?: string;
  items: MenuItemStyle;
  layout: MenuLayoutConfig;
  logo?: LogoConfig;
}

// Configuração de itens do menu
export interface MenuItemStyle {
  color: string;
  hoverColor: string;
  activeColor: string;
  fontSize: string;
  fontWeight: string;
  padding: string;
  margin: string;
  borderRadius?: string;
  background?: string;
  hoverBackground?: string;
  activeBackground?: string;
  icon?: IconConfig;
}

// Configuração de layout do menu
export interface MenuLayoutConfig {
  direction: 'horizontal' | 'vertical';
  alignment: 'left' | 'center' | 'right' | 'space-between';
  spacing: string;
  height?: string;
  position?: 'fixed' | 'sticky' | 'static';
}

// Configuração do logo
export interface LogoConfig {
  size: string;
  position: 'left' | 'center' | 'right';
  margin: string;
  image?: string;
  text?: LogoTextConfig;
}

// Configuração de texto do logo
export interface LogoTextConfig {
  content: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  fontFamily?: string;
}

// Configuração global de ícones
export interface IconConfig {
  color: string;
  hoverColor?: string;
  activeColor?: string;
  size: string;
  family?: 'primeicons' | 'fontawesome' | 'material' | 'custom';
  weight?: 'normal' | 'bold' | 'light';
}

// Configuração específica para elementos de compra/carrinho
export interface ShoppingConfig {
  cartIcon: ShoppingIconConfig;
  addToCartButton: ShoppingButtonConfig;
  cartBadge: CartBadgeConfig;
  buyNowButton?: ShoppingButtonConfig;
  wishlistIcon?: ShoppingIconConfig;
  checkoutElements: CheckoutElementsConfig;
}

// Configuração de ícones de compra
export interface ShoppingIconConfig {
  color: string;
  hoverColor: string;
  activeColor: string;
  size: string;
  background?: string;
  hoverBackground?: string;
  activeBackground?: string;
  borderRadius?: string;
  padding?: string;
  shadow?: string;
  hoverShadow?: string;
}

// Configuração de botões de compra
export interface ShoppingButtonConfig {
  background: string;
  color: string;
  hoverBackground: string;
  hoverColor: string;
  activeBackground: string;
  activeColor: string;
  border?: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  shadow?: string;
  hoverShadow?: string;
  disabledBackground?: string;
  disabledColor?: string;
  icon?: {
    color: string;
    hoverColor?: string;
    size?: string;
  };
}

// Configuração do badge do carrinho
export interface CartBadgeConfig {
  background: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  minWidth: string;
  padding: string;
  position: {
    top: string;
    right: string;
  };
  animation?: string;
}

// Configuração de elementos de checkout
export interface CheckoutElementsConfig {
  progressBar: {
    background: string;
    activeColor: string;
    completedColor: string;
  };
  priceHighlight: {
    color: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
  };
  discountBadge: {
    background: string;
    color: string;
    borderRadius?: string;
  };
}

// Configuração global de tipografia
export interface GlobalTypographyConfig {
  fontFamily: string;
  headings: {
    h1: TextStyleConfig;
    h2: TextStyleConfig;
    h3: TextStyleConfig;
    h4: TextStyleConfig;
    h5: TextStyleConfig;
    h6: TextStyleConfig;
  };
  body: TextStyleConfig;
  links: {
    color: string;
    hoverColor: string;
    activeColor: string;
    textDecoration: string;
    hoverTextDecoration: string;
  };
  buttons: {
    primary: ButtonStyleConfig;
    secondary: ButtonStyleConfig;
    success: ButtonStyleConfig;
    warning: ButtonStyleConfig;
    danger: ButtonStyleConfig;
  };
}

// Configuração de estilo de botão
export interface ButtonStyleConfig {
  background: string;
  color: string;
  border: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  hover: {
    background: string;
    color: string;
    border?: string;
    transform?: string;
  };
  active: {
    background: string;
    color: string;
    transform?: string;
  };
  disabled: {
    background: string;
    color: string;
    opacity: number;
  };
}

// Configuração de layout global
export interface GlobalLayoutConfig {
  container: {
    maxWidth: string;
    padding: string;
    margin: string;
  };
  sections: {
    padding: string;
    margin: string;
    background?: string | BackgroundConfig;
  };
  grid: {
    gap: string;
    columns: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
}

// Resposta completa do backend com configurações de estilo
export interface DynamicStylesResponse {
  tenant: string;
  version: string;
  timestamp: string;
  
  // Tema global com cores principais
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    light: string;
    dark: string;
    background: string | BackgroundConfig;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      hint: string;
    };
    border: string;
    shadow: string;
  };
  
  // Configurações globais
  globalTypography?: GlobalTypographyConfig;
  globalLayout?: GlobalLayoutConfig;
  globalIcons?: IconConfig;
  globalShopping?: ShoppingConfig;
  
  // Componentes específicos
  components: {
    productCard?: ProductCardStyle;
    productGrid?: ComponentStyle;
    menu?: MenuStyle;
    header?: ComponentStyle;
    footer?: ComponentStyle;
    navigation?: ComponentStyle;
    sidebar?: ComponentStyle;
    searchBar?: ComponentStyle;
    breadcrumb?: ComponentStyle;
    pagination?: ComponentStyle;
    [key: string]: ComponentStyle | ProductCardStyle | MenuStyle | undefined;
  };
  
  // Estilos globais e CSS customizado
  globalStyles?: ComponentStyle[];
  customCSS?: string;
  
  // Configurações específicas por breakpoint
  responsive?: {
    mobile: Partial<DynamicStylesResponse>;
    tablet: Partial<DynamicStylesResponse>;
    desktop: Partial<DynamicStylesResponse>;
  };
}

// Estado do serviço de estilos dinâmicos
export interface DynamicStylesState {
  isLoading: boolean;
  isLoaded: boolean;
  currentConfig: DynamicStylesResponse | null;
  error: string | null;
  lastUpdated: Date | null;
}