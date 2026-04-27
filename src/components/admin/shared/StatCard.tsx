import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBgClass?: string;
  trend?: number;
  loading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgClass = "bg-blue-100 text-blue-700",
  trend,
  loading,
  onClick,
}: StatCardProps) {
  const trendIsUp = (trend ?? 0) >= 0;
  return (
    <Card
      className={`p-5 ${onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          )}
          {!loading && subtext && (
            <p
              className={`flex items-center gap-1 text-xs ${
                typeof trend === "number"
                  ? trendIsUp
                    ? "text-green-600"
                    : "text-red-600"
                  : "text-slate-500"
              }`}
            >
              {typeof trend === "number" &&
                (trendIsUp ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                ))}
              {subtext}
            </p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
