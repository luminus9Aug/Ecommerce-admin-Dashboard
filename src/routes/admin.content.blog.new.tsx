import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { blogAdapter } from "@/lib/api/adapters/BlogAdapter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateBlogPostPayload } from "@/types/admin";

export const Route = createFileRoute("/admin/content/blog/new")({
  component: NewBlogPage,
});

function NewBlogPage() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (data: CreateBlogPostPayload) => blogAdapter.createBlog(data),
    onSuccess: () => {
      toast.success("Blog post created successfully");
      navigate({ to: "/admin/content/blog" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create blog post");
    },
  });

  return (
    <div className="p-6">
      <BlogForm 
        onSubmit={async (data) => {
          createMutation.mutate(data);
        }} 
        loading={createMutation.isPending}
      />
    </div>
  );
}
