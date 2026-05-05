import { createFileRoute } from "@tanstack/react-router";
import { AdSlotsPage } from "@/pages/AdSlots";

export const Route = createFileRoute("/admin/ad-slots")({
  component: AdSlotsPage,
});
