import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarStore } from "@/lib/admin/sidebar-store";
import { useAdminProfile } from "@/lib/admin/hooks/useAdminAuth";

const ALLOWED_ROLES = ["admin", "super_admin"] as const;

export function AdminShell() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const router = useRouterState();
  const navigate = useNavigate();

  const isLoginPage = router.location.pathname === "/admin/login";

  // Skip auth check on the login page itself.
  const { data: profileResponse, isError, isPending } = useAdminProfile(!isLoginPage);

  // Derive the role from the nested API response shape: { data: { role } }
  const role = (profileResponse as any)?.data?.role ?? profileResponse?.role;
  const isAuthorized = role && ALLOWED_ROLES.includes(role as any);

  useEffect(() => {
    if (isLoginPage) return;
    // Only redirect once the query has definitively settled (not during initial load or retry)
    if (!isPending && (isError || !isAuthorized)) {
      navigate({ to: "/admin/login" });
    }
  }, [isLoginPage, isPending, isError, isAuthorized, navigate]);

  // Render login page without the admin shell chrome
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  // Show a full-screen loader while the profile is being fetched / token is being refreshed
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="text-sm text-slate-500">Verifying session…</p>
        </div>
      </div>
    );
  }

  // If auth failed, return null — the useEffect above handles the redirect
  if (isError || !isAuthorized) return null;

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

