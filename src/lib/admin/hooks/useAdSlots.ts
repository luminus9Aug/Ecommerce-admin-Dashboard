import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adSlotAdapter } from "@/lib/api/adapters/AdSlotAdapter";
import { adminQueryKeys } from "../query-keys";
import type { AdSlot, CreateAdSlotPayload } from "@/types/admin";

export interface AdSlotFilters {
  cursor?: string;
  limit?: number;
  position?: string;
  type?: string;
  isActive?: boolean;
}

export function useAdSlots(filters: AdSlotFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.adSlots(filters),
    queryFn: () => adSlotAdapter.getAdSlots(filters),
    staleTime: 30_000,
  });
}

export function useAdSlot(id: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.adSlot(id ?? ""),
    queryFn: () => adSlotAdapter.getAdSlotById(id!),
    enabled: !!id,
  });
}

export function useCreateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdSlotPayload) => adSlotAdapter.createAdSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "ad-slots"] });
      toast.success("Ad slot created. Changes will appear on site within a few seconds");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to create ad slot";
      toast.error(message);
    },
  });
}

export function useUpdateAdSlot(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateAdSlotPayload>) => adSlotAdapter.updateAdSlot(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "ad-slots"] });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.adSlot(id) });
      toast.success("Ad slot updated. Changes will appear on site within a few seconds");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update ad slot";
      toast.error(message);
    },
  });
}

export function useDeleteAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adSlotAdapter.deleteAdSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "ad-slots"] });
      toast.success("Ad slot deleted. Changes will appear on site within a few seconds");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete ad slot";
      toast.error(message);
    },
  });
}
