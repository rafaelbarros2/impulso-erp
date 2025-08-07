import { BaseEntity } from './core.model';
import { DeliveryAddress } from './order.model';

export interface CartItem extends BaseEntity {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    sku: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Cart extends BaseEntity {
  id?: number;
  userId?: number;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  appliedDiscount?: AppliedDiscount;
  expiresAt?: Date;
}

export interface AppliedDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  amount: number;
  description?: string;
}

export interface CheckoutRequest {
  clientId?: number;
  clientInfo?: {
    name: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
  };
  paymentMethod: PaymentMethod;
  deliveryAddress?: DeliveryAddress;
  notes?: string;
  discountCode?: string;
}

export interface PaymentMethod {
  type: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check';
  details: Record<string, any>;
}


export interface CheckoutResponse {
  order: any; // Using any to avoid circular dependency with Order model
  paymentUrl?: string;
  qrCode?: string;
  instructions?: string;
}

export interface OnlineProduct extends BaseEntity {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  inStock: boolean;
  featured: boolean;
  rating: {
    average: number;
    count: number;
    stars: number;
  };
  badges?: { type: string; label: string; color?: string }[];
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  variants?: OnlineProductVariant[];
  image?: string;
  imageAlt?: string;
  attributes?: Record<string, string>;
  createdAt?: Date;
}

export interface OnlineProductVariant extends BaseEntity {
  id: number;
  onlineProductId: number;
  name: string;
  sku: string;
  price: number;
  images: string[];
  attributes: Record<string, string>;
  inStock: boolean;
}

export interface CartStoreSettings extends BaseEntity {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  logo: string;
  favicon: string;
  name: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    address?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  paymentMethods: string[];
  shipping: {
    freeShippingMinAmount?: number;
    regions: Array<{
      name: string;
      price: number;
      estimatedDays: number;
    }>;
  };
}