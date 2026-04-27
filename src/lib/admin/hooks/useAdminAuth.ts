import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type { AdminUser } from "@/types/admin";

interface LoginPayload {
  email: string;
  password: string;
}
interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export function useAdminProfile(enabled = true) {
  return useQuery<AdminUser>({
    queryKey: ["admin", "auth", "profile"],
    queryFn: async () => {
      const { data } = await adminApiClient.get<AdminUser>("/users/profile");
      return data;
    },
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await adminApiClient.post("/auth/login", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await adminApiClient.post("/auth/logout");
    },
    onSuccess: () => {
      qc.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await adminApiClient.post(
        "/auth/change-password",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
  });
}

export const _adminAuthKeys = adminQueryKeys; // re-export for convenience
