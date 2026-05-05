import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { blogAdapter } from "@/lib/api/adapters/BlogAdapter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateBlogPostPayload } from "@/types/admin";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/content/blog/$id/edit")({
  component: EditBlogPage,
});

function EditBlogPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => blogAdapter.getBlogById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateBlogPostPayload) => blogAdapter.updateBlog(id, data),
    onSuccess: () => {
      toast.success("Blog post updated successfully");
      navigate({ to: "/admin/content/blog" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update blog post");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <BlogForm 
        initialData={blog}
        onSubmit={async (data) => {
          updateMutation.mutate(data);
        }} 
        loading={updateMutation.isPending}
      />
    </div>
  );
}
