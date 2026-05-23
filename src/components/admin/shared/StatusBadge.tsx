import { Badge } from "@/components/ui/badge";

type StatusType = "order" | "user" | "ticket" | "quote" | "invoice" | "priority";

const COLOR_MAP: Record<string, string> = {
  // order
  "order:pending": "bg-yellow-100 text-yellow-800",
  "order:confirmed": "bg-blue-100 text-blue-800",
  "order:shipped": "bg-purple-100 text-purple-800",
  "order:delivered": "bg-green-100 text-green-800",
  "order:cancelled": "bg-red-100 text-red-800",
  "order:return_requested": "bg-orange-100 text-orange-800",
  "order:returned": "bg-gray-100 text-gray-800",
  // user
  "user:active": "bg-green-100 text-green-800",
  "user:suspended": "bg-red-100 text-red-800",
  "user:pending": "bg-orange-100 text-orange-800",
  "user:user": "bg-gray-100 text-gray-800",
  "user:company": "bg-blue-100 text-blue-800",
  "user:admin": "bg-purple-100 text-purple-800",
  // ticket
  "ticket:open": "bg-blue-100 text-blue-800",
  "ticket:in_progress": "bg-yellow-100 text-yellow-800",
  "ticket:resolved": "bg-green-100 text-green-800",
  "ticket:closed": "bg-gray-100 text-gray-800",
  // priority
  "priority:high": "bg-red-100 text-red-800",
  "priority:medium": "bg-orange-100 text-orange-800",
  "priority:low": "bg-gray-100 text-gray-800",
  // invoice
  "invoice:paid": "bg-green-100 text-green-800",
  "invoice:unpaid": "bg-yellow-100 text-yellow-800",
  "invoice:overdue": "bg-red-100 text-red-800",
  // quote
  "quote:pending": "bg-yellow-100 text-yellow-800",
  "quote:approved": "bg-green-100 text-green-800",
  "quote:rejected": "bg-red-100 text-red-800",
  "quote:converted": "bg-blue-100 text-blue-800",
};

function humanize(s?: string) {
  if (!s) return "Unknown";
  return String(s)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const cls =
    COLOR_MAP[`${type}:${status}`] ?? "bg-slate-100 text-slate-700";
  return (
    <Badge variant="secondary" className={`${cls} border-transparent`}>
      {humanize(status)}
    </Badge>
  );
}
