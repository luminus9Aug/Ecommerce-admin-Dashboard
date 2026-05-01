import { createFileRoute, Link } from "@tanstack/react-router";
import { useOrder, useUpdateOrderStatus } from "@/lib/admin/hooks/useOrders";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { ArrowLeft, Clock, MapPin, Package, User } from "lucide-react";

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useOrder(id);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus(id);

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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <PageHeader 
          title={`Order ${order.orderNumber}`} 
          description={`Placed on ${new Date(order.createdAt).toLocaleString()}`} 
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Status:</span>
          <select
            value={order.orderStatus}
            onChange={(e) => updateStatus(e.target.value as any)}
            disabled={isPending}
            className={`py-1.5 px-3 rounded-lg text-sm font-medium border-2 focus:outline-none capitalize cursor-pointer transition-colors
              ${order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? 'border-green-200 bg-green-50 text-green-800 focus:border-green-400' :
                order.orderStatus === 'cancelled' || order.orderStatus === 'returned' ? 'border-red-200 bg-red-50 text-red-800 focus:border-red-400' :
                order.orderStatus === 'shipped' ? 'border-blue-200 bg-blue-50 text-blue-800 focus:border-blue-400' :
                'border-yellow-200 bg-yellow-50 text-yellow-800 focus:border-yellow-400'}`}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × {formatCurrency(Number(item.sellingPrice))}</p>
                  </div>
                  <div className="text-right font-medium">
                    {formatCurrency(Number(item.totalPrice))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 space-y-3 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Charges</span>
                <span>{formatCurrency(Number(order.deliveryCharges))}</span>
              </div>
              <div className="pt-3 flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            {order.user ? (
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                <p className="text-sm text-gray-500">{order.user.email}</p>
                {order.user.phoneNumber && <p className="text-sm text-gray-500">{order.user.phoneNumber}</p>}
              </div>
            ) : (
              <p className="text-gray-500 italic">Guest Checkout</p>
            )}
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Shipping Details</h3>
            </div>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-gray-500 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Method: {order.shippingAddress.shippingMethod || 'Standard'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No shipping details provided</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
