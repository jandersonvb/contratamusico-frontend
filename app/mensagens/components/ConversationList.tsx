"use client";

import { useChatStore } from "@/lib/stores/chatStore";
import { ConversationItem } from "./ConversationItem";
import { MessageCircle, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface ConversationListProps {
  onSelectConversation: (id: number) => void;
}

export function ConversationList({
  onSelectConversation,
}: ConversationListProps) {
  const {
    conversations,
    selectedConversationId,
    isLoadingConversations,
  } = useChatStore();
  const [search, setSearch] = useState("");

  // Filtra conversas por nome
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const term = search.toLowerCase();
    return conversations.filter((c) => {
      const name =
        c.otherParty?.name || c.musicianName || c.clientName || "";
      return name.toLowerCase().includes(term);
    });
  }, [conversations, search]);

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de busca */}
      {conversations.length > 0 && (
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="pl-9 rounded-full bg-muted/50 border-0 h-9 text-sm focus-visible:ring-1"
            />
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search
                ? "Nenhuma conversa encontrada"
                : "Nenhuma conversa ainda"}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Envie uma mensagem a um músico para iniciar
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered
              .filter(
                (c) => c && typeof c === "object" && c.id
              )
              .map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
