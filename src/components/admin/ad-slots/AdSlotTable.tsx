import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MoreHorizontal, Edit2, Trash2, Calendar } from "lucide-react";
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
import { useAdSlots, useDeleteAdSlot, useUpdateAdSlot } from "@/lib/admin/hooks/useAdSlots";
import { AdSlotType, AdSlotVariant, type AdSlot } from "@/types/admin";
import { cn } from "@/lib/utils";

const AD_POSITIONS = [
  { value: "all", label: "All Positions" },
  { value: "hero-banner", label: "Hero Banner" },
  { value: "category-sidebar-top", label: "Category Sidebar Top" },
  { value: "category-sidebar-bottom", label: "Category Sidebar Bottom" },
  { value: "featured-sidebar-top", label: "Featured Sidebar Top" },
  { value: "featured-banner", label: "Featured Banner" },
  { value: "deals-banner", label: "Deals Banner" },
  { value: "promo-strip", label: "Promo Strip" },
  { value: "arrivals-sidebar", label: "Arrivals Sidebar" },
];

interface AdSlotTableProps {
  onEdit: (ad: AdSlot) => void;
}

export function AdSlotTable({ onEdit }: AdSlotTableProps) {
  const [position, setPosition] = useState("all");
  const [type, setType] = useState("all");
  const [variantFilter, setVariantFilter] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [limit] = useState(10);
  const [cursor, setCursor] = useState<string | undefined>();

  const filters = {
    position: position === "all" ? undefined : position,
    type: type === "all" ? undefined : type,
    variant: variantFilter === "all" ? undefined : variantFilter,
    isActive: isActive === "all" ? undefined : isActive === "active",
    limit,
    cursor,
  };

  const { data, isLoading } = useAdSlots(filters);
  const { mutate: deleteAdSlot } = useDeleteAdSlot();
  const { mutate: updateAdSlot } = useUpdateAdSlot(""); // ID will be passed in mutate

  const columns = useMemo<ColumnDef<AdSlot>[]>(() => [
    {
      accessorKey: "imageUrl",
      header: "Preview",
      cell: ({ row }) => (
        <img 
          src={row.original.imageUrl} 
          alt={row.original.altText || "Ad Preview"} 
          className="h-10 w-10 rounded object-cover border" 
          loading="lazy"
        />
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.position.replace(/-/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge 
            className={cn(
              type === AdSlotType.AD && "bg-blue-100 text-blue-800 hover:bg-blue-100",
              type === AdSlotType.BANNER && "bg-purple-100 text-purple-800 hover:bg-purple-100",
              type === AdSlotType.PROMO_STRIP && "bg-amber-100 text-amber-800 hover:bg-amber-100"
            )}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "variant",
      header: "Variant",
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-1 rounded">
          {row.original.variant}
        </code>
      ),
    },
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "heading",
      header: "Heading/Title",
      cell: ({ row }) => (
        <div className={cn("max-w-[200px] truncate font-medium", !row.original.heading && "text-muted-foreground italic")}>
          {row.original.heading || "No heading"}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => {
        const ad = row.original;
        const { mutate: updateStatus } = useUpdateAdSlot(ad.id);
        return (
          <Switch 
            checked={ad.isActive} 
            onCheckedChange={(checked) => updateStatus({ isActive: checked })}
          />
        );
      },
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: ({ row }) => {
        const { startsAt, endsAt } = row.original;
        if (!startsAt && !endsAt) return <span className="text-muted-foreground text-xs">Always</span>;
        return (
          <div className="flex flex-col text-[10px] text-muted-foreground">
            {startsAt && <span>Starts: {new Date(startsAt).toLocaleDateString()}</span>}
            {endsAt && <span>Ends: {new Date(endsAt).toLocaleDateString()}</span>}
          </div>
        );
      },
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
                      This will permanently delete this ad slot from "{ad.position}". This action cannot be undone.
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="w-[200px]">
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger>
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {AD_POSITIONS.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px]">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={AdSlotType.AD}>AD</SelectItem>
              <SelectItem value={AdSlotType.BANNER}>BANNER</SelectItem>
              <SelectItem value={AdSlotType.PROMO_STRIP}>PROMO_STRIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px]">
          <Select value={variantFilter} onValueChange={setVariantFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Variants</SelectItem>
              {Object.entries(AdSlotVariant).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px]">
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
      />
    </div>
  );
}
