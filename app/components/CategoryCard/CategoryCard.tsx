import type { Category } from "@/app/lib/data/home";
import { Card, CardContent } from "@/components/ui/card";
import * as Icons from "lucide-react";

export function CategoryCard({ item }: { item: Category }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (Icons as any)[item.icon] ?? Icons.Music2;
  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="grid size-20 place-content-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground transition-transform duration-300 group-hover:scale-110">
          <LucideIcon className="mx-auto size-8" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.blurb}</p>
      </CardContent>
    </Card>
  );
}
