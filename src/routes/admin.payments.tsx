import { createFileRoute } from "@tanstack/react-router";
import { AdminPlaceholder } from "@/components/admin/shared/AdminPlaceholder";

export const Route = createFileRoute("/admin/payments")({
  component: () => <AdminPlaceholder title="Payment Methods" />,
});
