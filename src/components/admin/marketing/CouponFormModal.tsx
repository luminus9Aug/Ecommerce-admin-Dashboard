import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateCoupon, useUpdateCoupon } from "@/lib/admin/hooks/useMarketing";
import type { Coupon } from "@/types/admin";

// ─── Date Formatter Helper ────────────────────────────────────
function formatDateTime(dateStr?: string | Date) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ─── Zod Schema ──────────────────────────────────────────────
const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code must be under 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Alphanumeric, underscores, and hyphens only"),
  description: z.string().optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0.01, "Discount value must be greater than 0"),
  minOrderAmount: z.coerce.number().min(0, "Minimum order amount cannot be negative"),
  maxDiscountAmount: z.coerce.number().min(0, "Maximum discount amount cannot be negative").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  usageLimit: z.coerce.number().int().min(1, "Usage limit must be at least 1"),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.discountType === "PERCENTAGE" && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["value"],
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
}, {
  message: "End date must be after the start date",
  path: ["endDate"],
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<Coupon> & { description?: string; maxDiscountAmount?: number; usageCount?: number };
}

export function CouponFormModal({ open, onClose, initialData }: CouponFormModalProps) {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "FIXED",
      value: 0,
      minOrderAmount: 0,
      maxDiscountAmount: undefined,
      startDate: "",
      endDate: "",
      usageLimit: 1000,
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        code: initialData?.code ?? "",
        description: initialData?.description ?? "",
        discountType: initialData?.discountType ?? "FIXED",
        value: initialData?.value ?? 0,
        minOrderAmount: initialData?.minOrderAmount ?? 0,
        maxDiscountAmount: initialData?.maxDiscountAmount ?? undefined,
        startDate: formatDateTime(initialData?.startDate),
        endDate: formatDateTime(initialData?.endDate),
        usageLimit: initialData?.usageLimit ?? 1000,
        isActive: initialData?.isActive ?? true,
      });
    } else {
      form.reset({
        code: "",
        description: "",
        discountType: "FIXED",
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: undefined,
        startDate: "",
        endDate: "",
        usageLimit: 1000,
        isActive: true,
      });
    }
  }, [initialData, open, form]);

  const onSubmit = async (values: CouponFormValues) => {
    const payload = {
      ...values,
      code: values.code.toUpperCase(),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      maxDiscountAmount: values.maxDiscountAmount || undefined,
    };

    try {
      if (initialData?.id) {
        await updateCoupon.mutateAsync({
          id: initialData.id,
          payload,
        });
      } else {
        await createCoupon.mutateAsync(payload);
      }
      form.reset();
      onClose();
    } catch (error) {
      // Error toast is handled by the mutation hook's onError callback.
      // We catch it here to prevent unhandled promise rejection and to keep the modal open.
    }
  };

  const isPending = createCoupon.isPending || updateCoupon.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. GET50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Discount Type */}
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Discount Value */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Minimum Order Amount */}
              <FormField
                control={form.control}
                name="minOrderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Order Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Max Discount Amount */}
              <FormField
                control={form.control}
                name="maxDiscountAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Discount Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Optional (e.g. 100)"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Caps the discount in percentage mode.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usage Limit */}
              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. 10% off storewide on orders above $500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Switch */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Control whether users can apply this coupon code instantly.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Form Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : initialData?.id ? "Save Changes" : "Create Coupon"}
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
