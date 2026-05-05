import adminApiClient from "@/lib/admin/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdSlot, CreateAdSlotPayload, CursorPaginatedResponse } from "@/types/admin";

export const adSlotApi = {
  getAdSlots: async (params: { position?: string; type?: string; isActive?: boolean; cursor?: string; limit?: number }) => {
    const response = await adminApiClient.get<CursorPaginatedResponse<AdSlot>>(API_ENDPOINTS.AD_SLOTS.ADMIN_ALL, { params });
    return response.data;
  },

  getAdSlot: async (id: string) => {
    const response = await adminApiClient.get<AdSlot>(API_ENDPOINTS.AD_SLOTS.BY_ID(id));
    return response.data;
  },

  createAdSlot: async (data: CreateAdSlotPayload) => {
    const response = await adminApiClient.post<AdSlot>(API_ENDPOINTS.AD_SLOTS.BASE, data);
    return response.data;
  },

  updateAdSlot: async (id: string, data: Partial<CreateAdSlotPayload>) => {
    const response = await adminApiClient.patch<AdSlot>(API_ENDPOINTS.AD_SLOTS.BY_ID(id), data);
    return response.data;
  },

  deleteAdSlot: async (id: string) => {
    await adminApiClient.delete(API_ENDPOINTS.AD_SLOTS.BY_ID(id));
  },
};
