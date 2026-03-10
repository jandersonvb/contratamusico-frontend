import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface FAQAccordionItemData {
  id?: string | number;
  question: string;
  answer: string;
  category?: string | null;
}

interface FAQAccordionListProps {
  items: FAQAccordionItemData[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
}

function renderAccordionItems(items: FAQAccordionItemData[]) {
  return items.map((faq, index) => (
    <AccordionItem
      key={faq.id ?? index}
      value={`faq-${faq.id ?? index}`}
      className="overflow-hidden rounded-2xl border border-border/70 bg-background/85 shadow-sm transition-all duration-200 data-[state=open]:border-primary/30 data-[state=open]:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)]"
    >
      <AccordionTrigger className="gap-3 px-4 py-4 text-left no-underline hover:no-underline sm:px-5 sm:py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-semibold text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="space-y-1">
            {faq.category ? (
              <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {faq.category}
              </span>
            ) : null}
            <span className="block text-sm font-semibold leading-6 text-foreground sm:text-base">
              {faq.question}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-5 sm:px-5 sm:pb-6">
        <div className="pl-11 text-sm leading-7 text-muted-foreground sm:text-[15px]">
          {faq.answer}
        </div>
      </AccordionContent>
    </AccordionItem>
  ));
}

export function FAQAccordionList({
  items,
  type = "single",
  collapsible = true,
  className,
}: FAQAccordionListProps) {
  if (type === "multiple") {
    return (
      <Accordion type="multiple" className={cn("space-y-3", className)}>
        {renderAccordionItems(items)}
      </Accordion>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible={collapsible}
      className={cn("space-y-3", className)}
    >
      {renderAccordionItems(items)}
    </Accordion>
  );
}
