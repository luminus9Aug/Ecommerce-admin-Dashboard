import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdSlotForm } from "./AdSlotForm";
import { useCreateAdSlot, useUpdateAdSlot } from "@/lib/admin/hooks/useAdSlots";
import type { AdSlot, CreateAdSlotPayload } from "@/types/admin";

interface AdSlotFormModalProps {
  open: boolean;
  onClose: () => void;
  adSlot?: AdSlot;
}

export function AdSlotFormModal({ open, onClose, adSlot }: AdSlotFormModalProps) {
  const createAdSlot = useCreateAdSlot();
  const updateAdSlot = useUpdateAdSlot(adSlot?.id || "");

  const handleSubmit = async (payload: CreateAdSlotPayload) => {
    if (adSlot) {
      await updateAdSlot.mutateAsync(payload);
    } else {
      await createAdSlot.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{adSlot ? "Edit Ad Slot" : "Add New Ad Slot"}</DialogTitle>
        </DialogHeader>
        <AdSlotForm 
          initialData={adSlot} 
          onSubmit={handleSubmit} 
          loading={createAdSlot.isPending || updateAdSlot.isPending} 
        />
      </DialogContent>
    </Dialog>
  );
}
