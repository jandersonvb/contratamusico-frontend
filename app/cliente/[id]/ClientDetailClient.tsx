"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, MessageCircle, Star } from "lucide-react";
import type { PublicClientProfile } from "@/lib/types/user";

interface ClientDetailClientProps {
  client: PublicClientProfile;
}

function getAvatarUrl(name: string, size = 400): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&color=fff`;
}

export default function ClientDetailClient({ client }: ClientDetailClientProps) {
  const router = useRouter();
  const profileImageUrl = client.profileImageUrl || getAvatarUrl(client.name);
  const joinedAt = new Date(client.createdAt).toLocaleDateString("pt-BR");

  const handleMessage = () => {
    const params = new URLSearchParams({
      usuario: String(client.id),
      nome: client.name,
    });

    if (client.profileImageUrl) {
      params.set("foto", client.profileImageUrl);
    }

    router.push(`/mensagens?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <Card className="p-5 sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border">
              <Image
                src={profileImageUrl}
                alt={client.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold leading-tight">{client.name}</h1>
                <Badge variant="secondary">Contratante</Badge>
              </div>

              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{client.location || "Local não informado"}</span>
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Desde {joinedAt}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  {client.bookingsCount} contratações
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4" />
                  {client.reviewsGivenCount} avaliações feitas
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleMessage}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar mensagem
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

