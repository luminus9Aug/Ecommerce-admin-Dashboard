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
import { Plus, Trash2, MoreHorizontal, Edit2 } from "lucide-react";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { useDeleteProduct, useBulkDeleteProducts } from "@/lib/admin/hooks/useProducts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMemo } from "react";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);

  const { data, isLoading } = useProducts({ page, limit });
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: bulkDelete } = useBulkDeleteProducts();

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const p = row.original;
        const imageUrl = p.images?.[0]?.imageUrl || "";
        return (
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img src={imageUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="h-10 w-10 rounded bg-slate-100 shrink-0" />
            )}
            <div>
              <div className="font-medium">{p.name}</div>
              {p.category && (
                <div className="text-xs text-muted-foreground">{p.category.name}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => {
        const p = row.original;
        return p.sku || p.variants?.[0]?.sku || "-";
      },
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => formatCurrency(Number(row.getValue("sellingPrice"))),
    },
    {
      accessorKey: "stockQuantity",
      header: "Stock",
      cell: ({ row }) => {
        const qty = row.getValue<number>("stockQuantity");
        const threshold = row.original.stockQuantity;
        const isLow = qty <= (threshold ?? 10) && qty > 0;
        const isOut = qty === 0;
        return (
          <span className={isOut ? "text-destructive font-medium" : isLow ? "text-amber-600 font-medium" : ""}>
            {qty}
          </span>
        );
      },
    },
    {
      accessorKey: "hasVariants",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.getValue("hasVariants") ? "Variant" : "Simple"}
        </span>
      ),
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
      cell: ({ row }) => {
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setEditingProduct(p);
                setModalOpen(true);
              }}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the product "{p.name}". This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [deleteProduct]);

  const handleBulkDelete = () => {
    const ids = selectedRows.map(r => r.id);
    bulkDelete(ids, {
      onSuccess: () => setSelectedRows([]),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Products" description="Manage your store products" />
        <div className="flex items-center gap-3">
          {selectedRows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedRows.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Multiple Products?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to delete {selectedRows.length} products. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setEditingProduct(undefined);
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
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
        onRowSelectionChange={setSelectedRows}
      />

      <ProductFormModal
        open={modalOpen}
        product={editingProduct}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(undefined);
        }}
      />
    </div>
  );
}
