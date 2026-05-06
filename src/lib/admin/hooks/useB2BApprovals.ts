import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { b2bApprovalsAdapter } from "@/lib/api/adapters/B2BApprovalsAdapter";
import { toast } from "sonner";

export const b2bApprovalKeys = {
  all: ["admin", "b2b-approvals"] as const,
  pending: () => [...b2bApprovalKeys.all, "pending"] as const,
};

export function usePendingB2BRequests() {
  return useQuery({
    queryKey: b2bApprovalKeys.pending(),
    queryFn: () => b2bApprovalsAdapter.getPendingRequests(),
    staleTime: 30_000,
  });
}

export function useApproveB2B() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => b2bApprovalsAdapter.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bApprovalKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications", "badges"] });
      toast.success("B2B Account Approved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve account");
    },
  });
}

export function useRejectB2B() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      b2bApprovalsAdapter.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bApprovalKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications", "badges"] });
      toast.success("B2B Account Rejected");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject account");
    },
  });
}

export function useRequestInfoB2B() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      b2bApprovalsAdapter.requestInfo(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: b2bApprovalKeys.all });
      toast.success("Information request sent to applicant");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });
}
