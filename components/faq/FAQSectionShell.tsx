import { MessageCircleQuestion } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FAQSectionShellProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  noteTitle?: string;
  noteDescription?: string;
}

export function FAQSectionShell({
  title,
  description,
  children,
  className,
  eyebrow = "Perguntas Frequentes",
  noteTitle = "Respostas diretas",
  noteDescription = "Sem letra miúda: dúvidas comuns sobre busca, contratação e funcionamento da plataforma.",
}: FAQSectionShellProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-border/60 bg-background px-5 py-6 shadow-[0_26px_60px_-42px_rgba(15,23,42,0.45)] sm:px-8 sm:py-8 lg:px-10 lg:py-10",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,102,79,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_32%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">
        <div className="space-y-5">
          <div className="space-y-3">
            <span className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </span>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircleQuestion className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{noteTitle}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {noteDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
