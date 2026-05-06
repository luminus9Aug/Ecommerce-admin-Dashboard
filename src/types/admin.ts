// ─── Auth ────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "super_admin";
}

// ─── Stats ───────────────────────────────────────────────
export interface OverviewStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueChange: number;
  totalOrders: number;
  ordersThisMonth: number;
  ordersChange: number;
  totalUsers: number;
  newUsersThisMonth: number;
  pendingB2BApprovals: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  imageUrl: string;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
}

// ─── Product ─────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  parentId?: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  b2bPrice?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  slug: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  b2bPrice?: number;
  stockQuantity: number;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  hasVariants: boolean;
  images: ProductImage[];
  category?: Category;
  categoryId?: string;
  variants: ProductVariant[];
  specifications?: Record<string, any>;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  searchKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductImagePayload {
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CreateProductVariantPayload {
  name?: string;
  skuSuffix?: string;
  attributes?: Record<string, string>;
  mrp: number;
  sellingPrice: number;
  b2bPrice?: number;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface CreateProductPayload {
  name: string;
  brand?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  mrp?: number;
  sellingPrice?: number;
  b2bPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  sku?: string;
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: CreateProductImagePayload[];
  variants?: CreateProductVariantPayload[];
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  searchKeywords?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
    count: number;
  };
}

// ─── Order ───────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "completed";

export type PaymentMethod = "cod" | "razorpay" | "stripe";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
  mrp: number;
  variantId?: string;
  attributes?: Record<string, string>;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  company?: string;
  email?: string;
  country?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  couponDiscount: number;
  deliveryCharges: number;
  couponCode?: string;
  paymentId?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  trackingNumber?: string;
  returnStatus?: "none" | "requested" | "approved" | "rejected" | "completed";
  returnReason?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── User ────────────────────────────────────────────────
export type UserRole = "user" | "b2b" | "admin" | "super_admin";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isApproved?: boolean;
  approvedAt?: string;
  emailVerified: boolean;
  companyName?: string;
  gstNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── B2B ─────────────────────────────────────────────────
export interface Company {
  id: string;
  businessName: string;
  gstNumber: string;
  businessType: string;
  isVerified: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export type QuoteStatus = "pending" | "approved" | "rejected" | "converted";

export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Quote {
  id: string;
  status: QuoteStatus;
  products: QuoteItem[];
  notes?: string;
  quotedPrice?: number;
  validUntil?: string;
  adminNotes?: string;
  company: Company;
  createdAt: string;
}

export interface CreditTerm {
  id: string;
  companyId: string;
  company: Company;
  requestedLimit: number;
  approvedLimit?: number;
  netDays?: number;
  outstandingBalance: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  companyId: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: "unpaid" | "paid" | "overdue";
  createdAt: string;
}

// ─── Content ─────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  linkTarget: "_self" | "_blank";
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywords?: string[];
  publishedAt?: string;
  readTime?: number;
  excerpt?: string;
  author: User;
  category?: BlogCategory;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostPayload {
  title: string;
  slug?: string;
  content: string;
  thumbnail?: string;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywords?: string[];
  publishedAt?: string;
  readTime?: number;
  excerpt?: string;
  categoryId?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  faviconUrl?: string;
  isActive: boolean;
}

// ─── Marketing ───────────────────────────────────────────
export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

// ─── Support ─────────────────────────────────────────────
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface SupportMessage {
  id: string;
  message: string;
  senderName: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  guestName?: string;
  guestEmail?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Config ───────────────────────────────────────
export interface PaymentMethodConfig {
  cod: { enabled: boolean; maxOrderAmount?: number };
  razorpay: { enabled: boolean; keyId?: string; keySecret?: string };
  stripe: { enabled: boolean; publishableKey?: string; secretKey?: string };
}

// ─── Tenant ───────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
}

// ─── Ad Slots ───────────────────────────────────────────
export enum AdSlotType {
  AD = "AD",
  BANNER = "BANNER",
  PROMO_STRIP = "PROMO_STRIP",
}

export enum AdSlotVariant {
  DEFAULT = "default",
  SIDEBAR = "sidebar",
  BANNER = "banner",
  ROW = "row",
  VERTICAL = "vertical",
  SIDEBAR_CARD = "sidebarCard",
  TWO_COLUMN = "twoColumn",
}

export interface AdSlot {
  id: string;
  position: string;
  type: AdSlotType;
  variant: AdSlotVariant;
  order: number;
  imageUrl: string;
  mobileImageUrl?: string;
  altText?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  offerEndsLabel?: string;
  offerEndsValue?: string;
  bgColor?: string;
  textColor?: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdSlotPayload {
  position: string;
  type: AdSlotType;
  variant: AdSlotVariant;
  order: number;
  imageUrl: string;
  mobileImageUrl?: string;
  altText?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  offerEndsLabel?: string;
  offerEndsValue?: string;
  bgColor?: string;
  textColor?: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

// ─── Notification Badges ──────────────────────────────────
export interface NotificationBadges {
  pendingB2BApprovals: number;
  pendingQuotes: number;
  openTickets: number;
  pendingCreditTerms: number;
}

export interface OrderTracking {
  id: string;
  status: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceConfig {
  id: string;
  businessName: string;
  gstin?: string;
  pan?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  email?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  taxType: "cgst_sgst" | "igst";
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  notes?: string;
  invoiceType: "b2c" | "b2b";
  taxBreakdown: Record<string, any>;
  order: Order;
  invoiceConfig?: InvoiceConfig;
  createdAt: string;
  updatedAt: string;
}
