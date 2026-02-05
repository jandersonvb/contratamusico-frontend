import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote:
      "Encontrei o músico perfeito para meu casamento. A contratação foi super fácil e o resultado superou as expectativas.",
    name: "João da Silva",
    role: "Cantor",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=128&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    quote:
      "Usei a plataforma para um evento corporativo e foi um sucesso. O suporte ao longo do processo foi excelente.",
    name: "Rebeca Oliveira",
    role: "Violonista",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    quote:
      "Como contratante frequente, adoro a curadoria de profissionais e a transparência nos perfis.",
    name: "Caio Oliveira",
    role: "Empresário",
    avatar:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=128&q=80&auto=format&fit=crop",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background py-16" aria-labelledby="testimonials-title">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 id="testimonials-title" className="mb-2 text-3xl font-semibold">
            O que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground">
            Experiências reais de quem já contratou
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card 
              key={t.id} 
              className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="flex h-full flex-col gap-4 p-6 relative">
                <Quote 
                  className="absolute top-4 right-4 h-8 w-8 text-primary/10" 
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <Image
                      src={t.avatar}
                      alt={`Foto de ${t.name}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
                <blockquote className="text-sm text-muted-foreground italic flex-1">
                  "{t.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
