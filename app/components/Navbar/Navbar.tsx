'use client';

import { useUserStore } from "@/lib/stores/userStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./components/UserMenu";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isLoggedIn } = useUserStore(); // ajuste os nomes conforme teu store

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg flex items-center">
            <span className="text-lg bg-primary border-lg border-0 rounded-md px-1 py-0.5 mr-1 font-mono font-bold text-background">
              CONTRATA
            </span>
            MÚSICO
          </span>
        </Link>

        {/* Desktop */}
        <nav className={cn("hidden items-center gap-6 md:flex")}>
          <Link href="/" className="text-muted-foreground hover:text-foreground">Início</Link>
          <Link href="/busca" className="text-muted-foreground hover:text-foreground">Buscar Músicos</Link>
          <Link href="/como-funciona" className="text-muted-foreground hover:text-foreground">Como Funciona</Link>
          <Link href="/contato" className="text-muted-foreground hover:text-foreground">Contato</Link>
          <Link href="/planos" className="text-muted-foreground hover:text-foreground">Planos</Link>

          {/* À direita: auth vs avatar */}
          <div className="ml-2">
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>

        {/* Botão mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Abrir menu</span>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-2 p-4">
            <Link href="/" onClick={() => setOpen(false)}>Início</Link>
            <Link href="/busca" onClick={() => setOpen(false)}>Buscar Músicos</Link>
            <Link href="/como-funciona" onClick={() => setOpen(false)}>Como Funciona</Link>
            <Link href="/contato" onClick={() => setOpen(false)}>Contato</Link>
            <Link href="/planos" onClick={() => setOpen(false)}>Planos</Link>

            {isLoggedIn ? (
              <>
                <div className="h-px bg-border my-2" />
                <Link href="/perfil" onClick={() => setOpen(false)}>Perfil</Link>
                <Link href="/configuracoes" onClick={() => setOpen(false)}>Configurações</Link>
                <button
                  onClick={() => {
                    // opcional: await logout()
                    useUserStore.getState().logout?.();
                    setOpen(false);
                  }}
                  className="text-left text-red-600"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
