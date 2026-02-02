'use client';

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UserMenu } from "./components/UserMenu";
import { getUnreadCount } from "@/api/chat";
import { 
  MessageCircle, 
  Home, 
  LayoutDashboard, 
  Search, 
  HelpCircle, 
  Mail, 
  CreditCard,
  User,
  Settings,
  LogOut
} from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isLoggedIn } = useUserStore();

  // Garante que o componente só renderize após a hidratação do Zustand
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Busca o contador de mensagens não lidas
  useEffect(() => {
    if (!hydrated || !isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    let debounceTimer: NodeJS.Timeout;

    const fetchUnreadCount = async () => {
      try {
        const { count } = await getUnreadCount();
        setUnreadCount(count);
      } catch {
        // Silently fail
      }
    };

    // Busca inicial com delay para evitar conflito com outras requisições
    const initialTimer = setTimeout(fetchUnreadCount, 500);

    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);

    // Escuta evento customizado com debounce para evitar múltiplas requisições
    const handleUpdate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchUnreadCount, 1000);
    };
    window.addEventListener('unread-messages-updated', handleUpdate);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(debounceTimer);
      clearInterval(interval);
      window.removeEventListener('unread-messages-updated', handleUpdate);
    };
  }, [hydrated, isLoggedIn]);

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
          <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <Home className="h-4 w-4" />
            Início
          </Link>
          {hydrated && isLoggedIn && (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/mensagens" className="text-muted-foreground hover:text-foreground relative inline-flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Mensagens
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
          <Link href="/busca" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <Search className="h-4 w-4" />
            Buscar Músicos
          </Link>
          <Link href="/como-funciona" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            Como Funciona
          </Link>
          <Link href="/contato" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            Contato
          </Link>
          <Link href="/planos" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <CreditCard className="h-4 w-4" />
            Planos
          </Link>

          {/* À direita: auth vs avatar */}
          <div className="ml-2">
            {!hydrated ? (
              // Placeholder durante hidratação para evitar flash de conteúdo
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            ) : isLoggedIn ? (
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
            <Link href="/" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
              <Home className="h-4 w-4" />
              Início
            </Link>
            {hydrated && isLoggedIn && (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/mensagens" onClick={() => setOpen(false)} className="relative inline-flex items-center gap-2 py-2">
                  <MessageCircle className="h-4 w-4" />
                  Mensagens
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <Link href="/busca" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
              <Search className="h-4 w-4" />
              Buscar Músicos
            </Link>
            <Link href="/como-funciona" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
              <HelpCircle className="h-4 w-4" />
              Como Funciona
            </Link>
            <Link href="/contato" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
              <Mail className="h-4 w-4" />
              Contato
            </Link>
            <Link href="/planos" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
              <CreditCard className="h-4 w-4" />
              Planos
            </Link>

            {hydrated && isLoggedIn ? (
              <>
                <div className="h-px bg-border my-2" />
                <Link href="/perfil" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
                  <User className="h-4 w-4" />
                  Perfil
                </Link>
                <Link href="/configuracoes" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 py-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
                <button
                  onClick={() => {
                    // opcional: await logout()
                    useUserStore.getState().logout?.();
                    setOpen(false);
                  }}
                  className="text-left text-red-600 inline-flex items-center gap-2 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            ) : hydrated && !isLoggedIn ? (
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
