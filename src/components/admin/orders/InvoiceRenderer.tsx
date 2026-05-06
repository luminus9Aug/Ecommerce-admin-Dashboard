import React from 'react';
import { AdminInvoice, Order } from '@/types/admin';
import { format } from 'date-fns';

interface InvoiceRendererProps {
  invoice: AdminInvoice;
  order: Order;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatSafeDate = (date: any, formatStr: string) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : format(d, formatStr);
};

export function InvoiceRenderer({ invoice, order }: InvoiceRendererProps) {
  const config = invoice.invoiceConfig;
  if (!config) return <div className="p-8 text-red-500">Invoice configuration missing.</div>;

  const taxData = invoice.taxBreakdown || {
    taxableAmount: 0,
    taxType: 'cgst_sgst',
    cgstRate: 0,
    cgstAmount: 0,
    sgstRate: 0,
    sgstAmount: 0,
    igstRate: 0,
    igstAmount: 0,
    grandTotal: 0
  };

  return (
    <div className="p-8 bg-white min-h-[1100px] text-gray-800" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-8">
        <div className="space-y-4">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.businessName} className="h-16 object-contain" />
          ) : (
            <h1 className="text-3xl font-black text-black tracking-tighter uppercase">{config.businessName}</h1>
          )}
          <div className="text-sm space-y-1">
            <p className="font-bold">{config.businessName}</p>
            <p className="text-gray-600">{config.addressLine1}</p>
            {config.addressLine2 && <p className="text-gray-600">{config.addressLine2}</p>}
            <p className="text-gray-600">{config.city}, {config.state} - {config.pincode}</p>
            <p className="text-gray-600">GSTIN: <span className="font-bold text-black">{config.gstin || 'N/A'}</span></p>
            <p className="text-gray-600">Email: {config.email} | Phone: {config.phone}</p>
          </div>
        </div>
        <div className="text-right space-y-4">
          <h2 className="text-4xl font-black text-gray-100 tracking-widest uppercase">Tax Invoice</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500 font-medium">Invoice No:</span> <span className="font-bold">{invoice.invoiceNumber}</span></p>
            <p><span className="text-gray-500 font-medium">Invoice Date:</span> <span className="font-bold">{formatSafeDate(invoice.createdAt, 'dd-MMM-yyyy')}</span></p>
            <p><span className="text-gray-500 font-medium">Order No:</span> <span className="font-bold">{order.orderNumber}</span></p>
            <p><span className="text-gray-500 font-medium">Due Date:</span> <span className="font-bold">{formatSafeDate(invoice.dueDate, 'dd-MMM-yyyy')}</span></p>
          </div>
        </div>
      </div>

      {/* Bill To & Ship To */}
      <div className="grid grid-cols-2 gap-12 py-8">
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Bill To</h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-lg">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>}
            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-gray-600">Phone: {order.shippingAddress.phoneNumber}</p>
            {order.user?.email && <p className="text-gray-600">Email: {order.user.email}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Ship To</h3>
          <div className="text-sm space-y-1">
            <p className="font-bold text-lg">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mt-4">
        <thead>
          <tr className="bg-gray-900 text-white uppercase text-[10px] tracking-widest">
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3 text-center">Qty</th>
            <th className="px-4 py-3 text-right">Unit Price</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100 border-b border-gray-900">
          {order.items.map((item, index) => (
            <tr key={item.id}>
              <td className="px-4 py-4 text-gray-400">{index + 1}</td>
              <td className="px-4 py-4">
                <p className="font-bold text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
              </td>
              <td className="px-4 py-4 text-center">{item.quantity}</td>
              <td className="px-4 py-4 text-right">{formatCurrency(item.sellingPrice)}</td>
              <td className="px-4 py-4 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end py-8">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Taxable Amount</span>
            <span className="font-medium">{formatCurrency(taxData.taxableAmount)}</span>
          </div>

          {taxData.taxType === 'cgst_sgst' ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CGST ({taxData.cgstRate}%)</span>
                <span className="font-medium">{formatCurrency(taxData.cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-50 pb-3">
                <span className="text-gray-500">SGST ({taxData.sgstRate}%)</span>
                <span className="font-medium">{formatCurrency(taxData.sgstAmount)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm border-b border-gray-50 pb-3">
              <span className="text-gray-500">IGST ({taxData.igstRate}%)</span>
              <span className="font-medium">{formatCurrency(taxData.igstAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3">
            <span className="text-base font-black uppercase tracking-tight">Grand Total</span>
            <span className="text-2xl font-black text-black">{formatCurrency(invoice.amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details & Notes */}
      <div className="grid grid-cols-2 gap-12 py-8 mt-auto">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Bank Details</h4>
            <div className="text-xs space-y-1">
              <p><span className="text-gray-500">Bank Name:</span> {config.bankName || 'N/A'}</p>
              <p><span className="text-gray-500">A/c No:</span> {config.accountNumber || 'N/A'}</p>
              <p><span className="text-gray-500">IFSC Code:</span> {config.ifscCode || 'N/A'}</p>
            </div>
          </div>
          {invoice.notes && (
            <div className="p-4 rounded-lg border border-dashed border-gray-200 bg-white">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Invoice Notes</h4>
              <p className="text-xs text-gray-600 italic">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-end space-y-4">
          <div className="relative w-48 h-32 flex flex-col items-center justify-center border border-gray-100 rounded bg-gray-50/30">
            {config.stampUrl && (
              <img src={config.stampUrl} className="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none" alt="Stamp" />
            )}
            {config.signatureUrl && (
              <img src={config.signatureUrl} className="h-16 object-contain z-10" alt="Signature" />
            )}
            <div className="mt-4 border-t border-gray-900 w-32 pt-1 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] text-gray-300 uppercase tracking-[0.2em] border-t border-gray-50 pt-8">
        This is a computer generated invoice and does not require a physical signature.
      </div>
    </div>
  );
}
