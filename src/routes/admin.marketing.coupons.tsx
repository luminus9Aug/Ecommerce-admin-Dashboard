import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Ticket,
  CheckCircle2,
  BarChart3,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { DataTable } from "@/components/admin/shared/DataTable";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/admin/api-client";
import { useCoupons, useDeleteCoupon, useUpdateCoupon } from "@/lib/admin/hooks/useMarketing";
import { CouponFormModal } from "@/components/admin/marketing/CouponFormModal";
import type { Coupon } from "@/types/admin";

export const Route = createFileRoute("/admin/marketing/coupons")({
  component: CouponsPage,
});

// ─── Inline Switch Status Toggle Cell ─────────────────────────
function StatusToggleCell({ coupon }: { coupon: Coupon }) {
  const updateCoupon = useUpdateCoupon();

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={coupon.isActive}
        disabled={updateCoupon.isPending}
        onCheckedChange={(checked) => {
          updateCoupon.mutate({
            id: coupon.id,
            payload: { isActive: checked },
          });
        }}
      />
    </div>
  );
}

// ─── Columns Definition ───────────────────────────────────────
const useColumns = (
  onEdit: (coupon: Coupon) => void,
  onDelete: (id: string) => void
): ColumnDef<Coupon>[] => [
    {
      accessorKey: "code",
      header: "Coupon Code",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex flex-col gap-0.5 py-1">
            <div className="font-mono font-black text-slate-900 tracking-wider text-sm select-all">
              {c.code}
            </div>
            {(c as any).description && (
              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {(c as any).description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "discount",
      header: "Discount Value",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">
              {c.discountType === "PERCENTAGE" ? `${c.value}%` : formatCurrency(c.value)}
            </span>
            {c.discountType === "PERCENTAGE" && (c as any).maxDiscountAmount ? (
              <span className="text-[10px] text-muted-foreground font-normal">
                (Max {formatCurrency((c as any).maxDiscountAmount)})
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "minOrderAmount",
      header: "Min Order",
      cell: ({ row }) => {
        const val = Number(row.getValue("minOrderAmount") || 0);
        return val > 0 ? (
          <span className="font-medium text-slate-700">{formatCurrency(val)}</span>
        ) : (
          <span className="text-muted-foreground text-xs font-normal">No Minimum</span>
        );
      },
    },
    {
      accessorKey: "usage",
      header: "Redemptions",
      cell: ({ row }) => {
        const c = row.original;
        const used = (c as any).usageCount ?? c.usedCount ?? 0;
        const limit = c.usageLimit ?? 1000;
        const pct = Math.min(100, Math.round((used / limit) * 100));

        return (
          <div className="flex flex-col gap-1 w-24">
            <div className="text-xs font-medium text-slate-700">
              {used} <span className="text-muted-foreground text-[10px] font-normal">/ {limit} used</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${pct >= 90 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "validity",
      header: "Validity Period",
      cell: ({ row }) => {
        const c = row.original;
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        const now = new Date();
        const isExpired = now > end;
        const isNotStarted = now < start;

        const formatSafe = (d: Date) => {
          if (isNaN(d.getTime())) return "N/A";
          return format(d, "dd MMM yyyy");
        };

        return (
          <div className="flex flex-col gap-0.5 py-0.5">
            <div className="text-xs text-slate-700 font-medium">
              {formatSafe(start)} - {formatSafe(end)}
            </div>
            <div>
              {isExpired ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 uppercase tracking-wide">
                  Expired
                </span>
              ) : isNotStarted ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 uppercase tracking-wide">
                  Scheduled
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wide">
                  Active & Valid
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Toggle Status",
      cell: ({ row }) => {
        const coupon = row.original;
        return <StatusToggleCell coupon={coupon} />;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="h-4 w-4 text-slate-500 hover:text-slate-800" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

// ─── Coupons Page Component ───────────────────────────────────
function CouponsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(undefined);

  const { data: coupons = [], isLoading } = useCoupons();
  const deleteCoupon = useDeleteCoupon();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
      deleteCoupon.mutate(id);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCoupon(undefined);
    setModalOpen(true);
  };

  const columns = useColumns(handleEdit, handleDelete);

  // ─── Metrics Calculations ──────────────────────────────────
  const now = new Date();
  const activeCount = coupons.filter(
    (c) => c.isActive && now >= new Date(c.startDate) && now <= new Date(c.endDate)
  ).length;

  const totalRedemptions = coupons.reduce(
    (acc, c) => acc + (Number((c as any).usageCount ?? c.usedCount ?? 0)),
    0
  );

  return (
    <div className="space-y-6">

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Coupons & Offers"
          description="Manage discounts, promo codes, and campaign eligibility parameters."
        />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Campaigns</div>
            <div className="text-3xl font-bold mt-1 tracking-tight">{coupons.length}</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Ticket className="h-6 w-6" />
          </div>
        </div>

        {/* Active */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Active & Valid Now</div>
            <div className="text-3xl font-bold mt-1 tracking-tight text-emerald-600">{activeCount}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Total Redemptions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Total Coupon Uses</div>
            <div className="text-3xl font-bold mt-1 tracking-tight text-purple-600">{totalRedemptions}</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={coupons}
        loading={isLoading}
      />

      {/* CRUD Modal */}
      <CouponFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCoupon(undefined);
        }}
        initialData={selectedCoupon}
      />
    </div>
  );
}
