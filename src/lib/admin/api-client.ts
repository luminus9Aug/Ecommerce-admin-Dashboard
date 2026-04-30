import axios from "axios";
import { toast } from "sonner";
import { env } from "../env";

const adminApiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

// Request interceptor for debug logging
adminApiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
    return config;
  },
  (error) => {
    console.error(`[API Request Error]`, error);
    return Promise.reject(error);
  }
);

adminApiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config ?? {};
    console.error(`[API Response Error] ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - Status: ${error.response?.status}`, error.response?.data || error.message);

    // Do not intercept refresh calls (to avoid infinite loops) or login calls (where 401 just means bad password)
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      if (
        originalRequest.url?.includes("/auth/refresh") &&
        typeof window !== "undefined"
      ) {
        window.location.href = "/admin/login";
      }
      // Let the login form or the original caller handle the error directly
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong";
      toast.error(message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          console.log(`[API Auth] Starting new token refresh...`);
          refreshPromise = adminApiClient
            .post("/auth/refresh")
            .then((res) => {
              // Extract the new token from the response body depending on the API structure
              const token = res.data?.data?.accessToken || res.data?.accessToken;
              return token;
            })
            .finally(() => {
              // Always clear the promise so future 401s can trigger a new refresh
              refreshPromise = null;
            });
        } else {
          console.log(`[API Auth] Waiting for existing token refresh to complete...`);
        }

        // Wait for the refresh (either the one we started, or the one already in progress)
        const newAccessToken = await refreshPromise;
        console.log(`[API Auth] Token refresh successful. Retrying original request.`);

        if (newAccessToken) {
          // Inject the new token into the retried request to bypass cookie race conditions
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return adminApiClient(originalRequest);
      } catch (refreshError) {
        console.error(`[API Auth] Token refresh failed.`);
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(error); // Reject with the original error
      }
    }

    // Allow requests to opt-out of global error toasts
    if (!(originalRequest as any)._silent) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default adminApiClient;

export const formatCurrency = (amount: number): string => {
  const code = env.VITE_CURRENCY_CODE;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
