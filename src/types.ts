export type DepartmentKey = 'tenis' | 'roupa' | 'acessorios' | 'relogios' | 'eletronicos' | string;

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // e.g. 'Footprints', 'Shirt', 'Sparkles', 'Watch', 'Headphones', 'Package'
  subcategories: string[];
  bannerImage?: string;
  bannerTag?: string;
  featured?: boolean;
  isActive?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
}

export interface Sneaker {
  id: string;
  name: string;
  brand: string;
  brandId?: string;
  brandLogo?: string;
  category: 'louis-vuitton' | 'nike' | 'jordan' | 'yeezy' | 'balenciaga' | 'hype' | 'casual' | string;
  department?: DepartmentKey;
  subcategory?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  image: string;
  gallery?: string[];
  sizes: (number | string)[];
  sizeStock?: Record<string, number>; // Quantidade real por tamanho (ex: { '42': 2, '41': 0 })
  sizeType?: 'shoes' | 'clothing' | 'one_size';
  inStock: boolean;
  featured?: boolean;
  tag?: string;
  description: string;
  details: string[];
}

export type Product = Sneaker;

export interface CartItem {
  product: Sneaker;
  size: number | string;
  quantity: number;
}

export interface BrandFilter {
  name: string;
  subtitle: string;
  logo: string;
  image: string;
  brandKey: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  size: number | string;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'Pendente' 
  | 'Pago' 
  | 'Enviado CTT' 
  | 'Concluído' 
  | 'Cancelado' 
  | 'Em Processamento' 
  | 'Em Trânsito' 
  | 'Entregue';

export interface Order {
  id: string; // e.g. "KC-98421PT"
  customerName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  notes?: string;
  paymentMethod: 'mbway' | 'card' | 'multibanco';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  trackingCode: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin' | 'manager';
  lastLogin: string;
}

export interface ToastMessage {
  id: string;
  type: 'cart' | 'wishlist-add' | 'wishlist-remove' | 'info' | 'success';
  title: string;
  message?: string;
  product?: {
    name: string;
    brand: string;
    image: string;
    size?: number | string;
    price?: number;
  };
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}
