"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DateFilterCalendarProps {
  value: string;
  onChange: (date: string) => void;
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromIso(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DateFilterCalendar({ value, onChange }: DateFilterCalendarProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => (value ? fromIso(value) : null), [value]);
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const list: Array<{ date: Date; inMonth: boolean }> = [];

    for (let i = firstWeekDay - 1; i >= 0; i -= 1) {
      list.push({
        date: new Date(year, month, -i),
        inMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      list.push({
        date: new Date(year, month, day),
        inMonth: true,
      });
    }

    while (list.length % 7 !== 0) {
      const last = list[list.length - 1].date;
      list.push({
        date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
        inMonth: false,
      });
    }

    return list;
  }, [viewDate]);

  const triggerLabel = selectedDate
    ? selectedDate.toLocaleDateString("pt-BR")
    : "Data do evento";

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-md border px-3 py-2 text-sm inline-flex items-center gap-2 justify-start hover:bg-muted/30"
      >
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        {triggerLabel}
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-[290px] rounded-xl border bg-background shadow-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-medium">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
              aria-label="Proximo mes"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEK_DAYS.map((weekday) => (
              <span
                key={weekday}
                className="text-[11px] text-muted-foreground text-center py-1"
              >
                {weekday}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(({ date, inMonth }) => {
              const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;
              const isToday = isSameDay(new Date(), date);

              return (
                <button
                  key={toIso(date)}
                  type="button"
                  onClick={() => {
                    onChange(toIso(date));
                    setOpen(false);
                  }}
                  className={`h-8 text-xs rounded-md transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "border border-primary/40"
                        : "hover:bg-muted/50"
                  } ${inMonth ? "" : "text-muted-foreground/40"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onChange(toIso(new Date()));
                setOpen(false);
              }}
            >
              Hoje
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Limpar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

