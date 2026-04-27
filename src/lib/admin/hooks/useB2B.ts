import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type {
  Company,
  CreditTerm,
  Invoice,
  Quote,
  QuoteStatus,
} from "@/types/admin";

// ── Companies ───────────────────────────────────────────────
export function useCompanies(filters: { search?: string; verified?: boolean | "" } = {}) {
  return useQuery<Company[]>({
    queryKey: adminQueryKeys.companies(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get<Company[]>("/companies", {
        params: filters,
      });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}

export function useCompany(id: string | undefined) {
  return useQuery<Company>({
    queryKey: adminQueryKeys.company(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<Company>(`/companies/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useVerifyCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await adminApiClient.patch(`/companies/${id}/verify`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "b2b", "companies"] });
      toast.success("Company verified");
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "b2b", "companies"] });
      toast.success("Company deleted");
    },
  });
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Company>) => {
      const { data } = await adminApiClient.patch(`/companies/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "b2b", "companies"] });
      toast.success("Company updated");
    },
  });
}

// ── Quotes ──────────────────────────────────────────────────
export function useAllQuotes(filters: { status?: QuoteStatus | "" } = {}) {
  return useQuery<Quote[]>({
    queryKey: adminQueryKeys.quotes(filters),
    queryFn: async () => {
      const { data } = await adminApiClient.get<Quote[]>("/b2b/quotes/all", {
        params: filters,
      });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}

export function useQuote(id: string | undefined) {
  return useQuery<Quote>({
    queryKey: adminQueryKeys.quote(id ?? ""),
    queryFn: async () => {
      const { data } = await adminApiClient.get<Quote>(`/b2b/quotes/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useApproveQuote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      quotedPrice: number;
      validUntil: string;
      notes?: string;
    }) => {
      const { data } = await adminApiClient.patch(
        `/b2b/quotes/${id}/approve`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "b2b", "quotes"] });
      toast.success("Quote approved");
    },
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApiClient.delete(`/b2b/quotes/${id}/reject`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "b2b", "quotes"] });
      toast.success("Quote rejected");
    },
  });
}

// ── Credit Terms ────────────────────────────────────────────
export function useCreditTerms() {
  return useQuery<CreditTerm[]>({
    queryKey: adminQueryKeys.creditTerms,
    queryFn: async () => {
      const { data } = await adminApiClient.get<CreditTerm[]>(
        "/b2b/credit-terms",
      );
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}

export function useUpdateCreditTerms(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      approvedLimit: number;
      netDays: number;
      notes?: string;
    }) => {
      const { data } = await adminApiClient.patch(
        `/b2b/credit-terms/${companyId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQueryKeys.creditTerms });
      toast.success("Credit terms updated");
    },
  });
}

// ── Invoices ────────────────────────────────────────────────
export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: adminQueryKeys.invoices,
    queryFn: async () => {
      const { data } = await adminApiClient.get<Invoice[]>("/b2b/invoices");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
  });
}
