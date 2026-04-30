import adminApiClient from "../../admin/api-client";
import { AxiosRequestConfig, AxiosResponse } from "axios";

export class BaseAdapter {
  protected client = adminApiClient;

  // Helper to extract and normalize the data
  private extractData<T>(response: AxiosResponse<any>): T {
    const responseData = response.data;
    
    // Unwrap standard { success: true, data: ... } wrapper
    let inner = responseData;
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      // Don't unwrap if the top level *is* the paginated response (has both data and total)
      if (!('total' in responseData)) {
        inner = responseData.data;
      }
    }

    // Normalize backend pagination { items, meta } -> frontend { data, total, page, limit, totalPages }
    if (inner && typeof inner === 'object' && 'items' in inner) {
      return {
        data: inner.items,
        total: inner.meta?.total ?? 0,
        page: inner.meta?.page ?? 1,
        limit: inner.meta?.limit ?? 10,
        totalPages: inner.meta?.lastPage ?? 1,
      } as unknown as T;
    }

    return inner as T;
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.client.get(url, config);
    return this.extractData<T>(response);
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.client.post(url, data, config);
    return this.extractData<T>(response);
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.client.put(url, data, config);
    return this.extractData<T>(response);
  }

  protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.client.patch(url, data, config);
    return this.extractData<T>(response);
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<any> = await this.client.delete(url, config);
    return this.extractData<T>(response);
  }
}
