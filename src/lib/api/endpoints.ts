export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USERS: {
    PROFILE: "/users/profile",
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
  },
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/id/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    BULK_UPDATE: "/products/bulk-update",
    BULK_DELETE: "/products/bulk-delete",
  },
  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id: string) => `/categories/${id}`,
  },
  UPLOADS: {
    SINGLE: "/uploads",
  },
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${id}`,
    BULK_UPDATE: "/admin/stats/orders/bulk-update",
  },
  STATS: {
    OVERVIEW: "/admin/stats/overview",
    REVENUE: "/admin/stats/revenue",
    TOP_PRODUCTS: "/admin/stats/top-products",
    TOP_CUSTOMERS: "/admin/stats/top-customers",
  },
  SUPPORT: {
    TICKETS_ALL: "/support/tickets/all",
    TICKET_BY_ID: (id: string) => `/support/tickets/${id}`,
  },
  B2B: {
    QUOTES_ALL: "/b2b/quotes/all",
    CREDIT_TERMS: "/b2b/credit-terms",
  },
  BLOGS: {
    BASE: "/blog/posts",
    ADMIN_ALL: "/blog/posts/admin/all",
    CATEGORIES: "/blog/posts/categories",
    BY_ID: (id: string) => `/blog/posts/id/${id}`,
    BY_SLUG: (slug: string) => `/blog/posts/${slug}`,
  },
  HEALTH: "/health",
};
