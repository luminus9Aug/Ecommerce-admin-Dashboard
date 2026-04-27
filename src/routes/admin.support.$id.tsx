import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/support/$id")({
  component: () => <AdminPlaceholder title="Support Ticket" />,
});
