import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  MessageSquare,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSidebarStore } from "@/lib/admin/sidebar-store";
import { useAdminProfile, useLogout } from "@/lib/admin/hooks/useAdminAuth";
import { useNotificationBadges } from "@/lib/admin/hooks/useNotificationBadges";
import adminApiClient from "@/lib/admin/api-client";

interface SearchResult {
  id: string;
  type: "product" | "order" | "user";
  label: string;
  href: string;
}

export function TopBar() {
  const toggle = useSidebarStore((s) => s.toggle);
  const { data: profile } = useAdminProfile();
  const { data: badges } = useNotificationBadges();
  const logout = useLogout();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const [prods, orders, users] = await Promise.all([
          adminApiClient
            .get("/products", { params: { search: query, limit: 5 } })
            .then((r) => r.data?.data ?? [])
            .catch(() => []),
          adminApiClient
            .get("/orders/all", { params: { search: query, limit: 5 } })
            .then((r) => r.data?.data ?? [])
            .catch(() => []),
          adminApiClient
            .get("/users", { params: { search: query, limit: 5 } })
            .then((r) => r.data?.data ?? [])
            .catch(() => []),
        ]);
        const all: SearchResult[] = [
          ...prods.map((p: { id: string; name: string }) => ({
            id: p.id,
            type: "product" as const,
            label: p.name,
            href: `/admin/products/${p.id}/edit`,
          })),
          ...orders.map((o: { id: string; orderNumber: string }) => ({
            id: o.id,
            type: "order" as const,
            label: `Order ${o.orderNumber}`,
            href: `/admin/orders/${o.id}`,
          })),
          ...users.map(
            (u: { id: string; email: string; firstName: string; lastName: string }) => ({
              id: u.id,
              type: "user" as const,
              label: `${u.firstName} ${u.lastName} — ${u.email}`,
              href: `/admin/users/${u.id}`,
            }),
          ),
        ];
        setResults(all);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const totalBadges =
    (badges?.pendingB2BApprovals ?? 0) +
    (badges?.pendingQuotes ?? 0) +
    (badges?.openTickets ?? 0) +
    (badges?.pendingCreditTerms ?? 0);

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`
    : "A";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 sm:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search products, orders, users…</span>
        <kbd className="ml-4 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {totalBadges > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {totalBadges}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-2">
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-500">
                Notifications
              </p>
              <Link
                to="/admin/users"
                search={{ role: "b2b", isApproved: "false" }}
                className="flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-slate-50"
              >
                <span>{badges?.pendingB2BApprovals ?? 0} B2B approvals pending</span>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {badges?.pendingB2BApprovals ?? 0}
                </Badge>
              </Link>
              <Link
                to="/admin/b2b/quotes"
                search={{ status: "pending" }}
                className="flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-slate-50"
              >
                <span>{badges?.pendingQuotes ?? 0} quote requests pending</span>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700"
                >
                  {badges?.pendingQuotes ?? 0}
                </Badge>
              </Link>
              <Link
                to="/admin/support"
                search={{ status: "open" }}
                className="flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-slate-50"
              >
                <span>{badges?.openTickets ?? 0} support tickets open</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {badges?.openTickets ?? 0}
                </Badge>
              </Link>
              <Link
                to="/admin/b2b/credit-terms"
                className="flex items-center justify-between rounded px-2 py-2 text-sm hover:bg-slate-50"
              >
                <span>
                  {badges?.pendingCreditTerms ?? 0} credit term applications
                </span>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  {badges?.pendingCreditTerms ?? 0}
                </Badge>
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-slate-100">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-slate-700 text-xs text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden h-3 w-3 text-slate-400 md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex justify-between items-center gap-2">
                <p className="font-medium">
                  {profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : "Admin"}
                </p>
                <p className="text-xs font-normal text-slate-500">
                  {profile?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/support" })}>
              <MessageSquare className="mr-2 h-4 w-4" /> Support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/settings" })}>
              <KeyRound className="mr-2 h-4 w-4" /> Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout.mutate()}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Command palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search products, orders, users…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query ? "No results" : "Start typing to search…"}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={`${r.type}-${r.id}`}
                  value={`${r.type}-${r.label}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: r.href });
                  }}
                >
                  <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
                    {r.type}
                  </span>
                  {r.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
