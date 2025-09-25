import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    quote:
      "Encontrei o músico perfeito para meu casamento. A contratação foi super fácil e o resultado superou as expectativas.",
    name: "Mariana Souza",
    role: "Noiva",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=128&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    quote:
      "Usei a plataforma para um evento corporativo e foi um sucesso. O suporte ao longo do processo foi excelente.",
    name: "Carlos Silva",
    role: "Gerente de eventos",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    quote:
      "Como contratante frequente, adoro a curadoria de profissionais e a transparência nos perfis.",
    name: "Fernanda Lima",
    role: "Produtora",
    avatar:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=128&q=80&auto=format&fit=crop",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-semibold">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground">
            Experiências reais de quem já contratou
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="h-full">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-full">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">“{t.quote}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
