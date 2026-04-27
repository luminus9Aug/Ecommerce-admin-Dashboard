import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  badgeColor?: "red" | "orange" | "blue" | "yellow";
  collapsed?: boolean;
}

const BADGE_COLORS: Record<NonNullable<NavItemProps["badgeColor"]>, string> = {
  red: "bg-red-500 text-white",
  orange: "bg-orange-500 text-white",
  blue: "bg-blue-500 text-white",
  yellow: "bg-yellow-500 text-slate-900",
};

export function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  badgeColor = "red",
  collapsed,
}: NavItemProps) {
  const { pathname } = useLocation();
  // Active for exact match OR for child paths (but never let "/admin" match everything)
  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      to={href}
      title={collapsed ? label : undefined}
      className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-slate-700 text-white"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${BADGE_COLORS[badgeColor]}`}
        >
          {badge}
        </span>
      )}
      {collapsed && badge !== undefined && badge > 0 && (
        <span
          className={`absolute right-2 h-2 w-2 rounded-full ${BADGE_COLORS[badgeColor]}`}
        />
      )}
    </Link>
  );
}
