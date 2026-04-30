import { BaseAdapter } from "./BaseAdapter";
import { API_ENDPOINTS } from "../endpoints";
import type { PaginatedResponse, User } from "@/types/admin";

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isApproved?: boolean;
}

class UserAdapter extends BaseAdapter {
  public async getUsers(filters: UserFilters): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, { params: filters });
  }

  public async getUserById(id: string): Promise<User> {
    return this.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  public async createUser(payload: Partial<User>): Promise<User> {
    return this.post<User>(API_ENDPOINTS.USERS.BASE, payload);
  }

  public async updateUser(id: string, payload: Partial<User>): Promise<User> {
    return this.patch<User>(API_ENDPOINTS.USERS.BY_ID(id), payload);
  }

  public async deleteUser(id: string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.USERS.BY_ID(id));
  }
  
  public async getProfile(): Promise<{ role?: string }> {
    return this.get<{ role?: string }>(API_ENDPOINTS.USERS.PROFILE);
  }

  public async performAction(id: string, action: string): Promise<any> {
    return this.patch<any>(`/users/${id}/${action}`);
  }
}

export const userAdapter = new UserAdapter();
