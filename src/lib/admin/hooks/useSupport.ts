import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type {
  SupportTicket,
  TicketPriority,
  TicketStatus,
} from "@/types/admin";

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  search?: string;
}

interface TicketListResponse {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useTickets(filters: TicketFilters) {
  return useQuery<TicketListResponse>({
    queryKey: adminQueryKeys.tickets(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get<TicketListResponse>(
        "/support/tickets/all",
        { params: filters },
      );
      return data;
    },
    staleTime: 30_000,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery<SupportTicket>({
    queryKey: adminQueryKeys.ticket(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<SupportTicket>(
        `/support/tickets/${id}`,
      );
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useReplyToTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await adminApiClient.post(
        `/support/tickets/${id}/messages`,
        { message },
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.ticket(id) });
      toast.success("Reply sent");
    },
  });
}

export function useUpdateTicketStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: TicketStatus) => {
      const { data } = await adminApiClient.patch(
        `/support/tickets/${id}/status`,
        { status },
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support"] });
      toast.success("Ticket status updated");
    },
  });
}
