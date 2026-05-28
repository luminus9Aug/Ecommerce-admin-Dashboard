import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/shared/DataTable";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useUsers, useSuspendUser, useActivateUser } from "@/lib/admin/hooks/useUsers";
import type { User } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, UserMinus, UserCheck, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/admin/users/")({
  component: UsersPage,
});

function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const { data, isLoading } = useUsers({
    page,
    limit,
    search,
    role: role || undefined
  });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Link
            to="/admin/users/$id"
            params={{ id: u.id }}
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block cursor-pointer"
          >
            {u.firstName} {u.lastName}
          </Link>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-gray-500 font-medium">{row.getValue("email")}</span>
      )
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const roleVal = row.getValue("role") as string;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${roleVal === 'admin' ? 'bg-purple-100 text-purple-800' :
              roleVal === 'company' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-700'
            }`}>
            {roleVal.replace("_", " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.getValue("isActive") ? "active" : "inactive"}
          type="user"
        />
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: ({ row }) => {
        const u = row.original;
        const isSuspending = suspendUser.isPending && suspendUser.variables === u.id;
        const isActivating = activateUser.isPending && activateUser.variables === u.id;

        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            <Link
              to="/admin/users/$id"
              params={{ id: u.id }}
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="View User details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {u.isActive ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={isSuspending || isActivating}
                onClick={() => suspendUser.mutate(u.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold h-8"
              >
                {isSuspending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserMinus className="w-3.5 h-3.5 mr-1" />
                )}
                Suspend
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={isSuspending || isActivating}
                onClick={() => activateUser.mutate(u.id)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs font-semibold h-8"
              >
                {isActivating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                )}
                Activate
              </Button>
            )}
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <PageHeader title="Users" description="Manage customers and administrators" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-gray-400 w-4 h-4" />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 py-2 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="user">Customer (B2C)</option>
            <option value="company">B2B Business</option>
            <option value="admin">Admin</option>
          </select>
        </div>
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
