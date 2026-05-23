import { createFileRoute, Link } from "@tanstack/react-router";
import { useOrder } from "@/lib/admin/hooks/useOrders";
import { useGetInvoiceByOrder, useSendInvoiceEmail } from "@/lib/admin/hooks/useInvoice";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { ArrowLeft, Printer, Send, Loader2, Download } from "lucide-react";
import { InvoiceRenderer } from "@/components/admin/orders/InvoiceRenderer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders/$id_/invoice")({
  component: InvoicePage,
});

function InvoicePage() {
  const { id } = Route.useParams();
  const { data: order, isLoading: orderLoading } = useOrder(id);
  const { data: invoice, isLoading: invoiceLoading } = useGetInvoiceByOrder(id);
  const sendEmail = useSendInvoiceEmail(invoice?.id || "");

  if (orderLoading || invoiceLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-black" /></div>;

  if (!invoice || !order) return <div className="p-12 text-center text-gray-500">Invoice not found for this order.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders/$id" params={{ id }} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <PageHeader
            title={`Invoice ${invoice.invoiceNumber}`}
            description={`Order ${order.orderNumber}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button size="sm" className="bg-black text-white hover:bg-gray-800"
            onClick={() => sendEmail.mutate({ to: order.user?.email || order.shippingAddress.email || "" })}
            disabled={sendEmail.isPending}
          >
            <Send className="w-4 h-4 mr-2" /> {sendEmail.isPending ? "Sending..." : "Send to Customer"}
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
        <InvoiceRenderer invoice={invoice} order={order} />
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .shadow-lg { shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
