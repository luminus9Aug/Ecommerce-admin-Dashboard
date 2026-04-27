import { useQuery } from "@tanstack/react-query";
import adminApiClient from "../api-client";
import { adminQueryKeys } from "../query-keys";
import type { NotificationBadges } from "@/types/admin";

// Polls all four pending counts every 2 minutes (per spec).
// Falls back to 0 for any endpoint that errors so the UI never breaks.
async function safeCount<T>(
  fn: () => Promise<T>,
  extract: (v: T) => number,
): Promise<number> {
  try {
    const v = await fn();
    return extract(v);
  } catch {
    return 0;
  }
}

export function useNotificationBadges() {
  return useQuery<NotificationBadges>({
    queryKey: adminQueryKeys.notificationBadges,
    queryFn: async () => {
      const [pendingB2BApprovals, pendingQuotes, openTickets, pendingCreditTerms] =
        await Promise.all([
          safeCount(
            () =>
              adminApiClient
                .get("/users", {
                  params: { role: "b2b", isApproved: false, limit: 1 },
                })
                .then((r) => r.data),
            (v: { total?: number }) => v?.total ?? 0,
          ),
          safeCount(
            () =>
              adminApiClient
                .get("/b2b/quotes/all", { params: { status: "pending" } })
                .then((r) => r.data),
            (v: unknown) => (Array.isArray(v) ? v.length : 0),
          ),
          safeCount(
            () =>
              adminApiClient
                .get("/support/tickets/all", {
                  params: { status: "open", limit: 1 },
                })
                .then((r) => r.data),
            (v: { total?: number }) => v?.total ?? 0,
          ),
          safeCount(
            () =>
              adminApiClient.get("/b2b/credit-terms").then((r) => r.data),
            (v: unknown) =>
              Array.isArray(v)
                ? v.filter((c: { status?: string }) => c?.status === "pending").length
                : 0,
          ),
        ]);

      return {
        pendingB2BApprovals,
        pendingQuotes,
        openTickets,
        pendingCreditTerms,
      };
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}
