import axios from "axios";
import { toast } from "sonner";

// Spec Section 3 — baseURL is /api/backend (proxied to NestJS).
// In this TanStack Start project the proxy is implemented as a server splat
// route at src/routes/api.backend.$.ts which forwards to the NestJS host
// configured by VITE_BACKEND_URL (default http://localhost:3000/api/v1).
const adminApiClient = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor — exact behaviour from spec.
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};

    // Do NOT retry refresh calls to avoid infinite loops
    if (originalRequest.url?.includes("/auth/refresh")) {
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await adminApiClient.post("/auth/refresh");
        return adminApiClient(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong";
    toast.error(message);

    return Promise.reject(error);
  },
);

export default adminApiClient;

// Spec Section 13: currency formatter.
// Uses Vite env vars instead of NEXT_PUBLIC_*.
export const formatCurrency = (amount: number): string => {
  const code = (import.meta.env.VITE_CURRENCY_CODE as string) || "INR";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
