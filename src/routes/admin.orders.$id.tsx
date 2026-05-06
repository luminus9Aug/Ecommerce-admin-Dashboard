import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useOrder } from "@/lib/admin/hooks/useOrders";
import { useUpdateOrderAdmin } from "@/lib/admin/hooks/useOrderAdmin";
import { useGetInvoiceByOrder, useGenerateInvoice } from "@/lib/admin/hooks/useInvoice";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { ArrowLeft, Clock, MapPin, Package, User, FileText, AlertCircle, Printer, Download, Mail } from "lucide-react";
import { EditableStatusField } from "@/components/admin/orders/EditableStatusField";
import { TrackingTimeline } from "@/components/admin/orders/TrackingTimeline";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { format, isValid } from "date-fns";

const formatSafeDate = (date: any, formatStr: string) => {
  const d = new Date(date);
  return isValid(d) ? format(d, formatStr) : "N/A";
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id);
  const updateOrder = useUpdateOrderAdmin(id);
  const { data: invoice } = useGetInvoiceByOrder(id);
  const generateInvoice = useGenerateInvoice();
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
        <p className="mt-2 text-gray-500">The order you are looking for does not exist or has been deleted.</p>
        <Link to="/admin/orders" className="mt-4 inline-block text-black hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const handleGenerateInvoice = async () => {
    await generateInvoice.mutateAsync({ orderId: id, notes: invoiceNotes });
    setIsInvoiceModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <PageHeader
            title={`Order ${order.orderNumber}`}
            description={`Placed on ${formatSafeDate(order.createdAt, 'PPP p')}`}
          />
        </div>
        <div className="flex items-center gap-2">
          {invoice ? (
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={() => navigate({ to: `/admin/orders/${id}/invoice` })}>
                <FileText className="w-4 h-4 mr-2" /> View Invoice
              </Button>
            </div>
          ) : (
            <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  <FileText className="w-4 h-4 mr-2" /> Generate Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Tax Invoice</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-sm text-gray-500">This will generate an Indian GST compliant invoice for order {order.orderNumber}.</p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
                    <textarea 
                      className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black" 
                      rows={3} 
                      placeholder="Special instructions or notes for the invoice..."
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleGenerateInvoice} disabled={generateInvoice.isPending} className="bg-black text-white hover:bg-gray-800">
                    {generateInvoice.isPending ? "Generating..." : "Generate Now"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Top Quick Info Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
         <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6">
              <EditableStatusField 
                label="Order Status"
                value={order.orderStatus}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Confirmed', value: 'confirmed' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Shipped', value: 'shipped' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Cancelled', value: 'cancelled' },
                  { label: 'Returned', value: 'returned' },
                  { label: 'Completed', value: 'completed' },
                ]}
                onSave={async (v) => { await updateOrder.mutateAsync({ orderStatus: v as any }); }}
                isLoading={updateOrder.isPending}
              />
              <EditableStatusField 
                label="Payment Status"
                value={order.paymentStatus}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Paid', value: 'paid' },
                  { label: 'Failed', value: 'failed' },
                  { label: 'Refunded', value: 'refunded' },
                ]}
                onSave={async (v) => { await updateOrder.mutateAsync({ paymentStatus: v as any }); }}
                isLoading={updateOrder.isPending}
              />
            </div>
            <div className="flex gap-8 text-right">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</span>
                <span className="text-sm font-semibold">{order.trackingNumber || 'Not assigned'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
         </div>
      </div>

      {/* Metadata Row: 4 Columns (Invoice, Customer, Shipping, Payment) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-stretch">
        {/* Invoice Summary Card */}
        {invoice ? (
          <div className="overflow-hidden border border-gray-200 shadow-sm rounded-xl bg-white flex flex-col">
            <div className="bg-black p-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white">
                <FileText className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Tax Invoice</h3>
              </div>
              <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-widest truncate max-w-[80px]">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-medium">Grand Total</p>
                <p className="text-xl font-black text-gray-900">{formatCurrency(Number(invoice.amount))}</p>
                <p className="text-[10px] text-gray-500 uppercase font-medium mt-1">Due: <span className="font-bold text-black">{formatSafeDate(invoice.dueDate, 'dd MMM yyyy')}</span></p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 px-2" onClick={() => navigate({ to: `/admin/orders/${id}/invoice` })}>
                  View Live
                </Button>
                <Button variant="outline" size="sm" className="w-full text-[10px] h-7 px-2" onClick={() => navigate({ to: `/admin/orders/${id}/invoice` })}>
                  <Download className="w-3 h-3 mr-1" /> Download
                </Button>
              </div>
            </div>
          </div>
        ) : (
           <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center p-4 text-center">
             <div className="space-y-1">
               <FileText className="w-6 h-6 text-gray-300 mx-auto" />
               <p className="text-xs font-medium text-gray-500">No Invoice Generated</p>
             </div>
           </div>
        )}

        {/* Customer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-[10px]">Customer</h3>
          </div>
          {order.user ? (
            <div className="space-y-2 flex-grow">
              <div className="flex flex-col">
                <p className="font-bold text-gray-900 text-sm truncate">{order.user.firstName} {order.user.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{order.user.email}</p>
              </div>
              <div className="space-y-0.5 mt-auto">
                <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Phone</p>
                <p className="text-xs font-medium">{order.user.phoneNumber || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-xs my-auto">Guest Checkout</p>
          )}
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-[10px]">Shipping</h3>
          </div>
          {order.shippingAddress ? (
            <div className="space-y-1 text-xs text-gray-700 flex-grow">
              <p className="font-bold text-gray-900 mb-1 truncate">{order.shippingAddress.fullName}</p>
              <p className="line-clamp-1">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p className="line-clamp-1">{order.shippingAddress.addressLine2}</p>}
              <p className="line-clamp-1">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="font-medium text-gray-500 mt-2 uppercase text-[9px] tracking-widest">PIN: <span className="text-black">{order.shippingAddress.pincode}</span></p>
            </div>
          ) : (
            <p className="text-gray-500 italic text-xs my-auto">No shipping details</p>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 uppercase tracking-wider text-[10px]">Payment & Billing</h3>
          </div>
          <div className="space-y-3 text-xs flex-grow">
            <div className="flex flex-col space-y-0.5">
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Method</span>
              <span className="font-bold uppercase tracking-tight text-black">{order.paymentMethod?.replace('_', ' ')}</span>
            </div>
            <div className="flex flex-col space-y-0.5">
              <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Transaction ID</span>
              <span className="font-mono text-gray-600 truncate">{order.paymentId || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {/* Return Info if applicable */}
          {order.returnStatus && order.returnStatus !== 'none' && (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-orange-900">Return Request</h3>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">{order.returnStatus}</span>
                </div>
                <p className="text-sm text-orange-800"><span className="font-semibold">Reason:</span> {order.returnReason || 'No reason provided'}</p>
                <div className="flex gap-2 pt-2">
                   <Button size="sm" variant="outline" className="bg-white border-orange-200 hover:bg-orange-100 text-orange-900" 
                      onClick={() => updateOrder.mutate({ returnStatus: 'approved' })}>
                      Approve Return
                   </Button>
                   <Button size="sm" variant="outline" className="bg-white border-orange-200 hover:bg-orange-100 text-orange-900"
                      onClick={() => updateOrder.mutate({ returnStatus: 'rejected' })}>
                      Reject Return
                   </Button>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-grow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Order Items</h3>
              </div>
              <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="divide-y divide-gray-100 flex-grow overflow-y-auto min-h-[300px]">
              {order.items?.map((item) => (
                <div key={item.id} className="p-6 flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">{item.productName}</h4>
                    
                    {/* Attributes (Variant details like Size, Color) */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.sku && (
                         <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                           SKU: {item.sku}
                         </span>
                      )}
                      {item.attributes && Object.entries(item.attributes).map(([key, value]) => (
                        <span key={key} className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 capitalize">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs font-medium text-gray-600 mt-2">
                      <span className="text-gray-400">Qty:</span> {item.quantity} 
                      <span className="mx-2 text-gray-300">|</span> 
                      <span className="text-gray-400">Price:</span> {formatCurrency(Number(item.sellingPrice))}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-4">
                    <p className="font-black text-gray-900">{formatCurrency(Number(item.totalPrice))}</p>
                    {item.mrp > item.sellingPrice && (
                       <p className="text-[10px] text-red-500 font-medium mt-1 line-through">{formatCurrency(Number(item.mrp * item.quantity))}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 space-y-3 border-t border-gray-100 mt-auto">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-red-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(order.discountAmount))}</span>
                </div>
              )}
              {Number(order.couponDiscount) > 0 && (
                <div className="flex justify-between text-sm text-red-600 font-medium">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-{formatCurrency(Number(order.couponDiscount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charges</span>
                <span>{formatCurrency(Number(order.deliveryCharges))}</span>
              </div>
              <div className="pt-3 flex justify-between font-black text-xl text-gray-900 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col space-y-6">
          {/* Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col flex-grow">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-500"/> Tracking Timeline</h3>
            <div className="flex-grow overflow-y-auto">
               <TrackingTimeline orderId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
