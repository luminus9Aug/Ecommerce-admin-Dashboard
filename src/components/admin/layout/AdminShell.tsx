import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarStore } from "@/lib/admin/sidebar-store";

export function AdminShell() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <div
        className={`flex min-h-screen flex-col transition-all duration-200 ${
          collapsed ? "md:pl-16" : "md:pl-60"
        }`}
      >
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
