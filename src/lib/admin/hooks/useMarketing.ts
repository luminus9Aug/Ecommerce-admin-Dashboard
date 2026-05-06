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
      const { data } = await adminApiClient.get<Coupon[]>("/offers/coupons");
      return Array.isArray(data) ? data : [];
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

export function useNewsletterSubscribers() {
  return useQuery<NewsletterSubscriber[]>({
    queryKey: adminQueryKeys.newsletterSubscribers,
    queryFn: async () => {
      const { data } = await adminApiClient.get<NewsletterSubscriber[]>(
        "/newsletter/subscribers",
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
  });
}
