import { BaseAdapter } from "./BaseAdapter";
import type { Order, OrderFilters, PaginatedResponse, OrderStatus, OrderTracking } from "@/types/admin";

class OrderAdapter extends BaseAdapter {
  public async getOrders(filters: OrderFilters): Promise<PaginatedResponse<Order>> {
    return this.get<PaginatedResponse<Order>>("/orders/all", { params: filters });
  }

  public async getOrderById(id: string): Promise<Order> {
    return this.get<Order>(`/orders/${id}`);
  }

  public async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.patch<Order>(`/orders/${id}/status`, { status });
  }

  public async cancelOrder(id: string, reason: string): Promise<Order> {
    return this.post<Order>(`/orders/${id}/cancel`, { reason });
  }

  public async returnOrder(id: string, reason: string): Promise<Order> {
    return this.post<Order>(`/orders/${id}/return`, { reason });
  }

  public async updateOrderAdmin(id: string, dto: any): Promise<Order> {
    return this.patch<Order>(`/orders/${id}/admin`, dto);
  }

  public async addTracking(id: string, dto: { status: string; location?: string; notes?: string }): Promise<OrderTracking> {
    return this.post<OrderTracking>(`/orders/${id}/tracking`, dto);
  }

  public async getTracking(id: string): Promise<OrderTracking[]> {
    return this.get<OrderTracking[]>(`/orders/${id}/tracking`);
  }
}

export const orderAdapter = new OrderAdapter();
