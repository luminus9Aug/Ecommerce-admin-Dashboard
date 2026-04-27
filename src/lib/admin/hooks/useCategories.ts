import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type { Category } from "@/types/admin";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: adminQueryKeys.categories,
    queryFn: async () => {
      const { data } = await adminApiClient.get<Category[]>("/categories");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Category>) => {
      const { data } = await adminApiClient.post<Category>(
        "/categories",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.categories });
      toast.success("Category created");
    },
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Category>) => {
      const { data } = await adminApiClient.patch<Category>(
        `/categories/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.categories });
      toast.success("Category updated");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.categories });
      toast.success("Category deleted");
    },
  });
}
