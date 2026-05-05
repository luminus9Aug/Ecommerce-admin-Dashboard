import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { EmptyState } from "@/components/admin/shared/EmptyState";

interface Props {
  title: string;
  description?: string;
}

export function AdminPlaceholder({ title, description }: Props) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-lg border border-slate-200 bg-white">
        <EmptyState
          icon={Construction}
          title="Coming soon"
          description="This page is part of the admin dashboard scaffold. Ask Lovable to implement it next — the API hooks, types, and design tokens are already in place."
        />
      </div>
    </div>
  );
}

// Generic factory so each route file is a one-liner.
export function placeholderRoute(path: Parameters<typeof createFileRoute>[0], title: string, description?: string) {
  return createFileRoute(path)({
    component: () => <AdminPlaceholder title={title} description={description} />,
  });
}
