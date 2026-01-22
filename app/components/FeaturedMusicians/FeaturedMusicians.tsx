"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchFeaturedMusicians } from "@/api/musician";
import type { MusicianListItem } from "@/lib/types/musician";
import { Loader2, Star } from "lucide-react";

export function FeaturedMusicians() {
  const [musicians, setMusicians] = useState<MusicianListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedMusicians();
  }, []);

  const loadFeaturedMusicians = async () => {
    try {
      const data = await fetchFeaturedMusicians(6);
      setMusicians(data);
    } catch (error) {
      console.error("Error loading featured musicians:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-semibold">Destaques</h2>
            <p className="text-muted-foreground">
              Perfis mais procurados da semana
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (musicians.length === 0) {
    return null;
  }

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
          {musicians.map((musician) => (
            <Card
              key={musician.id}
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-56 w-full bg-muted">
                <Image
                  src={`https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
                  alt={musician.name}
                  fill
                  className="object-cover"
                />
                {musician.isFeatured && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white">
                    Destaque
                  </span>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold">{musician.name}</h3>
                {musician.category && (
                  <div className="mb-2 text-sm text-primary">{musician.category}</div>
                )}
                <div className="mb-2 text-sm text-muted-foreground">
                  {musician.location}
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {musician.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({musician.ratingCount})
                  </span>
                </div>
                {musician.priceFrom && (
                  <div className="mb-4 font-semibold">
                    A partir de R$ {musician.priceFrom}
                  </div>
                )}
                <Link href={`/musico/${musician.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Ver perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
