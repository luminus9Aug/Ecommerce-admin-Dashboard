import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/shared/DataTable";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useProducts } from "@/lib/admin/hooks/useProducts";
import type { Product } from "@/types/admin";
import { formatCurrency } from "@/lib/admin/api-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsPage,
});

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const p = row.original;
      const imageUrl = p.images?.[0] || "";
      return (
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-slate-100" />
          )}
          <div className="font-medium">{p.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    cell: ({ row }) => formatCurrency(row.getValue("sellingPrice")),
  },
  {
    accessorKey: "stockQuantity",
    header: "Stock",
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
];

function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data, isLoading } = useProducts({ page, limit });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Products" description="Manage your store products" />
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Product
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
