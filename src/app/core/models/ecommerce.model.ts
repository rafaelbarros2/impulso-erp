// Ecommerce models for storefront functionality
import { ID, Timestamp } from './index';

// Store configuration types
export type StoreType = 'fashion' | 'tech' | 'beauty' | 'marketplace' | 'food' | 'home';

export type StorefrontTheme = 'classic' | 'modern' | 'minimal' | 'bold' | 'elegant';

// Category models
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  itemCount?: number;
  featured?: boolean;
  color?: string;
  route?: string;
}

// Hero/Banner models
export interface HeroContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonIcon?: string;
  backgroundImage?: string;
  textColor?: 'light' | 'dark';
}

export interface HeroSlide {
  id: string;
  content: HeroContent;
  isActive?: boolean;
}

// Store configuration
export interface StoreConfig {
  id: ID;
  name: string;
  type: StoreType;
  theme: StorefrontTheme;
  isActive: boolean;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customCss?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Storefront layout configuration
export interface StorefrontLayout {
  showHero: boolean;
  showCategories: boolean;
  showFeaturedProducts: boolean;
  showTestimonials: boolean;
  showNewsletter: boolean;
  heroHeight: 'small' | 'medium' | 'large';
  categoryLayout: 'grid' | 'list' | 'cards';
  categoriesPerRow: 2 | 3 | 4 | 5 | 6;
}

// SEO and metadata
export interface StoreSeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  favicon?: string;
}

// Social media links
export interface StoreSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
  tiktok?: string;
}

// Store settings aggregate
export interface StoreSettings {
  config: StoreConfig;
  layout: StorefrontLayout;
  seo: StoreSeoSettings;
  social: StoreSocialLinks;
}

// Product display options for storefront
export interface ProductDisplaySettings {
  showPrice: boolean;
  showComparePrice: boolean;
  showDiscount: boolean;
  showRating: boolean;
  showQuickView: boolean;
  showAddToCart: boolean;
  imageStyle: 'square' | 'portrait' | 'landscape';
  cardStyle: 'default' | 'minimal' | 'detailed';
}

// Category mock data types for different store types
export type CategoryPreset = {
  [K in StoreType]: CategoryItem[];
};

// Hero slide presets for different store types  
export type HeroSlidePreset = {
  [K in StoreType]: HeroSlide[];
};

// Store type specific configurations
export interface StoreTypeConfig {
  type: StoreType;
  name: string;
  description: string;
  defaultTheme: StorefrontTheme;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  defaultCategories: CategoryItem[];
  defaultHeroSlides: HeroSlide[];
  recommendedLayout: StorefrontLayout;
}

// Badge types for product display
export enum BadgeType {
  SALE = 'sale',
  NEW = 'new',
  FEATURED = 'featured',
  LIMITED = 'limited',
  BEST_SELLER = 'best_seller'
}

export interface ProductBadge {
  type: BadgeType;
  label: string;
  color?: string;
}

// Constants for store types
export const STORE_TYPES: Array<{ value: StoreType; label: string; icon: string }> = [
  { value: 'fashion', label: 'Moda & Vestuário', icon: 'pi pi-heart' },
  { value: 'tech', label: 'Tecnologia', icon: 'pi pi-desktop' },
  { value: 'beauty', label: 'Beleza & Cosmética', icon: 'pi pi-palette' },
  { value: 'marketplace', label: 'Marketplace', icon: 'pi pi-shop' },
  { value: 'food', label: 'Alimentação', icon: 'pi pi-apple' },
  { value: 'home', label: 'Casa & Decoração', icon: 'pi pi-home' }
] as const;

export const STORE_THEMES: Array<{ value: StorefrontTheme; label: string }> = [
  { value: 'classic', label: 'Clássico' },
  { value: 'modern', label: 'Moderno' },
  { value: 'minimal', label: 'Minimalista' },
  { value: 'bold', label: 'Audacioso' },
  { value: 'elegant', label: 'Elegante' }
] as const;

// Default configurations
export const DEFAULT_STORE_CONFIG: Omit<StoreConfig, 'id' | 'name'> = {
  type: 'fashion',
  theme: 'modern',
  isActive: true,
  primaryColor: '#3B82F6',
  secondaryColor: '#64748B',
  accentColor: '#F59E0B'
};

export const DEFAULT_LAYOUT_CONFIG: StorefrontLayout = {
  showHero: true,
  showCategories: true,
  showFeaturedProducts: true,
  showTestimonials: false,
  showNewsletter: true,
  heroHeight: 'medium',
  categoryLayout: 'grid',
  categoriesPerRow: 4
};

export const DEFAULT_PRODUCT_DISPLAY: ProductDisplaySettings = {
  showPrice: true,
  showComparePrice: true,
  showDiscount: true,
  showRating: true,
  showQuickView: true,
  showAddToCart: true,
  imageStyle: 'square',
  cardStyle: 'default'
};