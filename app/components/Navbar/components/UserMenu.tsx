

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User2, LayoutGrid, LogOut } from "lucide-react";
import { useUserStore } from "@/lib/stores/userStore";

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
  const { user, logout } = useUserStore();

  const initials = useMemo(
    () => getInitials(user?.firstName, user?.lastName),
    [user?.firstName, user?.lastName]
  );

  const handleLogout = async () => {
    try { await logout?.(); } finally { router.push("/login"); }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Botão redondo estilo QR Midia */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full border bg-foreground/5 hover:bg-foreground/10"
          aria-label="Menu do usuário"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
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

        {/* Se quiser um link “Meus Designs” como no QR Midia, troque a rota abaixo */}
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/dashboard" className="flex items-center">
            <LayoutGrid className="h-4 w-4" />
            <span>Meus Painéis</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
