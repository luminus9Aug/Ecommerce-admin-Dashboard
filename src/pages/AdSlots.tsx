import { useState } from "react";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdSlotTable } from "@/components/admin/ad-slots/AdSlotTable";
import { AdSlotFormModal } from "@/components/admin/ad-slots/AdSlotFormModal";
import type { AdSlot } from "@/types/admin";

export function AdSlotsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdSlot | undefined>();

  const handleEdit = (ad: AdSlot) => {
    setEditingAd(ad);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAd(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Ad Slots" 
          description="Manage promotional ad slots across the store" 
        />
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Ad Slot
        </Button>
      </div>

      <AdSlotTable onEdit={handleEdit} />

      <AdSlotFormModal
        open={modalOpen}
        adSlot={editingAd}
        onClose={() => {
          setModalOpen(false);
          setEditingAd(undefined);
        }}
      />
    </div>
  );
}
