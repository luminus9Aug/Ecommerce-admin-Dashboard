import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/orders/$id")({
  component: () => <AdminPlaceholder title="Order Detail" />,
});
