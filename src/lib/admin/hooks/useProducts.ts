import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type { PaginatedResponse, Product } from "@/types/admin";

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
}

export function useProducts(filters: ProductFilters) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: adminQueryKeys.products(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get<PaginatedResponse<Product>>(
        "/products",
        { params: filters },
      );
      return data;
    },
    staleTime: 30_000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: adminQueryKeys.product(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<Product>(`/products/id/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const { data } = await adminApiClient.post<Product>(
        "/products",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created successfully");
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Product>) => {
      const { data } = await adminApiClient.patch<Product>(
        `/products/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated successfully");
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
    },
  });
}

export function useBulkUpdateProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      ids: string[];
      data: Partial<Product>;
    }) => {
      const { data } = await adminApiClient.patch(
        "/admin/stats/products/bulk-update",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Products updated");
    },
  });
}

export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await adminApiClient.delete("/admin/stats/products/bulk-delete", {
        data: { ids },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Products deleted");
    },
  });
}
