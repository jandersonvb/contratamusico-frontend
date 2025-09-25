import Link from "next/link";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Category } from "@/app/lib/data/home";

export function CategoryCard({ item }: { item: Category }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (Icons as any)[item.icon] ?? Icons.Music2;
  return (
    <Card className="transition hover:shadow-lg">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="grid size-20 place-content-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
          <LucideIcon className="mx-auto size-8" />
        </div>
        <h3 className="text-xl font-semibold">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.blurb}</p>
        <Button asChild variant="ghost" size="sm">
          <Link href={item.href}>Ver {item.title.split(" ")[0]}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
