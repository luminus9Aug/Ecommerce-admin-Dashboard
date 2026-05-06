import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/shared/DataTable";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useUsers } from "@/lib/admin/hooks/useUsers";
import type { User } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/users/")({
  component: UsersPage,
});

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="font-medium">
          {u.firstName} {u.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <span className="capitalize text-slate-600">{role.replace("_", " ")}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge 
        status={row.getValue("status") as string} 
        type="user" 
      />
    ),
  },
];

function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data, isLoading } = useUsers({ page, limit });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Users" description="Manage customers and administrators" />
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        pagination={{
          page,
          limit,
          total: data?.total ?? 0,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
        rowSelection={true}
        onRowSelectionChange={(rows) => console.log("Selected:", rows)}
      />
    </div>
  );
}
