import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type {
  Banner,
  BlogCategory,
  BlogPost,
  FAQ,
  Theme,
} from "@/types/admin";

// ── Banners ─────────────────────────────────────────────
export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: adminQueryKeys.banners,
    queryFn: async () => {
      const { data } = await adminApiClient.get<Banner[]>("/banners/all");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Banner>) => {
      const { data } = await adminApiClient.post<Banner>("/banners", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.banners });
      toast.success("Banner created");
    },
  });
}

export function useUpdateBanner(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Banner>) => {
      const { data } = await adminApiClient.patch<Banner>(
        `/banners/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.banners });
      toast.success("Banner updated");
    },
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/banners/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.banners });
      toast.success("Banner deleted");
    },
  });
}

// ── Blog ────────────────────────────────────────────────
export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: "draft" | "published" | "";
}

export function useBlogPosts(filters: BlogFilters) {
  return useQuery({
    queryKey: adminQueryKeys.blogPosts(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get("/blog/posts", {
        params: filters,
      });
      return data as { data: BlogPost[]; total: number; page: number; limit: number; totalPages: number };
    },
    staleTime: 30_000,
  });
}

export function useBlogPost(id: string | undefined) {
  return useQuery<BlogPost>({
    queryKey: adminQueryKeys.blogPost(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<BlogPost>(
        `/blog/posts/${id}`,
      );
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BlogPost>) => {
      const { data } = await adminApiClient.post<BlogPost>(
        "/blog/posts",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content", "blog-posts"] });
      toast.success("Blog post created");
    },
  });
}

export function useUpdateBlogPost(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BlogPost>) => {
      const { data } = await adminApiClient.patch<BlogPost>(
        `/blog/posts/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content", "blog-posts"] });
      toast.success("Blog post updated");
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/blog/posts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content", "blog-posts"] });
      toast.success("Blog post deleted");
    },
  });
}

export function useBlogCategories() {
  return useQuery<BlogCategory[]>({
    queryKey: adminQueryKeys.blogCategories,
    queryFn: async () => {
      const { data } = await adminApiClient.get<BlogCategory[]>(
        "/blog/categories",
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
  });
}

export function useCreateBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await adminApiClient.post<BlogCategory>(
        "/blog/categories",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.blogCategories });
      toast.success("Category created");
    },
  });
}

export function useUpdateBlogCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BlogCategory>) => {
      const { data } = await adminApiClient.patch<BlogCategory>(
        `/blog/categories/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.blogCategories });
      toast.success("Category updated");
    },
  });
}

export function useDeleteBlogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/blog/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.blogCategories });
      toast.success("Category deleted");
    },
  });
}

// ── FAQ ─────────────────────────────────────────────────
export function useFAQs() {
  return useQuery<FAQ[]>({
    queryKey: adminQueryKeys.faqs,
    queryFn: async () => {
      const { data } = await adminApiClient.get<FAQ[]>("/faq");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FAQ>) => {
      const { data } = await adminApiClient.post<FAQ>("/faq", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.faqs });
      toast.success("FAQ created");
    },
  });
}

export function useUpdateFAQ(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FAQ>) => {
      const { data } = await adminApiClient.patch<FAQ>(`/faq/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.faqs });
      toast.success("FAQ updated");
    },
  });
}

export function useDeleteFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/faq/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.faqs });
      toast.success("FAQ deleted");
    },
  });
}

// ── Themes ──────────────────────────────────────────────
export function useThemes() {
  return useQuery<Theme[]>({
    queryKey: adminQueryKeys.themes,
    queryFn: async () => {
      const { data } = await adminApiClient.get<Theme[]>("/themes");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Theme>) => {
      const { data } = await adminApiClient.post<Theme>("/themes", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.themes });
      toast.success("Theme created");
    },
  });
}

export function useUpdateTheme(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Theme>) => {
      const { data } = await adminApiClient.patch<Theme>(
        `/themes/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.themes });
      toast.success("Theme updated");
    },
  });
}

export function useSetActiveTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await adminApiClient.put(`/themes/${id}/active`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.themes });
      toast.success("Theme activated");
    },
  });
}

export function useDeleteTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/themes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.themes });
      toast.success("Theme deleted");
    },
  });
}
