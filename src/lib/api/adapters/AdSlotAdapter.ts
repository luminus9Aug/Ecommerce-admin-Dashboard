import { BaseAdapter } from "./BaseAdapter";
import { API_ENDPOINTS } from "../endpoints";
import type { CursorPaginatedResponse, AdSlot, CreateAdSlotPayload } from "@/types/admin";

class AdSlotAdapter extends BaseAdapter {
  public async getAdSlots(params?: { cursor?: string; limit?: number; position?: string; type?: string; isActive?: boolean }): Promise<CursorPaginatedResponse<AdSlot>> {
    return this.get<CursorPaginatedResponse<AdSlot>>(API_ENDPOINTS.AD_SLOTS.ADMIN_ALL, { params });
  }

  public async getAdSlotById(id: string): Promise<AdSlot> {
    return this.get<AdSlot>(API_ENDPOINTS.AD_SLOTS.BY_ID(id));
  }

  public async createAdSlot(payload: CreateAdSlotPayload): Promise<AdSlot> {
    return this.post<AdSlot>(API_ENDPOINTS.AD_SLOTS.BASE, payload);
  }

  public async updateAdSlot(id: string, payload: Partial<CreateAdSlotPayload>): Promise<AdSlot> {
    return this.patch<AdSlot>(API_ENDPOINTS.AD_SLOTS.BY_ID(id), payload);
  }

  public async deleteAdSlot(id: string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.AD_SLOTS.BY_ID(id));
  }
}

export const adSlotAdapter = new AdSlotAdapter();
