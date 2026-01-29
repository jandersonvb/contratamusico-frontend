"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Music4, MapPin } from "lucide-react";

export function Hero() {
  return (
    // FULL-BLEED: ocupa 100vw e ignora os gutters do layout
    <section className="relative w-screen overflow-hidden">
      {/* BG: cobre toda a largura/altura do Hero */}
      <div className="relative h-[70vh] min-h-[920px] w-screen">
        <Image
          src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2000&auto=format&fit=crop"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        {/* CONTEÚDO CENTRAL: dentro de um container, mas o BG já é full */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 text-center text-white">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight">
              Encontre o Músico Perfeito para seu Evento
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-95">
              Conectamos você com músicos talentosos para tornar sua ocasião especial inesquecível.
            </p>

            {/* Busca */}
            <div className="mx-auto mb-6 grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-xl bg-white/95 p-2 shadow-lg">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Ex.: banda sertaneja, DJ, violino..."
                  className="border-0 bg-transparent focus-visible:ring-0 text-muted-foreground"
                />
                <div className="hidden md:flex items-center gap-2 border-l pl-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Cidade ou região"
                    className="w-40 border-0 focus-visible:ring-0 text-muted-foreground"
                  />
                </div>
                <Button className="ml-auto md:ml-0">Buscar</Button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/busca" className="flex items-center gap-2">
                  <Music4 className="h-5 w-5" />
                  Buscar músicos
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-white/90 text-black hover:bg-white">
                <Link href="/cadastro">Sou músico</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* transição suave para a próxima seção */}
      <div className="h-16 bg-gradient-to-b from-black/30 to-background" />
    </section>
  );
}
