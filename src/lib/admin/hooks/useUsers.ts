import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type { PaginatedResponse, User, UserRole } from "@/types/admin";

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "";
  isApproved?: boolean | "";
}

export function useUsers(filters: UserFilters) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: adminQueryKeys.users(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get<PaginatedResponse<User>>(
        "/users",
        { params: filters },
      );
      return data;
    },
    staleTime: 30_000,
  });
}

export function useUser(id: string | undefined) {
  return useQuery<User>({
    queryKey: adminQueryKeys.user(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<User>(`/users/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await adminApiClient.post<User>("/users", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User created");
    },
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const { data } = await adminApiClient.patch<User>(
        `/users/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted");
    },
  });
}

function userActionMutation(action: string, label: string) {
  return function useUserAction() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const { data } = await adminApiClient.patch(`/users/${id}/${action}`);
        return data;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "users"] });
        toast.success(label);
      },
    });
  };
}

export const useApproveUser = userActionMutation("approve", "User approved");
export const useRejectUser = userActionMutation("reject", "User rejected");
export const useSuspendUser = userActionMutation("suspend", "User suspended");
export const useActivateUser = userActionMutation("activate", "User activated");
