import { Download } from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  columns: { key: keyof T | string; label: string }[];
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  columns,
}: ExportButtonProps<T>) {
  const handleClick = () => {
    const rows = data.map((row) => {
      const out: Record<string, unknown> = {};
      columns.forEach((c) => {
        out[c.label] = row[c.key as keyof T] ?? "";
      });
      return out;
    });
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={handleClick} className="gap-2">
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  );
}
