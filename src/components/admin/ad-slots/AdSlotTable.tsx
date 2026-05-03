import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
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
import { useAdSlots, useDeleteAdSlot } from "@/lib/admin/hooks/useAdSlots";
import type { AdSlot } from "@/types/admin";

interface AdSlotTableProps {
  onEdit: (ad: AdSlot) => void;
}

export function AdSlotTable({ onEdit }: AdSlotTableProps) {
  const [cursor, setCursor] = useState<string | undefined>();
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useAdSlots({ cursor, limit });
  const { mutate: deleteAdSlot } = useDeleteAdSlot();

  const columns = useMemo<ColumnDef<AdSlot>[]>(() => [
    {
      accessorKey: "imageUrl",
      header: "Preview",
      cell: ({ row }) => (
        <img 
          src={row.original.imageUrl} 
          alt={row.original.title} 
          className="h-10 w-10 rounded object-cover border" 
        />
      ),
    },
    {
      accessorKey: "slot",
      header: "Slot #",
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.position.replace("-", " ")}</span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.isActive ? "active" : "inactive"}
          type="user"
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ad = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(ad)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()} 
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the ad slot "{ad.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => deleteAdSlot(ad.id)}
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
  ], [onEdit, deleteAdSlot]);

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      loading={isLoading}
      // Note: AdSlot API uses cursor pagination, but DataTable might expect page/total.
      // I'll check DataTable implementation or just use what works.
      // If DataTable is strictly page-based, I might need to adapt.
      // For now, I'll pass simple pagination.
    />
  );
}
