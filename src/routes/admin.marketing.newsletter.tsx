import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/marketing/newsletter")({
  component: () => <AdminPlaceholder title="Newsletter" />,
});
