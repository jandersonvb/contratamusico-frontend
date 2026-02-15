"use client";

import type { Conversation, LastMessage } from "@/api/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/lib/stores/chatStore";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const { onlineUsers } = useChatStore();

  // Nome da outra parte
  const displayName =
    conversation.otherParty?.name ||
    conversation.musicianName ||
    conversation.clientName ||
    "Sem nome";

  // Iniciais para o avatar
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Última mensagem
  const lastMessageText = getLastMessagePreview(conversation.lastMessage);

  // Hora/data da última mensagem
  const lastDate = conversation.lastMessageAt
    ? formatRelativeDate(new Date(conversation.lastMessageAt))
    : "";

  // Status online
  const otherUserId = conversation.otherParty?.id;
  const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false;

  // Mensagem não lida
  const hasUnread =
    typeof conversation.lastMessage === "object" &&
    conversation.lastMessage !== null
      ? !(conversation.lastMessage as LastMessage).isRead
      : false;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center gap-3 ${
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/80 border border-transparent"
      }`}
    >
      {/* Avatar com indicador online */}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          {conversation.otherParty?.profileImageUrl && (
            <AvatarImage
              src={conversation.otherParty.profileImageUrl}
              alt={displayName}
            />
          )}
          <AvatarFallback className="text-sm font-medium bg-primary/10">
            {initials}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-medium text-sm truncate ${
              hasUnread ? "text-foreground" : "text-foreground/90"
            }`}
          >
            {displayName}
          </span>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
            {lastDate}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-xs truncate ${
              hasUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {lastMessageText || "Nenhuma mensagem"}
          </p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
              {conversation.unreadCount > 99
                ? "99+"
                : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function getLastMessagePreview(lastMessage: Conversation["lastMessage"]): string {
  if (typeof lastMessage === "string") {
    return lastMessage;
  }

  if (!lastMessage || typeof lastMessage !== "object") {
    return "";
  }

  const typedMessage = lastMessage as LastMessage;
  const content = typedMessage.content?.trim() ?? "";
  if (content) {
    return content;
  }

  switch (typedMessage.type) {
    case "AUDIO":
      return "Mensagem de áudio";
    case "IMAGE":
      return "Imagem";
    case "VIDEO":
      return "Vídeo";
    default:
      return "Mensagem";
  }
}

/**
 * Formata data relativa (Hoje, Ontem, DD/MM, etc.)
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 86400000;

  // Verifica se é hoje
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Ontem
  const yesterday = new Date(now.getTime() - oneDay);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Ontem";
  }

  // Menos de 7 dias
  if (diff < oneDay * 7) {
    return date.toLocaleDateString("pt-BR", { weekday: "short" });
  }

  // Mais de 7 dias
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
