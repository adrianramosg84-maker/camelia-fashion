// ─── Tipos compartidos de la aplicación ───────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price?: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PaymentConfig {
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  accountType: string;
  yapeNumber: string;
  plinNumber: string;
  yapeQR: string;
  plinQR: string;
  paypalEmail: string;
  whatsappNumber: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  zipCode: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed';
}
