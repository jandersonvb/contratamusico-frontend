import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mock = [
  {
    id: "1",
    name: "Ana Ribeiro",
    category: "Cantora",
    city: "Itajubá, MG",
    price: "R$ 600+",
    badge: "Top Rated",
    photo:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Bruno Teclas",
    category: "Piano & Teclado",
    city: "Poços de Caldas, MG",
    price: "R$ 800+",
    badge: "Destaque",
    photo:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Trio Seresta",
    category: "Bandas",
    city: "São José dos Campos, SP",
    price: "R$ 1.200+",
    badge: "Novo",
    photo:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];

export function FeaturedMusicians() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-semibold">Destaques</h2>
          <p className="text-muted-foreground">
            Perfis mais procurados da semana
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mock.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={m.photo}
                  alt={m.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white">
                  {m.badge}
                </span>
              </div>
              <CardContent className="p-6">
                <h3 className="mb-1 text-lg font-semibold">{m.name}</h3>
                <div className="mb-2 text-sm text-primary">{m.category}</div>
                <div className="mb-2 text-sm text-muted-foreground">
                  {m.city}
                </div>
                <div className="mb-4 font-semibold">{m.price}</div>
                <Button variant="secondary" size="sm">
                  Ver perfil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
