import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminQueryKeys } from "../query-keys";
import { orderAdapter } from "../../api/adapters/OrderAdapter";
import type { Order, OrderTracking } from "@/types/admin";

export function useUpdateOrderAdmin(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => orderAdapter.updateOrderAdmin(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.order(id) });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order updated successfully");
    },
  });
}

export function useAddTracking(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { status: string; location?: string; notes?: string }) => orderAdapter.addTracking(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders", id, "tracking"] });
      toast.success("Tracking update added");
    },
  });
}

export function useOrderTracking(id: string | undefined) {
  return useQuery<OrderTracking[]>({
    queryKey: ["admin", "orders", id ?? "", "tracking"],
    queryFn: () => orderAdapter.getTracking(id!),
    enabled: !!id,
  });
}
