"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/stores/userStore";
import { CalendarDays, MessageSquare, Star, Users2, Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUserStore();

  // Dados mock – substitua por fetch ao seu backend
  const stats = [
    { label: "Convites recebidos", value: 8, icon: Users2 },
    { label: "Mensagens não lidas", value: 3, icon: MessageSquare },
    { label: "Próximos eventos", value: 2, icon: CalendarDays },
    { label: "Avaliação média", value: "4,8", icon: Star },
  ];

  const proximos = [
    { id: 1, titulo: "Casamento – Espaço Garden", data: "10/11/2025", cidade: "Itajubá/MG", status: "confirmado" },
    { id: 2, titulo: "Aniversário 30 anos", data: "23/11/2025", cidade: "Pouso Alegre/MG", status: "negociando" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Olá, {user?.firstName ?? "música(o)"} 👋
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo do que está acontecendo na sua conta.
          </p>
        </div>
        <Button onClick={() => router.push("/busca")} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Novo pedido / Buscar músicos
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximos eventos / convites */}
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.titulo}</div>
                  <div className="text-sm text-muted-foreground">
                    {p.data} • {p.cidade}
                  </div>
                </div>
                <Badge
                  variant={p.status === "confirmado" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {p.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" onClick={() => {/* ir para agenda */}}>
              Ver agenda completa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="secondary" onClick={() => {/* nova proposta */}}>
              Criar proposta rápida
            </Button>
            <Button variant="secondary" onClick={() => {/* mensagens */}}>
              Abrir mensagens
            </Button>
            <Button variant="secondary" onClick={() => {/* perfil */}}>
              Completar perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
