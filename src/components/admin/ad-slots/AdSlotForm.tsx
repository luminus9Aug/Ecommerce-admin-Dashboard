import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/shared/ImageUploader";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import { AdSlotType, AdSlotVariant, type AdSlot, type CreateAdSlotPayload } from "@/types/admin";

const AD_POSITIONS = [
  { value: "hero-banner", label: "Hero Banner" },
  { value: "category-sidebar-top", label: "Category Sidebar Top" },
  { value: "category-sidebar-bottom", label: "Category Sidebar Bottom" },
  { value: "featured-sidebar-top", label: "Featured Sidebar Top" },
  { value: "featured-sidebar-bottom", label: "Featured Sidebar Bottom" },
  { value: "featured-banner", label: "Featured Banner" },
  { value: "deals-banner", label: "Deals Banner" },
  { value: "promo-strip", label: "Promo Strip" },
  { value: "top-promo-banner", label: "Top Promo Banner" },
  { value: "home-ads", label: "Home Ads" },
  { value: "arrivals-sidebar", label: "Arrivals Sidebar" },
];

const adSlotSchema = z.object({
  position: z.string().min(1, "Position is required"),
  type: z.nativeEnum(AdSlotType),
  variant: z.nativeEnum(AdSlotVariant),
  order: z.coerce.number().int().min(0, "Order must be at least 0"),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  mobileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  altText: z.string().max(120, "Max 120 characters").optional(),
  heading: z.string().max(80, "Max 80 characters").optional(),
  subheading: z.string().max(160, "Max 160 characters").optional(),
  description: z.string().max(500, "Max 500 characters").optional(),
  offerEndsLabel: z.string().max(50, "Max 50 characters").optional(),
  offerEndsValue: z.string().max(50, "Max 50 characters").optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (#RRGGBB)").optional().or(z.literal("")),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (#RRGGBB)").optional().or(z.literal("")),
  ctaText: z.string().max(30, "Max 30 characters").optional(),
  ctaLink: z.string().url("Must be a valid URL").min(1, "CTA Link is required"),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
}).superRefine((data, ctx) => {
  if ((data.type === AdSlotType.BANNER || data.type === AdSlotType.PROMO_STRIP) && !data.heading) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Heading is required for Banners and Promo Strips",
      path: ["heading"],
    });
  }
  if ((data.type === AdSlotType.BANNER || data.type === AdSlotType.PROMO_STRIP) && !data.ctaText) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CTA Text is required for Banners and Promo Strips",
      path: ["ctaText"],
    });
  }
  if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endsAt"],
    });
  }
});

type AdSlotFormValues = z.infer<typeof adSlotSchema>;

interface AdSlotFormProps {
  initialData?: AdSlot;
  onSubmit: (data: CreateAdSlotPayload) => Promise<void>;
  loading?: boolean;
}

export function AdSlotForm({ initialData, onSubmit, loading }: AdSlotFormProps) {
  const form = useForm<AdSlotFormValues>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: {
      position: initialData?.position || "hero-banner",
      type: initialData?.type || AdSlotType.AD,
      variant: initialData?.variant || AdSlotVariant.DEFAULT,
      order: initialData?.order ?? 0,
      imageUrl: initialData?.imageUrl || "",
      mobileImageUrl: initialData?.mobileImageUrl || "",
      altText: initialData?.altText || "",
      heading: initialData?.heading || "",
      subheading: initialData?.subheading || "",
      description: initialData?.description || "",
      offerEndsLabel: initialData?.offerEndsLabel || "",
      offerEndsValue: initialData?.offerEndsValue || "",
      bgColor: initialData?.bgColor || "#ffffff",
      textColor: initialData?.textColor || "#000000",
      ctaText: initialData?.ctaText || "Shop Now",
      ctaLink: initialData?.ctaLink || "/",
      isActive: initialData?.isActive ?? true,
      startsAt: initialData?.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : "",
      endsAt: initialData?.endsAt ? new Date(initialData.endsAt).toISOString().slice(0, 16) : "",
    },
  });

  const handleSubmit = async (values: AdSlotFormValues) => {
    // Ensure empty strings are treated as undefined/null for the API if necessary
    const payload: CreateAdSlotPayload = {
      ...values,
      mobileImageUrl: values.mobileImageUrl || undefined,
      altText: values.altText || undefined,
      heading: values.heading || undefined,
      subheading: values.subheading || undefined,
      description: values.description || undefined,
      offerEndsLabel: values.offerEndsLabel || undefined,
      offerEndsValue: values.offerEndsValue || undefined,
      bgColor: values.bgColor || undefined,
      textColor: values.textColor || undefined,
      ctaText: values.ctaText || "Shop Now", // fallback to "Shop Now" if not provided for AD type
      startsAt: values.startsAt || undefined,
      endsAt: values.endsAt || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AD_POSITIONS.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AdSlotType.AD}>AD</SelectItem>
                        <SelectItem value={AdSlotType.BANNER}>BANNER</SelectItem>
                        <SelectItem value={AdSlotType.PROMO_STRIP}>PROMO_STRIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(AdSlotVariant).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>Display order within position</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <ImageUploader 
                      value={field.value} 
                      onChange={field.onChange}
                      label="Desktop Image"
                      folder="ads"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <ImageUploader 
                      value={field.value || ""} 
                      onChange={field.onChange}
                      label="Mobile Image (Optional)"
                      folder="ads"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="altText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Descriptive text for accessibility" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="heading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading {form.watch("type") !== AdSlotType.AD && "*"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Main title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheading</FormLabel>
                    <FormControl>
                      <Input placeholder="Secondary text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Detailed description or body text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="offerEndsLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Ends Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Ends In:" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offerEndsValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Ends Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2 Days" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="#ffffff" {...field} />
                      </FormControl>
                      <input 
                        type="color" 
                        value={field.value || "#ffffff"} 
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-10 h-10 rounded border border-input cursor-pointer"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="#000000" {...field} />
                      </FormControl>
                      <input 
                        type="color" 
                        value={field.value || "#000000"} 
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-10 h-10 rounded border border-input cursor-pointer"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Text {form.watch("type") !== AdSlotType.AD && "*"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Shop Now" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Link *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts At</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends At</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>Toggle visibility on the site</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Ad Slot" : "Create Ad Slot"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
