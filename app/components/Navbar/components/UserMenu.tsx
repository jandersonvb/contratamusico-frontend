

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton"; // Commented out due to missing module
import { User2, LayoutGrid, LogOut, Heart, MessageCircle, Shield } from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";
import { useChatStore } from "@/lib/stores/chatStore";
import { UserRole } from "@/lib/types/user";
import { Skeleton } from "@/components/ui/skeleton";

// Util: pega iniciais e encurta e-mail
function getInitials(name?: string, surname?: string) {
  const a = (name?.[0] ?? "U").toUpperCase();
  const b = (surname?.[0] ?? "").toUpperCase();
  return (a + b) || "U";
}
function ellipsisEmail(email?: string) {
  if (!email) return "";
  return email.length > 24 ? email.slice(0, 22) + "…" : email;
}

export function UserMenu() {
  const router = useRouter();
  const { user, logout, isLoading, isLoggedIn } = useUserStore();
  const { unreadCount } = useChatStore();

  const initials = useMemo(
    () => getInitials(user?.firstName, user?.lastName),
    [user?.firstName, user?.lastName]
  );

  const handleLogout = async () => {
    try { await logout?.(); } finally { router.push("/login"); }
  };

  // Se está logado mas ainda não tem dados do usuário (carregando do backend)
  if (isLoggedIn && !user && isLoading) {
    return (
      <Skeleton className="h-10 w-10 rounded-full" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Botão redondo estilo QR Midia */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full border bg-foreground/5 hover:bg-foreground/10"
          aria-label="Menu do usuário"
        >
          <Avatar className="h-9 w-9">
            {user?.profileImageUrl && (
              <AvatarImage 
                src={user.profileImageUrl} 
                alt={`${user.firstName} ${user.lastName}`}
              />
            )}
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-60 rounded-xl border shadow-lg"
      >
        {/* Cabeçalho com e-mail (como no QR Midia) */}
        <DropdownMenuLabel className="py-2">
          <div className="text-sm font-medium leading-none">
            {user?.firstName ? `${user.firstName} ${user?.lastName ?? ""}`.trim() : "Minha conta"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {ellipsisEmail(user?.email)}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Itens com ícone à esquerda */}
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/perfil" className="flex items-center">
            <User2 className="h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-2">
          <Link href="/dashboard" className="flex items-center">
            <LayoutGrid className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-2">
          <Link href="/mensagens" className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>Mensagens</span>
            </span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-2">
          <Link href="/favoritos" className="flex items-center">
            <Heart className="h-4 w-4" />
            <span>Favoritos</span>
          </Link>
        </DropdownMenuItem>

        {user?.role === UserRole.ADMIN && (
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/admin" className="flex items-center">
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
