import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { adminQueryKeys } from "../query-keys";
import type { PaginatedResponse, Product } from "@/types/admin";
import { productAdapter } from "../../api/adapters/ProductAdapter";

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
    queryFn: () => productAdapter.getProducts(filters),
    staleTime: 30_000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<Product>({
    queryKey: adminQueryKeys.product(id ?? ""),
    queryFn: () => productAdapter.getProductById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Product>) => productAdapter.createProduct(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created successfully");
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Product>) => productAdapter.updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated successfully");
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAdapter.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
    },
  });
}

export function useBulkUpdateProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: string[]; data: Partial<Product> }) =>
      productAdapter.bulkUpdate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Products updated");
    },
  });
}

export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => productAdapter.bulkDelete(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Products deleted");
    },
  });
}
