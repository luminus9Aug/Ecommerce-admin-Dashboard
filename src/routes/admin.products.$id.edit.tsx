import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/products/$id/edit")({
  component: () => <AdminPlaceholder title="Edit Product" />,
});
