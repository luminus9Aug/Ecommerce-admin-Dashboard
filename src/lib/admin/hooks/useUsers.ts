import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { adminQueryKeys } from "../query-keys";
import type { PaginatedResponse, User, UserRole } from "@/types/admin";
import { userAdapter, type UserFilters } from "../../api/adapters/UserAdapter";

export function useUsers(filters: UserFilters) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: adminQueryKeys.users(filters),
    queryFn: () => userAdapter.getUsers(filters),
    staleTime: 30_000,
  });
}

export function useUser(id: string | undefined) {
  return useQuery<User>({
    queryKey: adminQueryKeys.user(id ?? ""),
    queryFn: () => userAdapter.getUserById(id!),
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
    mutationFn: (payload: CreateUserPayload) => userAdapter.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User created");
    },
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => userAdapter.updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userAdapter.deleteUser(id),
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
      mutationFn: (id: string) => userAdapter.performAction(id, action),
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

export function useApproveB2BUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userAdapter.approveB2B(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats", "overview"] });
      toast.success("B2B user approved");
    },
  });
}

export function useRejectB2BUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => userAdapter.rejectB2B(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats", "overview"] });
      toast.success("B2B user rejected");
    },
  });
}

export function useRequestInfoB2BUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => userAdapter.requestInfoB2B(id, message),
    onSuccess: () => {
      toast.success("Information requested");
    },
  });
}
