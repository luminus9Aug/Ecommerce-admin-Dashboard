import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { adminQueryKeys } from "../query-keys";
import { orderAdapter } from "../../api/adapters/OrderAdapter";
import type {
  Order,
  OrderStatus,
  PaginatedResponse,
  PaymentMethod,
  OrderFilters,
} from "@/types/admin";


export function useOrders(filters: OrderFilters) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: adminQueryKeys.orders(filters),
    queryFn: () => orderAdapter.getOrders(filters),
    staleTime: 30_000,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<Order>({
    queryKey: adminQueryKeys.order(id ?? ""),
    queryFn: () => orderAdapter.getOrderById(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => orderAdapter.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated");
    },
  });
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => orderAdapter.cancelOrder(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order cancelled");
    },
  });
}

export function useReturnOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => orderAdapter.returnOrder(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Return processed");
    },
  });
}
