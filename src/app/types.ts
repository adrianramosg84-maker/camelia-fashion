// ─── Tipos compartidos de la aplicación ───────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  price?: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  sizes?: string[];   // Tallas disponibles: S, M, L, XL, XXL, XXXL
  colors?: string[];  // Colores disponibles
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
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
  status: 'pending' | 'confirmed' | 'rejected';
}
