import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Tag,
  ShoppingCart,
  CreditCard,
  Users,
  Building2,
  FileText,
  Banknote,
  Receipt,
  Image,
  BookOpen,
  HelpCircle,
  Palette,
  Ticket,
  Mail,
  MessageSquare,
  Settings,
  Layout,
  LogOut,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { useSidebarStore } from "@/lib/admin/sidebar-store";
import { useNotificationBadges } from "@/lib/admin/hooks/useNotificationBadges";
import { useProducts } from "@/lib/admin/hooks/useProducts";
import { useAdminProfile, useLogout } from "@/lib/admin/hooks/useAdminAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";

function Group({
  label,
  children,
  collapsed,
}: {
  label: string;
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
      )}
      {collapsed && <div className="my-2 border-t border-slate-800" />}
      {children}
    </div>
  );
}

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const { data: badges } = useNotificationBadges();
  // Low-stock count for the Products badge (per spec).
  const { data: lowStock } = useProducts({ page: 1, limit: 1 });
  const lowStockCount = lowStock?.data?.filter?.((p) => p.stockQuantity < 10)
    ?.length;
  const { data: profile } = useAdminProfile();
  const logout = useLogout();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-200 ${collapsed ? "w-16" : "w-60"
        } hidden md:flex`}
    >
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-slate-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold">
          {env.VITE_COMPANY_NAME.substring(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="ml-2 truncate text-sm font-semibold">
            {env.VITE_COMPANY_NAME}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        <NavItem
          href="/admin"
          icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
        />
        {/* <NavItem
            href="/admin/analytics"
            icon={TrendingUp}
            label="Analytics"
            collapsed={collapsed}
          /> */}
        <NavItem
          href="/admin/products"
          icon={Package}
          label="Products"
          badge={lowStockCount}
          badgeColor="orange"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/categories"
          icon={Tag}
          label="Categories"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/orders"
          icon={ShoppingCart}
          label="Orders"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/payments"
          icon={CreditCard}
          label="Payments"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/users"
          icon={Users}
          label="All Users"
          badge={badges?.pendingB2BApprovals}
          badgeColor="red"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/b2b/companies"
          icon={Building2}
          label="Company Requests"
          collapsed={collapsed}
        />

        {/* <NavItem
          href="/admin/b2b/quotes"
          icon={FileText}
          label="Quotes"
          badge={badges?.pendingQuotes}
          badgeColor="red"
          collapsed={collapsed}
        /> */}
        {/* <NavItem
            href="/admin/b2b/credit-terms"
            icon={Banknote}
            label="Credit Terms"
            collapsed={collapsed}
          /> */}
        <NavItem
          href="/admin/b2b/invoices"
          icon={Receipt}
          label="Invoices"
          collapsed={collapsed}
        />

        {/* <NavItem
          href="/admin/content/banners"
          icon={Image}
          label="Banners"
          collapsed={collapsed}
        /> */}
        <NavItem
          href="/admin/content/blog"
          icon={BookOpen}
          label="Blog"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/content/faq"
          icon={HelpCircle}
          label="FAQ"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/ad-slots"
          icon={Layout}
          label="Ad Slots"
          collapsed={collapsed}
        />

        <NavItem
          href="/admin/marketing/coupons"
          icon={Ticket}
          label="Coupons"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/marketing/newsletter"
          icon={Mail}
          label="Newsletter"
          collapsed={collapsed}
        />
        <NavItem
          href="/admin/support"
          icon={MessageSquare}
          label="Tickets"
          badge={badges?.openTickets}
          badgeColor="red"
          collapsed={collapsed}
        />

        <NavItem
          href="/admin/settings"
          icon={Settings}
          label="Settings"
          collapsed={collapsed}
        />

      </nav>

      {/* Footer: profile */}
      {/* <div className="border-t border-slate-800 p-3">
        {collapsed ? (
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center justify-center rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-700 text-xs text-white">
                  {profile?.firstName?.[0] ?? "A"}
                  {profile?.lastName?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : "Admin User"}
                </p>
                <p className="truncate text-[10px] text-slate-400">
                  {profile?.email ?? ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile?.role && (
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-[10px] text-slate-200"
                >
                  {profile.role}
                </Badge>
              )}
              <button
                onClick={() => logout.mutate()}
                className="ml-auto flex items-center gap-1 rounded px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="h-3 w-3" /> Logout
              </button>
            </div>
          </div>
        )}
      </div> */}
    </aside>
  );
}
