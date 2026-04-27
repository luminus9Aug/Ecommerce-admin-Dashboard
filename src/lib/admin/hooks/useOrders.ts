import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type {
  Order,
  OrderStatus,
  PaginatedResponse,
  PaymentMethod,
} from "@/types/admin";

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | "";
  paymentMethod?: PaymentMethod | "";
  startDate?: string;
  endDate?: string;
}

export function useOrders(filters: OrderFilters) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: adminQueryKeys.orders(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get<PaginatedResponse<Order>>(
        "/orders/all",
        { params: filters },
      );
      return data;
    },
    staleTime: 30_000,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<Order>({
    queryKey: adminQueryKeys.order(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: OrderStatus) => {
      const { data } = await adminApiClient.patch(`/orders/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated");
    },
  });
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await adminApiClient.post(`/orders/${id}/cancel`, {
        reason,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order cancelled");
    },
  });
}

export function useReturnOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await adminApiClient.post(`/orders/${id}/return`, {
        reason,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Return processed");
    },
  });
}
