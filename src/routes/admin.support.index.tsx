import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/support/")({
  component: () => <AdminPlaceholder title="Support Tickets" />,
});
