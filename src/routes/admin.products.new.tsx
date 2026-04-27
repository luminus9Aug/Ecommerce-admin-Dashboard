import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/products/new")({
  component: () => <AdminPlaceholder title="New Product" />,
});
