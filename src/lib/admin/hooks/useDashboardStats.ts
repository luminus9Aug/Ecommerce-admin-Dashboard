import { useQuery } from "@tanstack/react-query";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type {
  OverviewStats,
  RevenueDataPoint,
  TopCustomer,
  TopProduct,
} from "@/types/admin";

export function useOverviewStats() {
  return useQuery<OverviewStats>({
    queryKey: adminQueryKeys.overviewStats,
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>(
        "/admin/stats/overview",
      );
      console.log("Overview Data ==>>", data);
      return data?.data || data || {};
    },
    staleTime: 30_000,
  });
}

export function useRevenueStats(startDate: string, endDate: string) {
  return useQuery<RevenueDataPoint[]>({
    queryKey: adminQueryKeys.revenueStats(startDate, endDate),
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>(
        "/admin/stats/revenue",
        { params: { startDate, endDate } },
      );

      const rawData = data?.data || data || {};
      const dailyMap = rawData.dailyRevenue || {};

      return Object.entries(dailyMap).map(([date, revenue]) => ({
        date,
        revenue: Number(revenue),
        orders: 0,
      }));
    },
    enabled: Boolean(startDate && endDate),
    staleTime: 30_000,
  });
}

export function useTopProducts() {
  return useQuery<TopProduct[]>({
    queryKey: adminQueryKeys.topProducts,
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>(
        "/admin/stats/top-products",
      );
      return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    },
    staleTime: 60_000,
  });
}

export function useTopCustomers() {
  return useQuery<TopCustomer[]>({
    queryKey: adminQueryKeys.topCustomers,
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>(
        "/admin/stats/top-customers",
      );
      return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    },
    staleTime: 60_000,
  });
}

export function useHealth() {
  return useQuery<{ status: string;[k: string]: unknown }>({
    queryKey: adminQueryKeys.health,
    queryFn: async () => {
      const { data } = await adminApiClient.get("/health");
      return data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
