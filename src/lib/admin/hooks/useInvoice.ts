import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import type { AdminInvoice, InvoiceConfig } from "@/types/admin";

export function useGetInvoiceByOrder(orderId: string | undefined) {
  return useQuery<AdminInvoice>({
    queryKey: ["admin", "invoices", "order", orderId ?? ""],
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>(`/admin/invoices/order/${orderId}`);
      return data.data;
    },
    enabled: !!orderId,
    retry: false,
  });
}

export function useGenerateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { orderId: string; invoiceConfigId?: string; notes?: string }) => {
      const { data } = await adminApiClient.post<any>("/admin/invoices/generate", dto);
      return data.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "invoices", "order", variables.orderId] });
      toast.success("Invoice generated successfully");
    },
  });
}

export function useSendInvoiceEmail(invoiceId: string) {
  return useMutation({
    mutationFn: async (dto: { to: string; subject?: string }) => {
      const { data } = await adminApiClient.post<any>(`/admin/invoices/${invoiceId}/send-email`, dto);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Invoice email sent");
    },
  });
}

export function useInvoiceConfigs() {
  return useQuery<InvoiceConfig[]>({
    queryKey: ["admin", "invoice-configs"],
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>("/invoice-config");
      return data.data;
    },
  });
}

export function useDefaultInvoiceConfig() {
  return useQuery<InvoiceConfig>({
    queryKey: ["admin", "invoice-configs", "default"],
    queryFn: async () => {
      const { data } = await adminApiClient.get<any>("/invoice-config/default");
      return data.data;
    },
  });
}

export function useCreateInvoiceConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      const { data } = await adminApiClient.post<any>("/invoice-config", dto);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invoice-configs"] });
      toast.success("Invoice configuration created");
    },
  });
}

export function useUpdateInvoiceConfig(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      const { data } = await adminApiClient.patch<any>(`/invoice-config/${id}`, dto);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invoice-configs"] });
      toast.success("Invoice configuration updated");
    },
  });
}

export function useDeleteInvoiceConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/invoice-config/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invoice-configs"] });
      toast.success("Invoice configuration deleted");
    },
  });
}

export function useSetDefaultConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await adminApiClient.patch<any>(`/invoice-config/${id}/set-default`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "invoice-configs"] });
      toast.success("Default configuration updated");
    },
  });
}
