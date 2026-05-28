import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreditCard,
  Banknote,
  QrCode,
  Globe,
  Settings,
  ShieldCheck,
  Zap,
  RefreshCw
} from "lucide-react";
import adminApiClient from "@/lib/admin/api-client";
import { adminQueryKeys } from "@/lib/admin/query-keys";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

interface PaymentMethodConfig {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ComponentType<any>;
  color: string;
  badge?: string;
}

const PAYMENT_METHODS_META: PaymentMethodConfig[] = [
  {
    id: "cod",
    name: "Cash on Delivery (COD)",
    description: "Allow pay on arrival",
    longDescription: "Enable customers to pay in cash when the delivery agent delivers the product. Simple setup with zero transaction fees, ideal for domestic shipping.",
    icon: Banknote,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
  },
  {
    id: "razorpay",
    name: "Razorpay Checkout",
    description: "Cards, UPI, NetBanking",
    longDescription: "Accept secure domestic payments in India via Debit/Credit Cards, UPI, NetBanking, and Wallets using the Razorpay payment gateway pop-up integration.",
    icon: CreditCard,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
    badge: "Domestic India",
  },
  {
    id: "stripe",
    name: "Stripe Gateway",
    description: "International Cards",
    longDescription: "Accept global credit/debit card payments securely. Stripe handles multi-currency transactions, automatic conversions, and high-fidelity fraud prevention.",
    icon: Globe,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50",
    badge: "Global Cards",
  },
  {
    id: "upi",
    name: "UPI QR (Scan & Pay)",
    description: "Manual verification",
    longDescription: "Generate a dynamic QR code containing checkout details for users to scan with any UPI app. Payment is verified manually via UTR Transaction ID confirmation.",
    icon: QrCode,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
    badge: "Popular in India",
  },
];

function PaymentsPage() {
  const queryClient = useQueryClient();

  // Fetch enabled payment methods
  const { data: enabledMethods = [], isLoading, isError, error } = useQuery<string[]>({
    queryKey: adminQueryKeys.paymentMethods,
    queryFn: async () => {
      const response = await adminApiClient.get<any>("/payments/methods");
      const payload = response.data;
      // Handle potential wrapped or unwrapped backend array responses safely
      return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
    },
    staleTime: 30_000,
  });

  // Mutation to update enabled payment methods
  const updateMethods = useMutation({
    mutationFn: async (methods: string[]) => {
      const response = await adminApiClient.patch<any>("/payments/methods", { methods });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.paymentMethods });
      toast.success("Payment methods configuration updated successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update payment methods";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleToggle = (methodId: string, checked: boolean) => {
    let updated: string[];
    if (checked) {
      // Prevent duplicates
      updated = [...new Set([...enabledMethods, methodId])];
    } else {
      updated = enabledMethods.filter((m) => m !== methodId);
    }
    updateMethods.mutate(updated);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-500" />
        <p className="text-sm text-slate-500 font-medium animate-pulse">Loading payment methods...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Failed to load payment methods</h3>
        <p className="text-sm text-slate-500">{(error as any)?.message || "Internal server connection error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Settings"
        description="Toggle and configure active checkout payment options for your e-commerce storefront."
      />

      {/* Overview stats alert */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 p-4 shadow-sm flex items-start sm:items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
          <Zap className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-0.5">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Active Methods Summary</h4>
          <p className="text-xs text-slate-500">
            Currently, customers can check out using <strong>{enabledMethods.length} option{enabledMethods.length !== 1 && "s"}</strong>:{" "}
            {enabledMethods.length > 0 ? (
              <span className="font-semibold text-primary">{enabledMethods.map(m => PAYMENT_METHODS_META.find(x => x.id === m)?.name || m).join(", ")}</span>
            ) : (
              <span className="font-semibold text-destructive">None (Storefront checkout disabled)</span>
            )}
          </p>
        </div>
      </div>

      {/* Grid of Methods */}
      <div className="grid gap-6 md:grid-cols-2">
        {PAYMENT_METHODS_META.map((method) => {
          const Icon = method.icon;
          const isEnabled = enabledMethods.includes(method.id);
          const isPending = updateMethods.isPending;

          return (
            <Card
              key={method.id}
              className={`transition-all duration-300 hover:shadow-md border border-border bg-card hover:border-slate-300 dark:hover:border-slate-700`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 border ${method.color} shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">{method.name}</CardTitle>
                      {method.badge && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-0.5">{method.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPending && updateMethods.variables?.includes(method.id) !== isEnabled && (
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                  )}
                  <Switch
                    checked={isEnabled}
                    disabled={isPending}
                    onCheckedChange={(checked) => handleToggle(method.id, checked)}
                    aria-label={`Toggle ${method.name}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {method.longDescription}
                </p>
                {method.id === "upi" && isEnabled && (
                  <div className="mt-4 p-3 rounded-lg border border-amber-100 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50 flex gap-2.5 items-start">
                    <Settings className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">UPI Payments Configuration Details</span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-normal">
                        Admins must set merchant environment variables (e.g. <code>NEXT_PUBLIC_UPI_ID</code>) in the checkout page to update the scanner details. Checkout orders placed via UPI will save under <strong>Initiated</strong> status, displaying UTR Transaction IDs on their details page for manual verification.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
