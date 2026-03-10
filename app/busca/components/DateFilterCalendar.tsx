"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateFilterCalendarProps {
  value: string;
  onChange: (date: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function DateFilterCalendar({
  value,
  onChange,
  open,
  onOpenChange,
}: DateFilterCalendarProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const selectedDate = useMemo(() => (value ? fromIso(value) : null), [value]);
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());

  const setCalendarOpen = useCallback(
    (nextOpen: boolean | ((prev: boolean) => boolean)) => {
      const resolvedOpen =
        typeof nextOpen === "function" ? nextOpen(isOpen) : nextOpen;

      if (!isControlled) {
        setUncontrolledOpen(resolvedOpen);
      }

      onOpenChange?.(resolvedOpen);
    },
    [isControlled, isOpen, onOpenChange]
  );

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setCalendarOpen]);

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
        onClick={() => setCalendarOpen((prev) => !prev)}
        className={`w-full cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm inline-flex items-center gap-2 justify-start shadow-xs transition-[color,box-shadow,border-color,background-color] hover:border-primary/25 hover:bg-muted/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
          selectedDate ? "pr-10" : ""
        }`}
      >
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        {triggerLabel}
      </button>

      {selectedDate && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange("");
            setCalendarOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Limpar data selecionada"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-[290px] rounded-xl border bg-background shadow-lg p-3">
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
                    setCalendarOpen(false);
                  }}
                  className={`h-8 cursor-pointer text-xs rounded-md transition-[background-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ${
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : isToday
                        ? "border border-primary/40 hover:bg-primary/10 hover:text-foreground hover:shadow-sm"
                        : "hover:bg-primary/10 hover:text-foreground hover:shadow-sm"
                  } ${inMonth ? "" : "text-muted-foreground/40 hover:bg-muted/40"}`}
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
                setCalendarOpen(false);
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
                setCalendarOpen(false);
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
