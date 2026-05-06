import { BaseAdapter } from "./BaseAdapter";
import type { User } from "@/types/admin";

class B2BApprovalsAdapter extends BaseAdapter {
  public async getPendingRequests(): Promise<{ items: User[]; total: number }> {
    return this.get<{ items: User[]; total: number }>("/b2b-approvals/pending");
  }

  public async approve(id: string): Promise<any> {
    return this.post<any>(`/b2b-approvals/${id}/approve`);
  }

  public async reject(id: string, reason?: string): Promise<any> {
    return this.post<any>(`/b2b-approvals/${id}/reject`, { reason });
  }

  public async requestInfo(id: string, message: string): Promise<any> {
    return this.post<any>(`/b2b-approvals/${id}/request-info`, { message });
  }
}

export const b2bApprovalsAdapter = new B2BApprovalsAdapter();
