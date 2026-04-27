import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/b2b/quotes")({
  component: () => <AdminPlaceholder title="B2B Quotes" />,
});
