import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/content/blog/new")({
  component: () => <AdminPlaceholder title="New Blog Post" />,
});
