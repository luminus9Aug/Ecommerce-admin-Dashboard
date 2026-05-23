import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type { Coupon, NewsletterSubscriber } from "@/types/admin";

export function useCoupons() {
  return useQuery<Coupon[]>({
    queryKey: adminQueryKeys.coupons,
    queryFn: async () => {
      const response = await adminApiClient.get<any>("/offers/coupons");
      const payload = response.data; // payload is { success: true, data: [...] }
      return Array.isArray(payload?.data) ? payload.data : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Coupon>) => {
      const { data } = await adminApiClient.post<Coupon>(
        "/offers/coupons",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.coupons });
      toast.success("Coupon created");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to create coupon";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/offers/coupons/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.coupons });
      toast.success("Coupon deleted");
    },
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Coupon> }) => {
      const { data } = await adminApiClient.patch<Coupon>(
        `/offers/coupons/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.coupons });
      toast.success("Coupon updated");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update coupon";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });
}

export function useNewsletterSubscribers() {
  return useQuery<NewsletterSubscriber[]>({
    queryKey: adminQueryKeys.newsletterSubscribers,
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>(
        "/newsletter/subscribers",
      );
      return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    },
    staleTime: 60_000,
  });
}
