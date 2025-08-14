export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface ShippingOption {
  type: string;
  price: number;
  days: string;
}
