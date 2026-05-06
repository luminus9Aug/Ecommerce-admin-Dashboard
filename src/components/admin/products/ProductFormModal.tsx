import { useEffect, useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/shared/ImageUploader";
import { useCategories } from "@/lib/admin/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/lib/admin/hooks/useProducts";
import { Plus, Trash2, PlusCircle, FolderPlus, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryFormModal } from "./CategoryFormModal";
import type { CreateProductPayload, Product } from "@/types/admin";

// ─── Zod Schema ──────────────────────────────────────────────────────
const variantSchema = z.object({
  name: z.string().optional(),
  skuSuffix: z.string().optional(),
  mrp: z.coerce.number().min(0, "MRP must be ≥ 0"),
  sellingPrice: z.coerce.number().min(0, "Price must be ≥ 0"),
  b2bPrice: z.coerce.number().min(0, "B2B Price must be ≥ 0").optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
});

const imageSchema = z.object({
  imageUrl: z.string().min(1, "Image URL is required"),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const productSchema = z.object({
  name: z.string().min(3, "Min 3 characters").max(500),
  brand: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]*$/, "Lowercase, numbers and hyphens only").optional().or(z.literal("")),
  description: z.string().optional(),
  categoryId: z.string().optional().or(z.literal("none")),
  sku: z.string().max(100).optional(),
  hasVariants: z.boolean().default(false),
  mrp: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
  b2bPrice: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  metaTitle: z.string().max(60, "Max 60 chars").optional(),
  metaDescription: z.string().max(160, "Max 160 chars").optional(),
  canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ogTitle: z.string().max(255).optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  searchKeywords: z.string().optional(), // comma-separated, split on submit
  specifications: z.array(z.object({ key: z.string().min(1), value: z.string() })).max(4).default([]),
  colLabels: z.object({
    col1: z.string().optional(),
    col2: z.string().optional(),
    col3: z.string().optional(),
    col4: z.string().optional(),
  }).default({}),
}).superRefine((data, ctx) => {
  if (!data.hasVariants) {
    if (data.mrp === undefined || data.mrp === null) {
      ctx.addIssue({ code: "custom", path: ["mrp"], message: "Required for simple products" });
    }
    if (data.sellingPrice === undefined || data.sellingPrice === null) {
      ctx.addIssue({ code: "custom", path: ["sellingPrice"], message: "Required for simple products" });
    }
  }
  if (data.hasVariants && data.variants.length === 0) {
    ctx.addIssue({ code: "custom", path: ["variants"], message: "Add at least one variant" });
  }
});

type ProductFormValues = z.infer<typeof productSchema>;

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 500);
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
}

export function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id || "");
  const { data: categories = [] } = useCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      slug: "",
      description: "",
      categoryId: "none",
      sku: "",
      hasVariants: false,
      isFeatured: false,
      isActive: true,
      images: [],
      variants: [],
      mrp: 0,
      sellingPrice: 0,
      b2bPrice: 0,
      stockQuantity: 0,
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      searchKeywords: "",
      specifications: [],
      colLabels: { col1: "", col2: "", col3: "", col4: "" },
    },
  });

  const { fields: imageFields, append: addImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });
  const { fields: variantFields, append: addVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  const { fields: specFields, append: addSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const name = form.watch("name");
  const hasVariants = form.watch("hasVariants");
  const metaTitle = form.watch("metaTitle") ?? "";
  const metaDesc = form.watch("metaDescription") ?? "";

  useEffect(() => {
    if (open) {
      if (product) {
        // Populate for edit
        form.reset({
          name: product.name,
          brand: product.brand || "",
          slug: product.slug,
          description: product.description || "",
          categoryId: product.categoryId || (product.category as any)?.id || "none",
          sku: product.sku || "",
          hasVariants: product.hasVariants,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          mrp: product.mrp,
          sellingPrice: product.sellingPrice,
          b2bPrice: product.b2bPrice || 0,
          stockQuantity: product.stockQuantity,
          images: product.images.map(img => ({
            imageUrl: img.imageUrl,
            altText: img.altText || "",
            isPrimary: img.isPrimary,
          })),
          variants: product.variants.map(v => ({
            name: v.name || "",
            skuSuffix: v.sku?.split("-").pop() || "", // Rough extraction
            mrp: v.mrp,
            sellingPrice: v.sellingPrice,
            b2bPrice: v.b2bPrice || 0,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
            attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value })),
          })),
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          canonicalUrl: product.canonicalUrl || "",
          ogTitle: product.ogTitle || "",
          ogDescription: product.ogDescription || "",
          ogImage: product.ogImage || "",
          searchKeywords: product.searchKeywords?.join(", ") || "",
          specifications: Object.entries(product.specifications || {})
            .filter(([k]) => !k.startsWith("__"))
            .map(([key, value]) => ({ key, value: String(value) })),
          colLabels: {
            col1: product.specifications?.__col1Label || "",
            col2: product.specifications?.__col2Label || "",
            col3: product.specifications?.__col3Label || "",
            col4: product.specifications?.__col4Label || "",
          },
        });
      } else {
        // Reset for new
        form.reset({
          name: "",
          brand: "",
          slug: "",
          description: "",
          categoryId: "none",
          sku: "",
          hasVariants: false,
          isFeatured: false,
          isActive: true,
          images: [],
          variants: [],
          mrp: 0,
          sellingPrice: 0,
          b2bPrice: 0,
          stockQuantity: 0,
          metaTitle: "",
          metaDescription: "",
          canonicalUrl: "",
          ogTitle: "",
          ogDescription: "",
          ogImage: "",
          searchKeywords: "",
          specifications: [],
          colLabels: { col1: "", col2: "", col3: "", col4: "" },
        });
      }
    }
  }, [open, product, form]);

  useEffect(() => {
    if (!product && !form.getValues("slug")) {
      form.setValue("slug", toSlug(name), { shouldValidate: false });
    }
  }, [name, form, product]);

  const handleGenerateSku = () => {
    const brand = form.getValues("brand");
    const name = form.getValues("name");
    if (!name) return;

    const brandPart = brand ? brand.slice(0, 3).toUpperCase() : "PROD";
    const namePart = toSlug(name).split("-").map(w => w[0]).join("").toUpperCase().slice(0, 4);
    const random = Math.floor(100 + Math.random() * 900);
    const sku = `${brandPart}-${namePart}-${random}`;
    form.setValue("sku", sku, { shouldValidate: true });
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payload: CreateProductPayload = {
      name: values.name,
      brand: values.brand || undefined,
      slug: values.slug || undefined,
      description: values.description || undefined,
      categoryId: values.categoryId === "none" ? undefined : (values.categoryId || undefined),
      sku: values.sku || undefined,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      images: values.images.map((img, i) => ({
        imageUrl: img.imageUrl,
        altText: img.altText || undefined,
        isPrimary: i === 0,
        sortOrder: i,
      })),
      metaTitle: values.metaTitle || undefined,
      metaDescription: values.metaDescription || undefined,
      canonicalUrl: values.canonicalUrl || undefined,
      ogTitle: values.ogTitle || undefined,
      ogDescription: values.ogDescription || undefined,
      ogImage: values.ogImage || undefined,
      searchKeywords: values.searchKeywords
        ? values.searchKeywords.split(",").map((k) => k.trim()).filter(Boolean)
        : undefined,
      specifications: {
        ...values.specifications.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
        __col1Label: values.colLabels.col1 || "",
        __col2Label: values.colLabels.col2 || "",
        __col3Label: values.colLabels.col3 || "",
        __col4Label: values.colLabels.col4 || "",
      },
    };

    if (values.hasVariants) {
      payload.variants = values.variants.map((v) => ({
        name: v.name || undefined,
        skuSuffix: v.skuSuffix || undefined,
        mrp: v.mrp,
        sellingPrice: v.sellingPrice,
        b2bPrice: v.b2bPrice || undefined,
        stockQuantity: v.stockQuantity || 0,
        isActive: v.isActive,
        attributes: v.attributes.reduce((acc, { key, value }) => {
          if (key) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      }));
    } else {
      payload.mrp = values.mrp || 0;
      payload.sellingPrice = values.sellingPrice || 0;
      payload.b2bPrice = values.b2bPrice || undefined;
      payload.stockQuantity = values.stockQuantity || 0;
      payload.lowStockThreshold = values.lowStockThreshold || 10;
    }

    if (product) {
      await updateProduct.mutateAsync(payload);
    } else {
      await createProduct.mutateAsync(payload);
    }
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* ── TAB 1: BASIC ── */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. STD Wax Ribbon" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl><Input placeholder="e.g. Zebra" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl><Input placeholder="auto-generated" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        SKU
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] text-blue-600 px-1"
                          onClick={handleGenerateSku}
                        >
                          <Wand2 className="h-3 w-3 mr-1" /> Generate
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TTR-WAX" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">Prefix for variant SKUs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea rows={4} placeholder="Product description..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Dynamic Specifications */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Product Specifications</h4>
                      <p className="text-xs text-muted-foreground">Add up to 4 custom attributes (e.g. Material: Wax)</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={specFields.length >= 4}
                      onClick={() => addSpec({ key: "", value: "" })}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {specFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.key`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input placeholder="Key (e.g. Material)" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input placeholder="Value (e.g. Wax)" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive mt-1"
                          onClick={() => removeSpec(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {specFields.length === 0 && (
                      <p className="text-xs text-center text-muted-foreground py-2 border border-dashed rounded">
                        No specifications added yet.
                      </p>
                    )}
                  </div>
                </div>

                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Category</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => setIsCategoryModalOpen(true)}
                      >
                        <FolderPlus className="h-3.5 w-3.5 mr-1" /> New Category
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">Uncategorised</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-6">
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="!mt-0">Featured</FormLabel>
                    </FormItem>
                  )} />
                </div>

                {/* Recommendation Grid Labels */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <div>
                    <h4 className="text-sm font-medium">Recommendation Grid Labels</h4>
                    <p className="text-xs text-muted-foreground">Customise labels for the 4 recommendation columns on PDP</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="colLabels.col1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase">Column 1</FormLabel>
                          <FormControl><Input placeholder="Related Products" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colLabels.col2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase">Column 2</FormLabel>
                          <FormControl><Input placeholder="You May Also Like" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colLabels.col3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase">Column 3</FormLabel>
                          <FormControl><Input placeholder="Same Brand" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="colLabels.col4"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase">Column 4</FormLabel>
                          <FormControl><Input placeholder="Featured Products" {...field} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ── TAB 2: PRICING ── */}
              <TabsContent value="pricing" className="space-y-4">
                <FormField control={form.control} name="hasVariants" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div>
                      <FormLabel className="!mt-0">This product has variants</FormLabel>
                      <FormDescription className="text-xs">e.g. different sizes, colours. Pricing moves to the Variants tab.</FormDescription>
                    </div>
                  </FormItem>
                )} />

                {!hasVariants && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField control={form.control} name="mrp" render={({ field }) => (
                        <FormItem>
                          <FormLabel>MRP *</FormLabel>
                          <FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price *</FormLabel>
                          <FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="b2bPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel>B2B Price</FormLabel>
                          <FormControl><Input type="number" min={0} step="0.01" placeholder="0.00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl><Input type="number" min={0} placeholder="0" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Stock Alert</FormLabel>
                          <FormControl><Input type="number" min={0} placeholder="10" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}
                {hasVariants && (
                  <p className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                    Pricing and stock are managed per-variant in the <strong>Variants</strong> tab.
                  </p>
                )}
              </TabsContent>

              {/* ── TAB 3: IMAGES ── */}
              <TabsContent value="images" className="space-y-4">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3 relative">
                    {index === 0 && <Badge className="absolute top-3 right-10 text-xs">Primary</Badge>}
                    <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 text-destructive" onClick={() => removeImage(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <FormField control={form.control} name={`images.${index}.imageUrl`} render={({ field: f }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader label={`Image ${index + 1}`} value={f.value} onChange={f.onChange} folder="products" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`images.${index}.altText`} render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl><Input placeholder="Describe the image for SEO..." {...f} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => addImage({ imageUrl: "", altText: "", isPrimary: imageFields.length === 0 })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Image
                </Button>
              </TabsContent>

              {/* ── TAB 4: VARIANTS ── */}
              <TabsContent value="variants" className="space-y-4">
                {!hasVariants ? (
                  <p className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                    Enable <strong>"This product has variants"</strong> in the Pricing tab first.
                  </p>
                ) : (
                  <>
                    {variantFields.map((vField, vi) => (
                      <VariantRow key={vField.id} index={vi} onRemove={() => removeVariant(vi)} form={form} />
                    ))}
                    <Button type="button" variant="outline" onClick={() => addVariant({ name: "", skuSuffix: "", mrp: 0, sellingPrice: 0, stockQuantity: 0, isActive: true, attributes: [] })}>
                      <Plus className="h-4 w-4 mr-2" /> Add Variant
                    </Button>
                    {form.formState.errors.variants?.root && (
                      <p className="text-sm text-destructive">{form.formState.errors.variants.root.message}</p>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ── TAB 5: SEO ── */}
              <TabsContent value="seo" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="metaTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title <span className="text-muted-foreground text-xs">({metaTitle.length}/60)</span></FormLabel>
                      <FormControl><Input maxLength={60} placeholder="Best product title for Google" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="canonicalUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL</FormLabel>
                      <FormControl><Input placeholder="https://yourdomain.com/products/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="metaDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description <span className="text-muted-foreground text-xs">({metaDesc.length}/160)</span></FormLabel>
                    <FormControl><Textarea maxLength={160} rows={3} placeholder="Compelling 160-char description for Google results..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Open Graph (Social Sharing)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="ogTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>OG Title</FormLabel>
                        <FormControl><Input placeholder="Title shown when shared on social" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="ogImage" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader label="OG Image (1200×630)" value={field.value ?? ""} onChange={field.onChange} folder="og-images" previewSize={60} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="ogDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>OG Description</FormLabel>
                      <FormControl><Textarea rows={2} placeholder="Description shown on WhatsApp, Facebook previews..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="border-t pt-4">
                  <FormField control={form.control} name="searchKeywords" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="wax ribbon, thermal ribbon, barcode ribbon (comma-separated)" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">Comma-separated. Powers site search and internal relevance.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {createProduct.isPending || updateProduct.isPending ? "Saving..." : (product ? "Update Product" : "Create Product")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <CategoryFormModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </Dialog>
  );
}

// ─── Variant Row (extracted to keep main component under 40 lines rule) ──
function VariantRow({
  index,
  onRemove,
  form,
}: {
  index: number;
  onRemove: () => void;
  form: UseFormReturn<ProductFormValues>;
}) {
  const {
    fields: attrFields,
    append: addAttr,
    remove: removeAttr,
  } = useFieldArray({
    control: form.control,
    name: `variants.${index}.attributes` as const,
  });

  return (
    <div className="border rounded-lg p-4 space-y-3 relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-muted-foreground">
          Variant {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`variants.${index}.name` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 110mm x 300m" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.skuSuffix` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU Suffix</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 110" {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                Appended to product SKU
              </FormDescription>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`variants.${index}.mrp` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>MRP *</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.sellingPrice` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selling Price *</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.b2bPrice` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>B2B Price</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.stockQuantity` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Dynamic key-value attributes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Attributes (e.g. Size, Color)
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => addAttr({ key: "", value: "" })}
          >
            <PlusCircle className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {attrFields.map((af, ai) => (
          <div key={af.id} className="flex gap-2 items-center">
            <FormField
              control={form.control}
              name={`variants.${index}.attributes.${ai}.key` as const}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Key (e.g. Size)" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`variants.${index}.attributes.${ai}.value` as const}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Value (e.g. 110mm)" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive shrink-0"
              onClick={() => removeAttr(ai)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name={`variants.${index}.isActive` as const}
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 text-sm">Active</FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}
