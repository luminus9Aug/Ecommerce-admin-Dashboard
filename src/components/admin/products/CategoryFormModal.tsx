import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
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
import { ImageUploader } from "@/components/admin/shared/ImageUploader";
import { useCreateCategory, useCategories } from "@/lib/admin/hooks/useCategories";
import type { Category } from "@/types/admin";

// ─── Zod Schema ──────────────────────────────────────────────
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9-]*$/, "Slug must be lowercase letters, numbers and hyphens only")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  parentId: z.string().uuid("Must be a valid category ID").optional().or(z.literal("none")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── Auto-slug helper ─────────────────────────────────────────
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 255);
}

// ─── Props ────────────────────────────────────────────────────
interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill for edit mode (future). Pass undefined for create. */
  initialData?: Partial<Category>;
}

// ─── Component ───────────────────────────────────────────────
export function CategoryFormModal({ open, onClose, initialData }: CategoryFormModalProps) {
  const createCategory = useCreateCategory();
  const { data: allCategories = [] } = useCategories();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      parentId: initialData?.parentId ?? "none",
      sortOrder: 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  // Auto-generate slug when name changes (only if slug is empty)
  const name = form.watch("name");
  useEffect(() => {
    const current = form.getValues("slug");
    if (!current) {
      form.setValue("slug", toSlug(name), { shouldValidate: false });
    }
  }, [name, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    await createCategory.mutateAsync({
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      imageUrl: values.imageUrl || undefined,
      parentId: values.parentId === "none" ? undefined : (values.parentId || undefined),
      sortOrder: values.sortOrder,
      isActive: values.isActive,
    });
    form.reset();
    onClose();
  };

  // Filter out current category from parent options (prevent self-reference)
  const parentOptions = allCategories.filter((c) => c.id !== initialData?.id);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Thermal Transfer Ribbon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="auto-generated" {...field} />
                  </FormControl>
                  <FormDescription>URL-friendly identifier. Auto-filled from name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      label="Category Image"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      folder="categories"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Category */}
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None (top-level)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (top-level)</SelectItem>
                      {parentOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sort Order + Active toggle in one row */}
            <div className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start pb-1">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
