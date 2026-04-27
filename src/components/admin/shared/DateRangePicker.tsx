import { useState } from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

export interface DateRangeValue {
  startDate: string; // ISO
  endDate: string;   // ISO
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const range: DateRange = {
    from: value.startDate ? new Date(value.startDate) : undefined,
    to: value.endDate ? new Date(value.endDate) : undefined,
  };

  const setPreset = (start: Date, end: Date) => {
    onChange({ startDate: start.toISOString(), endDate: end.toISOString() });
    setOpen(false);
  };

  const today = new Date();
  const presets = [
    { label: "Today", run: () => setPreset(today, today) },
    {
      label: "Last 7 Days",
      run: () => setPreset(subDays(today, 7), today),
    },
    {
      label: "Last 30 Days",
      run: () => setPreset(subDays(today, 30), today),
    },
    {
      label: "Last Quarter",
      run: () => setPreset(subMonths(today, 3), today),
    },
    {
      label: "Last Year",
      run: () => setPreset(subYears(today, 1), today),
    },
  ];

  const label =
    range.from && range.to
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : "Select date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start gap-2">
          <CalendarIcon className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r border-slate-200 p-2">
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={p.run}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              if (r?.from && r?.to) {
                onChange({
                  startDate: r.from.toISOString(),
                  endDate: r.to.toISOString(),
                });
              }
            }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
