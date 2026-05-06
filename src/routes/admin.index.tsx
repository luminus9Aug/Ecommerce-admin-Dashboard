import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupeeIcon,
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatCard } from "@/components/admin/shared/StatCard";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useDashboardData,
} from "@/lib/admin/hooks/useDashboardStats";
import { useNotificationBadges } from "@/lib/admin/hooks/useNotificationBadges";
import { formatCurrency } from "@/lib/admin/api-client";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

/** Returns YYYY-MM-DD in the **local** timezone — avoids UTC midnight offset cutting off today's data. */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function DashboardPage() {
  // Recompute dates every minute so the chart never goes stale after midnight
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { startDate, endDate } = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    // First day of current month
    const start = new Date(year, month, 1);
    // Last day of current month (day 0 of next month = last day of this month)
    const end = new Date(year, month + 1, 0);
    return {
      startDate: toLocalDateStr(start),
      endDate: toLocalDateStr(end),
    };
  }, [now]);

  const dashboardQuery = useDashboardData(startDate, endDate);
  const badges = useNotificationBadges();

  const d = dashboardQuery.data;
  const o = d?.overview;

  const revenueData = useMemo(() => {
    if (!d?.revenue?.dailyRevenue) return [];
    return Object.entries(d.revenue.dailyRevenue).map(([date, stats]) => ({
      date,
      ...(stats as any)
    }));
  }, [d?.revenue?.dailyRevenue]);

  console.log(' O =>>', o?.totalRevenue, '=revenueData=>', revenueData);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your store" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={o?.totalRevenue?.toLocaleString() ?? ""}
          subtext={
            !o ? '' : o.revenueThisMonth === 0
              ? 'No revenue this month'
              : `${o.revenueChange > 0 ? '+' : ''}${o.revenueChange.toFixed(2)}% vs last month`
          }
          trend={o?.revenueChange}
          icon={IndianRupeeIcon}
          iconBgClass="bg-green-100 text-green-700"
          loading={dashboardQuery.isLoading}
        />
        <StatCard
          title="Total Orders"
          value={o?.totalOrders?.toLocaleString() ?? ""}
          subtext={
            !o ? '' : o.ordersThisMonth === 0
              ? 'No orders this month'
              : `${o.ordersChange > 0 ? '+' : ''}${o.ordersChange.toFixed(2)}% vs last month`
          }
          trend={o?.ordersChange}
          icon={ShoppingCart}
          iconBgClass="bg-blue-100 text-blue-700"
          loading={dashboardQuery.isLoading}
        />
        <StatCard
          title="Total Users"
          value={o?.totalUsers?.toLocaleString() ?? "—"}
          subtext={o && o.newUsersThisMonth > 0 ? `+${o.newUsersThisMonth} this month` : 'No new users this month'}
          icon={Users}
          iconBgClass="bg-purple-100 text-purple-700"
          loading={dashboardQuery.isLoading}
        />
        <Link to="/admin/b2b/companies" className="block">
          <StatCard
            title="Pending Company Approvals"
            value={o?.pendingB2BApprovals ?? "—"}
            subtext="Require your review"
            icon={Clock}
            iconBgClass="bg-orange-100 text-orange-700"
            loading={dashboardQuery.isLoading}
          />
        </Link>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Revenue Overview</h2>
          <Badge variant="secondary">{format(now, 'MMMM yyyy')}</Badge>
        </div>
        <div className="h-[350px]">
          {dashboardQuery.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eb2525ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#28eb25ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => format(new Date(v), "MMM dd")}
                  fontSize={8}
                />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip
                  formatter={(v: number, name) =>
                    name === "revenue" ? formatCurrency(v) : v
                  }
                  labelFormatter={(v) => format(new Date(v), "MMM dd, yyyy")}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  fill="url(#rev)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Top Products</h2>
          {dashboardQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">#</th>
                  <th>Product</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(d?.topProducts ?? []).slice(0, 5).map((p, i) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-500">{i + 1}</td>
                    <td>
                      <Link
                        to="/admin/products/$id/edit"
                        params={{ id: p.id }}
                        className="flex items-center gap-2 hover:text-blue-600"
                      >
                        {p.imageUrl && (
                          <img src={p.imageUrl} className="h-8 w-8 rounded object-cover" alt="" />
                        )}
                        <span className="font-medium">{p.name}</span>
                      </Link>
                    </td>
                    <td className="text-right">{p.unitsSold}</td>
                    <td className="text-right font-medium">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
                {(d?.topProducts ?? []).length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">No data</td></tr>
                )}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Top Customers</h2>
          {dashboardQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <ul className="space-y-3">
              {(d?.topCustomers ?? []).slice(0, 5).map((c, i) => (
                <li key={c.id}>
                  <Link
                    to="/admin/users/$id"
                    params={{ id: c.id }}
                    className="flex items-center gap-3 rounded p-2 hover:bg-slate-50"
                  >
                    <span className="w-4 text-xs text-slate-400">{i + 1}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                      {c.firstName?.[0]}{c.lastName?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{c.totalOrders} orders</p>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(c.totalSpend)}</span>
                  </Link>
                </li>
              ))}
              {(d?.topCustomers ?? []).length === 0 && (
                <li className="py-4 text-center text-sm text-slate-400">No data</li>
              )}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recent Orders</h2>
            <Link to="/admin/orders" search={{ dateRange: "this_month" } as any} className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {dashboardQuery.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Customer</th>
                  <th className="text-right">Amount</th>
                  <th className="py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(d?.recentOrders?.data ?? []).map((o) => (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="py-3">
                      <Link
                        to="/admin/orders/$id"
                        params={{ id: o.id }}
                        className="text-blue-600 hover:underline"
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="text-slate-700">
                      {o.user ? `${o.user.firstName} ${o.user.lastName}` : "—"}
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="text-center"><StatusBadge status={o.orderStatus} type="order" /></td>
                  </tr>
                ))}
                {(d?.recentOrders?.data ?? []).length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">No orders</td></tr>
                )}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Requires Attention</h2>
          <div className="space-y-2">
            <ActionRow href="/admin/b2b/companies" label="B2B Approvals pending" count={badges.data?.pendingB2BApprovals ?? 0} color="bg-red-100 text-red-700" />
            <ActionRow href="/admin/b2b/quotes" label="Quote requests pending" count={badges.data?.pendingQuotes ?? 0} color="bg-orange-100 text-orange-700" />
            <ActionRow href="/admin/support" label="Open support tickets" count={badges.data?.openTickets ?? 0} color="bg-blue-100 text-blue-700" />
            <ActionRow href="/admin/b2b/credit-terms" label="Credit term applications" count={badges.data?.pendingCreditTerms ?? 0} color="bg-yellow-100 text-yellow-700" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ActionRow({ href, label, count, color }: { href: string; label: string; count: number; color: string }) {
  return (
    <Link to={href} className="flex items-center justify-between rounded p-3 hover:bg-slate-50">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{count}</span>
        <span className="text-xs text-blue-600">Review →</span>
      </div>
    </Link>
  );
}
