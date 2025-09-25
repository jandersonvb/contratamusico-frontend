import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site, stats } from "@/app/lib/data/home";
import { Card } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative isolate  w-full ">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          {site.tagline}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg opacity-90">
          {site.description}
        </p>

        <div className="mb-12 flex items-center justify-center gap-3">
          <Button asChild size="lg" variant="default">
            <Link href="/buscar">Buscar Músicos</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/cadastro">Sou Músico</Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="flex flex-col items-center justify-center gap-2 border-0  p-6 text-center transition hover:shadow-lg"
            >
              <span className="text-6xl">
                <s.icon />
              </span>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm ">{s.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
