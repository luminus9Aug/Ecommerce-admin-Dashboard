import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogTable } from "@/components/admin/blog/BlogTable";
import { blogAdapter } from "@/lib/api/adapters/BlogAdapter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/content/blog/")({
  component: BlogIndex,
});

function BlogIndex() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["blogs", cursor],
    queryFn: () => blogAdapter.getBlogs({ cursor, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogAdapter.deleteBlog(id),
    onSuccess: () => {
      toast.success("Blog post deleted");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: () => {
      toast.error("Failed to delete blog post");
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and articles.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/content/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <BlogTable
          blogs={data?.data || []}
          onDelete={(id) => deleteMutation.mutate(id)}
          hasNextPage={data?.meta?.hasNextPage}
          onNextPage={() => setCursor(data?.meta?.nextCursor || undefined)}
          loading={isFetching}
        />
      )}
    </div>
  );
}
