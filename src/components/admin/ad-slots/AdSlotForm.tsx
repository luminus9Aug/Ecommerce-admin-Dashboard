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
import { Loader2 } from "lucide-react";
import type { AdSlot, CreateAdSlotPayload } from "@/types/admin";

const adSlotSchema = z.object({
  position: z.string().min(1, "Position is required"),
  slot: z.coerce.number().int().min(1).max(2),
  imageUrl: z.string().url("Must be a valid URL"),
  title: z.string().min(1, "Title is required").max(60, "Max 60 characters"),
  subtitle: z.string().max(120, "Max 120 characters").optional(),
  ctaText: z.string().min(1, "CTA Text is required").max(30, "Max 30 characters"),
  ctaLink: z.string().min(1, "CTA Link is required"),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (#RRGGBB)"),
  isActive: z.boolean().default(true),
});

type AdSlotFormValues = z.infer<typeof adSlotSchema>;

interface AdSlotFormProps {
  initialData?: AdSlot;
  onSubmit: (data: CreateAdSlotPayload) => Promise<void>;
  loading?: boolean;
}

const POSITIONS = [
  { label: "Category Sidebar", value: "category-sidebar" },
];

export function AdSlotForm({ initialData, onSubmit, loading }: AdSlotFormProps) {
  const form = useForm<AdSlotFormValues>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: {
      position: initialData?.position || "category-sidebar",
      slot: initialData?.slot || 1,
      imageUrl: initialData?.imageUrl || "",
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      ctaText: initialData?.ctaText || "Shop Now",
      ctaLink: initialData?.ctaLink || "/",
      bgColor: initialData?.bgColor || "#000000",
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = async (values: AdSlotFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
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
                name="slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Number</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Visual order (1 or 2)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader 
                    value={field.value} 
                    onChange={field.onChange}
                    label="Ad Image"
                    folder="ads"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Collection" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Up to 50% off" {...field} />
                    </FormControl>
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
                    <FormLabel>CTA Text</FormLabel>
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
                    <FormLabel>CTA Link</FormLabel>
                    <FormControl>
                      <Input placeholder="/shop or https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="bgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color (Hex)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="#F3F4F6" {...field} />
                      </FormControl>
                      <div 
                        className="w-10 h-10 rounded border border-input shrink-0" 
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-[42px]">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
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
            </div>

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
