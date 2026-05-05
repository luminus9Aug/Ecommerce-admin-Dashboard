import { BaseAdapter } from "./BaseAdapter";
import { API_ENDPOINTS } from "../endpoints";
import type { Category } from "@/types/admin";

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

class CategoryAdapter extends BaseAdapter {
  public async getCategories(): Promise<Category[]> {
    return this.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE);
  }

  public async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return this.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, payload);
  }

  public async updateCategory(id: string, payload: Partial<CreateCategoryPayload>): Promise<Category> {
    return this.patch<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id), payload);
  }

  public async deleteCategory(id: string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  }

  public async uploadFile(file: File, folder = "products"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await this.client.post<{ url: string }>(
      "/uploads",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    // The upload endpoint returns { success: true, data: { url } } wrapped
    const raw = response.data as any;
    return raw?.data?.url ?? raw?.url;
  }
}

export const categoryAdapter = new CategoryAdapter();
