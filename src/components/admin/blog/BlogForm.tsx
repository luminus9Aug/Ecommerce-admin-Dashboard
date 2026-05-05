import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BlogPost, CreateBlogPostPayload, BlogCategory } from "@/types/admin";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/shared/RichTextEditor";
import { ImageUploader } from "@/components/admin/shared/ImageUploader";
import { useEffect, useState } from "react";
import { blogAdapter } from "@/lib/api/adapters/BlogAdapter";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const blogBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  thumbnail: z.string().optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().optional(),
  readTime: z.coerce.number().optional(),
  excerpt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  keywords: z.string().optional(),
  newCategoryName: z.string().optional(),
});

const blogFormSchema = blogBaseSchema.refine((data) => {
  if (data.isPublished) {
    return !!data.metaTitle && !!data.metaDescription && !!data.excerpt;
  }
  return true;
}, {
  message: "SEO fields (Meta Title, Meta Description, Excerpt) are required when publishing",
  path: ["isPublished"],
});

type BlogFormValues = z.infer<typeof blogBaseSchema>;

interface BlogFormProps {
  initialData?: BlogPost;
  onSubmit: (data: CreateBlogPostPayload) => Promise<void>;
  loading?: boolean;
}

export function BlogForm({ initialData, onSubmit, loading }: BlogFormProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      thumbnail: initialData?.thumbnail || "",
      categoryId: initialData?.category?.id || initialData?.categoryId || "",
      isPublished: initialData?.isPublished || false,
      publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt) : undefined,
      readTime: initialData?.readTime || 0,
      excerpt: initialData?.excerpt || "",
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      ogImage: initialData?.ogImage || "",
      canonicalUrl: initialData?.canonicalUrl || "",
      keywords: initialData?.keywords?.join(", ") || "",
      newCategoryName: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setFetchingCategories(true);
      try {
        const data = await blogAdapter.getBlogCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFormSubmit: SubmitHandler<BlogFormValues> = async (values) => {
    try {
      let finalCategoryId = values.categoryId;

      // Handle new category creation
      if (showNewCategoryInput && values.newCategoryName) {
        setCreatingCategory(true);
        const newCategory = await blogAdapter.createBlogCategory(values.newCategoryName);
        finalCategoryId = newCategory.id;
        toast.success(`Category "${newCategory.name}" created`);
      }

      const payload: CreateBlogPostPayload = {
        ...values,
        categoryId: finalCategoryId,
        keywords: values.keywords ? values.keywords.split(",").map(k => k.trim()) : [],
        publishedAt: values.publishedAt?.toISOString(),
      };
      
      // Remove the temporary field from payload
      delete (payload as any).newCategoryName;
      
      await onSubmit(payload);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {initialData ? "Edit Blog Post" : "Create Blog Post"}
          </h2>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Post" : "Create Post"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="auto-generated-from-title" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to auto-generate from title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Short summary of the post" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Required for published posts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Content</FormLabel>
                      <FormControl>
                        <RichTextEditor 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="seo" className="w-full">
              <TabsList>
                <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              <TabsContent value="seo">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Post title for search engines" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description for search results" 
                              className="resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="canonicalUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canonical URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Keywords</FormLabel>
                            <FormControl>
                              <Input placeholder="react, tech, blog" {...field} />
                            </FormControl>
                            <FormDescription>Comma separated</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="images">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="thumbnail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image</FormLabel>
                          <FormControl>
                            <ImageUploader 
                              value={field.value} 
                              onChange={field.onChange}
                              label="Upload Thumbnail"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ogImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social Share Image (OG Image)</FormLabel>
                          <FormControl>
                            <ImageUploader 
                              value={field.value} 
                              onChange={field.onChange}
                              label="Upload OG Image"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Published</FormLabel>
                        <FormDescription>
                          Make this post visible on the storefront.
                        </FormDescription>
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

                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publish Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Category</FormLabel>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setShowNewCategoryInput(!showNewCategoryInput);
                            if (showNewCategoryInput) {
                              form.setValue("newCategoryName", "");
                            }
                          }}
                        >
                          {showNewCategoryInput ? (
                            <><X className="mr-1 h-3 w-3" /> Cancel</>
                          ) : (
                            <><Plus className="mr-1 h-3 w-3" /> New</>
                          )}
                        </Button>
                      </div>
                      
                      {showNewCategoryInput ? (
                        <FormField
                          control={form.control}
                          name="newCategoryName"
                          render={({ field: newCatField }) => (
                            <FormControl>
                              <Input 
                                placeholder="New category name" 
                                {...newCatField} 
                                autoFocus
                              />
                            </FormControl>
                          )}
                        />
                      ) : (
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                          disabled={fetchingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fetchingCategories ? (
                              <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : categories.length === 0 ? (
                              <SelectItem value="none" disabled>No categories found</SelectItem>
                            ) : (
                              categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="readTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Read Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
