import { BaseEntity, PaymentStatus } from './core.model';
import { Client } from './client.model';
import { Product } from './product.model';

export interface Order extends BaseEntity {
  id: number;
  orderNumber: string;
  clientId: number;
  client: Client;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
  deliveryAddress?: DeliveryAddress;
  shippingMethod?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  internalNotes?: string;
  userId: number;
  source: 'pos' | 'online' | 'whatsapp' | 'manual';
  referenceNumber?: string;
}

export interface OrderItem extends BaseEntity {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  variantId?: number;
  variantName?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  clientId?: number;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  source?: string;
  paymentMethod?: string;
  search?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface OrderFormData {
  clientId?: number;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  discountAmount?: number;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
  deliveryAddress?: DeliveryAddress;
  shippingMethod?: string;
  notes?: string;
  source: 'pos' | 'online' | 'whatsapp' | 'manual';
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  ordersBySource: Record<string, number>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>;
  topClients: Array<{
    client: Client;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentDetails?: Record<string, any>;
  deliveryAddress?: DeliveryAddress;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  internalNotes?: string;
}

export interface OrderCancellationRequest {
  reason: string;
  refundAmount?: number;
  restockItems: boolean;
}