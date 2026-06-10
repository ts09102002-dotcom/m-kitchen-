export enum TableStatus {
  LOCKED = "locked",
  OPEN = "open",
  ACTIVE = "active",
  CLOSED = "closed",
}

export enum OrderItemStatus {
  CONFIRMED = "confirmed",
  PENDING_APPROVAL = "pending_approval",
}

export enum UserRole {
  CUSTOMER = "customer",
  RECEPTION = "reception",
  ADMIN = "admin",
}

export enum CouponStatus {
  ACTIVE = "active",
  USED = "used",
  EXPIRED = "expired",
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  created_at?: string;
}

export interface Table {
  id: string; // "table_1", etc.
  table_number: number;
  status: TableStatus;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  sort_order: number;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  table_number: number;
  status: "pending" | "preparing" | "cooking" | "served" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
  created_at?: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  table_number: number;
  subtotal: number;
  coupon_code: string | null;
  discount: number;
  total: number;
  created_at: string;
  closed_at: string | null;
  order_id?: string;
}

export interface BillEditLog {
  id: string;
  bill_id: string;
  user_name: string;
  timestamp: string;
  action: string;
  before_json: string;
  after_json: string;
}

export interface TodaysOffer {
  id: string;
  title: string;
  subtitle: string;
  icon_svg: string;
  animation_style: "pulse" | "shimmer" | "glow";
  is_active: boolean;
  valid_from: string;
  valid_to: string;
}

export interface Coupon {
  id: string;
  code: string;
  linked_bill_id: string | null;
  min_purchase: number;
  discount: number; // percentage or flat
  discount_type: "percentage" | "flat";
  valid_from: string;
  valid_to: string;
  status: CouponStatus;
}

export interface StockPurchase {
  id: string;
  date: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  supplier: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
  details: string;
}
