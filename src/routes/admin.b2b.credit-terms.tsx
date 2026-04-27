import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/b2b/credit-terms")({
  component: () => <AdminPlaceholder title="Credit Terms" />,
});
