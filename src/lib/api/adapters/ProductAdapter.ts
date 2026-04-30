import { BaseAdapter } from "./BaseAdapter";
import { API_ENDPOINTS } from "../endpoints";
import type { PaginatedResponse, Product } from "@/types/admin";
import type { ProductFilters } from "../../admin/hooks/useProducts";

class ProductAdapter extends BaseAdapter {
  public async getProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
    return this.get<PaginatedResponse<Product>>(API_ENDPOINTS.PRODUCTS.BASE, { params: filters });
  }

  public async getProductById(id: string): Promise<Product> {
    return this.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  }

  public async createProduct(payload: Partial<Product>): Promise<Product> {
    return this.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, payload);
  }

  public async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    return this.patch<Product>(API_ENDPOINTS.PRODUCTS.UPDATE(id), payload);
  }

  public async deleteProduct(id: string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.PRODUCTS.UPDATE(id));
  }

  public async bulkUpdate(payload: { ids: string[]; data: Partial<Product> }): Promise<any> {
    return this.patch<any>(API_ENDPOINTS.PRODUCTS.BULK_UPDATE, payload);
  }

  public async bulkDelete(ids: string[]): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.PRODUCTS.BULK_DELETE, { data: { ids } });
  }
}

export const productAdapter = new ProductAdapter();
