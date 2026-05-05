export const adminQueryKeys = {
  // Stats
  overviewStats: ["admin", "stats", "overview"] as const,
  revenueStats: (startDate: string, endDate: string) =>
    ["admin", "stats", "revenue", startDate, endDate] as const,
  topProducts: ["admin", "stats", "top-products"] as const,
  topCustomers: ["admin", "stats", "top-customers"] as const,
  dashboardData: (startDate: string, endDate: string) =>
    ["admin", "stats", "dashboard", startDate, endDate] as const,

  // Products
  products: (filters: object) => ["admin", "products", filters] as const,
  product: (id: string) => ["admin", "products", id] as const,

  // Categories
  categories: ["admin", "categories"] as const,
  category: (id: string) => ["admin", "categories", id] as const,

  // Orders
  orders: (filters: object) => ["admin", "orders", filters] as const,
  order: (id: string) => ["admin", "orders", id] as const,

  // Users
  users: (filters: object) => ["admin", "users", filters] as const,
  user: (id: string) => ["admin", "users", id] as const,

  // B2B
  companies: (filters: object) =>
    ["admin", "b2b", "companies", filters] as const,
  company: (id: string) => ["admin", "b2b", "companies", id] as const,
  quotes: (filters: object) => ["admin", "b2b", "quotes", filters] as const,
  quote: (id: string) => ["admin", "b2b", "quotes", id] as const,
  creditTerms: ["admin", "b2b", "credit-terms"] as const,
  invoices: ["admin", "b2b", "invoices"] as const,

  // Content
  banners: ["admin", "content", "banners"] as const,
  blogPosts: (filters: object) =>
    ["admin", "content", "blog-posts", filters] as const,
  blogPost: (id: string) => ["admin", "content", "blog-posts", id] as const,
  blogCategories: ["admin", "content", "blog-categories"] as const,
  faqs: ["admin", "content", "faqs"] as const,
  themes: ["admin", "content", "themes"] as const,

  // Marketing
  coupons: ["admin", "marketing", "coupons"] as const,
  newsletterSubscribers: ["admin", "marketing", "newsletter"] as const,
  adSlots: (filters: object) => ["admin", "marketing", "ad-slots", filters] as const,
  adSlot: (id: string) => ["admin", "marketing", "ad-slots", id] as const,

  // Support
  tickets: (filters: object) =>
    ["admin", "support", "tickets", filters] as const,
  ticket: (id: string) => ["admin", "support", "tickets", id] as const,

  // System
  paymentMethods: ["admin", "payments", "methods"] as const,
  tenants: ["admin", "system", "tenants"] as const,
  health: ["admin", "system", "health"] as const,

  // Notifications
  notificationBadges: ["admin", "notifications", "badges"] as const,
};
