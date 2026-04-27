import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/content/blog/")({
  component: () => <AdminPlaceholder title="Blog Posts" />,
});
