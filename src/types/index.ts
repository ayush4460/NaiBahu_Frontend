/**
 * TypeScript Type Definitions
 * All types used across the application
 */

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

import { SPICE_LEVELS } from '@/lib/spice';

export type SpiceLevel = keyof typeof SPICE_LEVELS;
export { SPICE_LEVELS };

export interface User {
  user_id: number;
  email: string;
  mobile: string;
  full_name: string;
  role: 'admin' | 'captain';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ============================================
// TABLE TYPES
// ============================================

export type TableStatus = 'empty' | 'running' | 'billed';

export interface Table {
  table_id: number;
  table_number: string;
  table_block: string;
  seating_capacity: number;
  status: TableStatus;
  current_order_id: number | null;
  last_occupied_at: string | null;
  created_at: string;
  updated_at: string;
  total_amount?: number;
}

export interface TableWithOrder extends Table {
  current_order?: Order;
  current_amount?: number;
}

// ============================================
// MENU TYPES
// ============================================

export interface MenuCategory {
  category_id: number;
  category_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  item_id: number;
  category_id: number;
  item_name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  is_vegetarian: boolean;
  preparation_time: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: MenuCategory;
   is_spicy: boolean;
  spice_level: SpiceLevel | null;
  is_recommended: boolean;
  recommendation_type: string | null;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'served' 
  | 'billed' 
  | 'cancelled';

// UPDATE OrderItem to include spice_preference from backend
export interface OrderItem {
  order_item_id?: number;
  menu_item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  
  // Critical: This allows spice to survive from cart → backend → bill
  spice_preference?: SpiceLevel | null;
}

export interface Order {
  order_id: number;
  table_id: number;
  captain_id: number;
  order_number: string;
  order_status: OrderStatus;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  order_date: string;
  billed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  table?: Table;
  captain?: User;
}

export interface CreateOrderDTO {
  table_id: number;
  items: {
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }[];
  notes?: string;
}

export interface AddItemsDTO {
  items: {
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }[];
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'phonepe' | 'googlepay' | 'paytm';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  transaction_id: string | null;
  payment_status: PaymentStatus;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessPaymentDTO {
  order_id: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  transaction_id?: string;
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export interface SocketOrderCreatedEvent {
  order_id: number;
  table_id: number;
  order_number: string;
  total_amount: number;
  timestamp: string;
}

export interface SocketOrderUpdatedEvent {
  order_id: number;
  table_id: number;
  action: string;
  timestamp: string;
}

export interface SocketTableStatusEvent {
  table_id: number;
  status: TableStatus;
  color: string;
  timestamp: string;
}

export interface SocketPaymentCompletedEvent {
  payment_id: number;
  order_id: number;
  amount: number;
  payment_method: PaymentMethod;
  timestamp: string;
}

// ============================================
// CART/KOT TYPES (Frontend only)
// ============================================



// Also update CartItem to use same type
export interface CartItem extends MenuItem {
  quantity: number;
  special_instructions?: string;
  spice_preference?: SpiceLevel | null;  // consistent with OrderItem
}

export interface KOTPreview {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface DashboardStats {
  runningTables: number;
  totalOrders: number;
  totalSales: number;
  pendingBills: number;
  todayOrders: number;
  todaySales: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface TopSellingItem {
  item_id: number;
  item_name: string;
  total_quantity: number;
  total_revenue: number;
}

// ============================================
// REPORT TYPES
// ============================================

export interface DailyReport {
  date: string;
  total_orders: number;
  total_sales: number;
  payment_breakdown: {
    cash: number;
    card: number;
    upi: number;
  };
  top_items: TopSellingItem[];
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  daily_sales: SalesData[];
  total_sales: number;
  total_orders: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  total_sales: number;
  total_orders: number;
  daily_breakdown: SalesData[];
  top_items: TopSellingItem[];
}

// ============================================
// THEME TYPES
// ============================================

export type Theme = 'light' | 'dark';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface CreateMenuItemFormData {
  category_id: number;
  item_name: string;
  description: string;
  price: number;
  is_vegetarian: boolean;
  preparation_time: number;
  image_url?: string;
}

export interface CreateCaptainFormData {
  email: string;
  password: string;
  mobile: string;
  full_name: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStatus {
  state: LoadingState;
  message?: string;
}

// Type helpers
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};


// Payment Method Type
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'phonepe' | 'googlepay' | 'paytm';

// Payment Status Type
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Process Payment DTO
 * This is what the backend expects
 */
export interface ProcessPaymentDTO {
  order_id: number;
  payment_method: PaymentMethod;
  amount_paid: number;
  reference_number?: string | null;
  notes?: string | null;
}

/**
 * Payment Record
 */
export interface Payment {
  payment_id: number;
  order_id: number;
  transaction_id: string | null;
  payment_method: PaymentMethod;
  amount_paid: number;
  reference_number?: string;
  status: PaymentStatus;
  payment_date: string;
  processed_by: number;
  processed_by_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payment with Order Details
 */
export interface PaymentWithOrder extends Payment {
  order_number: string;
  table_id: number;
  table_number: string;
  table_block: string;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
}

/**
 * Payment Statistics
 */
export interface PaymentStats {
  by_status: {
    status: PaymentStatus;
    count: number;
    total_amount: number;
  }[];
  by_method: {
    payment_method: PaymentMethod;
    count: number;
    total_amount: number;
  }[];
  totals: {
    total_transactions: number;
    total_amount: number;
    average_amount: number;
  };
}
