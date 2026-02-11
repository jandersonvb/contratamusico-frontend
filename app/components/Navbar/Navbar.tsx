'use client';

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";
import { useChatStore } from "@/lib/stores/chatStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { UserMenu } from "./components/UserMenu";
import { 
  MessageCircle, 
  Home, 
  LayoutDashboard, 
  Search, 
  HelpCircle, 
  Mail, 
  CreditCard,
  User,
  Heart,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Componente para mostrar Avatar e info do usuário no menu mobile
function MobileUserHeader() {
  const { user } = useUserStore();
  
  const getInitials = (name?: string, surname?: string) => {
    const a = (name?.[0] ?? "U").toUpperCase();
    const b = (surname?.[0] ?? "").toUpperCase();
    return (a + b) || "U";
  };

  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName = user?.firstName 
    ? `${user.firstName} ${user?.lastName ?? ""}`.trim() 
    : "Minha conta";

  return (
    <div className="flex items-center gap-3 py-3 mb-2">
      <Avatar className="h-12 w-12 border-2 border-primary/20">
        {user?.profileImageUrl && (
          <AvatarImage 
            src={user.profileImageUrl} 
            alt={fullName}
          />
        )}
        <AvatarFallback className="text-base font-medium bg-primary/10">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{fullName}</span>
        {user?.email && (
          <span className="text-sm text-muted-foreground truncate max-w-[180px]">
            {user.email}
          </span>
        )}
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn } = useUserStore();
  const { unreadCount } = useChatStore();

  // Garante que o componente só renderize após a hidratação do Zustand
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (open) {
      const previousBodyOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.addEventListener("keydown", onEscape);
      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
        window.removeEventListener("keydown", onEscape);
      };
    }
  }, [open]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const onBreakpointChange = () => {
      if (mediaQuery.matches) setOpen(false);
    };
    mediaQuery.addEventListener("change", onBreakpointChange);
    return () => mediaQuery.removeEventListener("change", onBreakpointChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-base min-[360px]:text-lg flex items-center">
            <span className="text-base min-[360px]:text-lg bg-primary border-lg border-0 rounded-md px-1 py-0.5 mr-1 font-mono font-bold text-background">
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
                  <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse shadow-sm shadow-red-500/50">
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
          aria-expanded={open}
          aria-controls="mobile-sidebar"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
          <svg 
            viewBox="0 0 24 24" 
            className={cn("size-5 transition-transform duration-200", open && "rotate-90")} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </Button>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/80 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        />

        <aside
          id="mobile-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className={cn(
            "absolute left-0 top-0 h-dvh w-[86vw] max-w-[340px] border-r bg-background shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
              >
                <svg 
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-1">
                <Link href="/" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <Home className="h-4 w-4" />
                  Início
                </Link>
                {hydrated && isLoggedIn && (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link href="/mensagens" onClick={() => setOpen(false)} className="relative inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                      <MessageCircle className="h-4 w-4" />
                      Mensagens
                      {unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white animate-pulse shadow-sm shadow-red-500/50 px-1">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <Link href="/busca" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <Search className="h-4 w-4" />
                  Buscar Músicos
                </Link>
                <Link href="/como-funciona" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <HelpCircle className="h-4 w-4" />
                  Como Funciona
                </Link>
                <Link href="/contato" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <Mail className="h-4 w-4" />
                  Contato
                </Link>
                <Link href="/planos" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                  <CreditCard className="h-4 w-4" />
                  Planos
                </Link>

                {hydrated && isLoggedIn ? (
                  <>
                    <div className="h-px bg-border my-2" />
                    {/* Avatar e informações do usuário no mobile */}
                    <MobileUserHeader />
                    <Link href="/perfil" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                      <User className="h-4 w-4" />
                      Meu Perfil
                    </Link>
                    <Link href="/favoritos" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted">
                      <Heart className="h-4 w-4" />
                      Favoritos
                    </Link>
                    <button
                      onClick={() => {
                        useUserStore.getState().logout?.();
                        setOpen(false);
                      }}
                      className="text-left text-destructive inline-flex items-center gap-2 rounded-md px-2 py-2 hover:bg-destructive/5 hover:text-destructive/80 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      aria-label="Sair da conta"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
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
            </nav>
          </div>
        </aside>
      </div>
    </header>
  );
}
