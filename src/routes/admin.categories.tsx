import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/shared/DataTable";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/lib/admin/hooks/useCategories";
import { CategoryFormModal } from "@/components/admin/products/CategoryFormModal";
import type { Category } from "@/types/admin";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

const useColumns = (onDelete: (id: string) => void): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex items-center gap-3">
          {c.imageUrl ? (
            <img src={c.imageUrl} alt={c.name} className="h-9 w-9 rounded object-cover" />
          ) : (
            <div className="h-9 w-9 rounded bg-slate-100" />
          )}
          <div>
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.slug}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">
        {row.getValue("description") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("isActive") ? "active" : "inactive"} type="user" />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => onDelete(row.original.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  },
];

function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const handleDelete = (id: string) => {
    if (confirm("Delete this category? Products in this category will become uncategorised.")) {
      deleteCategory.mutate(id);
    }
  };

  const columns = useColumns(handleDelete);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Categories" description="Manage product categories" />
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={isLoading}
      />

      <CategoryFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
