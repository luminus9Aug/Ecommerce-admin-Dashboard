import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import adminApiClient from "@/lib/admin/api-client";

// Layout route for /admin/* — guards auth then renders the shell with <Outlet />.
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    try {
      const { data } = await adminApiClient.get<{ role?: string }>("/users/profile");
      if (!["admin", "super_admin"].includes(data?.role ?? "")) {
        throw redirect({ to: "/admin/login" });
      }
    } catch (err) {
      // Re-throw redirects, swallow auth errors -> redirect.
      if (err && typeof err === "object" && "to" in err) throw err;
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminShell,
});
