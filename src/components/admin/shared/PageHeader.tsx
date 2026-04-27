import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: part.replace(/-/g, " "),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const { pathname } = useLocation();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-2 flex items-center text-xs text-slate-500"
          >
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center capitalize">
                {i > 0 && <ChevronRight className="mx-1 h-3 w-3" />}
                {i === crumbs.length - 1 ? (
                  <span className="text-slate-700">{c.label}</span>
                ) : (
                  <Link to={c.href} className="hover:text-slate-700">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
