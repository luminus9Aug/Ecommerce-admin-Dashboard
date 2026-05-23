import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useUser, useSuspendUser, useActivateUser } from "@/lib/admin/hooks/useUsers";
import { useOrders } from "@/lib/admin/hooks/useOrders";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { type UserAddress } from "@/types/admin";
import {
  ChevronLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Home,
  MapPin,
  Eye,
  Package,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Building2,
  FileText,
  UserMinus,
  UserCheck
} from "lucide-react";

export const Route = createFileRoute("/admin/users/$id")({
  component: UserDetailPage,
});

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatSafeDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function UserDetailPage() {
  const { id } = Route.useParams();

  const { data: user, isLoading: loadingUser } = useUser(id);
  const { data: ordersData, isLoading: loadingOrders } = useOrders({ userId: id, limit: 50 });

  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  const isSuspending = suspendUser.isPending;
  const isActivating = activateUser.isPending;

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
        <p className="text-xs font-semibold text-gray-500 animate-pulse">Syncing user profile data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border border-dashed rounded-xl bg-gray-50 max-w-lg mx-auto">
        <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-base font-bold text-gray-900">User Profile Not Found</h3>
        <p className="text-sm text-gray-500 mt-1">The requested user profile ID does not exist or may have been permanently deleted.</p>
        <Link to="/admin/users" className="mt-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Users list
          </Button>
        </Link>
      </div>
    );
  }

  const savedAddresses = user.addresses || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back navigation & Header */}
      <div className="space-y-4">
        <Link to="/admin/users" className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-black transition-colors">
          <ChevronLeft className="w-4 h-4 mr-0.5" /> Back to Users
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-lg font-black shrink-0 border border-slate-200">
              {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight capitalize">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'company' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                  {user.role.replace('_', ' ')}
                </span>

                <StatusBadge
                  status={user.isActive ? "active" : "inactive"}
                  type="user"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.isActive ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={isSuspending || isActivating}
                onClick={() => suspendUser.mutate(user.id)}
                className="text-xs font-semibold h-9 px-4 shrink-0 shadow-xs"
              >
                {isSuspending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <UserMinus className="w-4 h-4 mr-1.5" />
                )}
                Suspend User Access
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled={isSuspending || isActivating}
                onClick={() => activateUser.mutate(user.id)}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold h-9 px-4 shrink-0 shadow-xs border-none"
              >
                {isActivating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-1.5" />
                )}
                Activate User Access
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Profile & Orders */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-6">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" /> Account Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">First Name</span>
                <p className="font-semibold text-gray-900 capitalize">{user.firstName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Last Name</span>
                <p className="font-semibold text-gray-900 capitalize">{user.lastName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </span>
                <p className="font-semibold text-gray-900 break-all">{user.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </span>
                <p className="font-semibold text-gray-900">{user.phone || 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Date Joined
                </span>
                <p className="font-semibold text-gray-900">{formatSafeDate(user.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Verification Status</span>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-50" />
                      <span className="text-green-700 text-xs">Email Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-700 text-xs">Pending Verification</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* B2B Company Details (Conditional) */}
            {user.role === 'company' && (user.companyName || user.gstNumber) && (
              <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" /> Corporate Verification Details (B2B)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider block">Registered Company Name</span>
                    <p className="font-bold text-gray-900 capitalize">{user.companyName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider block">GSTIN / GST Number</span>
                    <p className="font-mono font-bold text-gray-900 uppercase tracking-wider">{user.gstNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Timeline Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-6">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> User Transaction History
            </h3>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-12 gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                Syncing order history...
              </div>
            ) : !ordersData || ordersData.data?.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
                <Package className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">No Orders Placed Yet</p>
                <p className="text-xs text-gray-400 max-w-xs mt-0.5">This customer account has not placed any handcrafted creation orders on the store platform yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-xs">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Order Status</th>
                      <th className="px-5 py-3.5">Payment</th>
                      <th className="px-5 py-3.5 text-right">Total Amount</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {ordersData.data.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-gray-900">{order.orderNumber}</td>
                        <td className="px-5 py-3.5 text-gray-500">{formatSafeDate(order.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                            order.orderStatus === 'cancelled' || order.orderStatus === 'returned' ? 'bg-red-50 text-red-700 border border-red-100' :
                              order.orderStatus === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                order.orderStatus === 'initiated' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  'bg-yellow-50 text-yellow-700 border border-yellow-100'
                            }`}>
                            {order.orderStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                            order.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                              order.paymentStatus === 'refunded' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                'bg-yellow-50 text-yellow-700 border border-yellow-100'
                            }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-gray-900">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to="/admin/orders/$id"
                            params={{ id: order.id }}
                            className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Stored Addresses List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 space-y-5">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Stored Address Book
            </h3>

            {savedAddresses.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center min-h-[140px]">
                <MapPin className="w-6 h-6 text-gray-300 mb-1.5" />
                <p className="text-xs font-bold text-gray-500">No Stored Addresses</p>
                <p className="text-[10px] text-gray-400 max-w-xs mt-0.5">This customer profile does not have any saved shipping addresses yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAddresses.map((addr: UserAddress) => {
                  const Icon = addr.addressType === 'home'
                    ? Home
                    : addr.addressType === 'work'
                      ? Briefcase
                      : MapPin;
                  return (
                    <div
                      key={addr.id}
                      className={`relative border rounded-xl p-4 flex flex-col justify-between shadow-xs transition-all duration-200 bg-card ${addr.isDefault
                        ? 'border-blue-200 ring-1 ring-blue-50 bg-blue-50/5'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3.5 right-3.5 text-[8px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                          Default
                        </span>
                      )}
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg shrink-0 h-fit ${addr.isDefault ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs space-y-1.5 min-w-0 pr-8">
                          <p className="font-bold text-gray-900 capitalize tracking-wide">{addr.addressType} Address</p>
                          <p className="font-semibold text-gray-800">{addr.fullName}</p>
                          <p className="text-gray-500 break-words leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <p className="text-gray-500">
                            {addr.city}, {addr.state} - <span className="font-mono font-semibold text-gray-700">{addr.pincode}</span>
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1 pt-1 border-t border-gray-50">Phone: {addr.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
