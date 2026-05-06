import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryAdapter, type CreateCategoryPayload } from "@/lib/api/adapters/CategoryAdapter";
import type { Category } from "@/types/admin";

const QUERY_KEY = ["admin", "categories"] as const;

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: QUERY_KEY,
    queryFn: () => categoryAdapter.getCategories(),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoryAdapter.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Category created successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to create category");
    },
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateCategoryPayload>) =>
      categoryAdapter.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Category updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update category");
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryAdapter.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Category deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete category");
    },
  });
}
