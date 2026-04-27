import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/content/blog/$id/edit")({
  component: () => <AdminPlaceholder title="Edit Blog Post" />,
});
