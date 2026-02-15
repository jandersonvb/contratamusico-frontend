"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChatStore } from "@/lib/stores/chatStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useSocket } from "@/hooks/useSocket";
import { getConversationMessagesPaginated, sendMediaMessage } from "@/api/chat";
import { MessageBubble } from "@/app/mensagens/components/MessageBubble";
import { TypingIndicator } from "@/app/mensagens/components/TypingIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  X,
  Minus,
  Maximize2,
  Send,
  Loader2,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function FloatingChat() {
  const pathname = usePathname();
  const router = useRouter();
  const { emit, isConnected } = useSocket();
  const { user, isLoggedIn } = useUserStore();

  const {
    floatingConversationId,
    isFloatingOpen,
    openFloatingChat,
    closeFloatingChat,
    conversations,
    messages,
    setMessages,
    prependMessages,
    pagination,
    setPagination,
    typingUsers,
    onlineUsers,
    isLoadingMore,
    setLoadingMore,
    markConversationAsRead,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Não renderizar na página de mensagens
  const isOnMessagesPage = pathname === "/mensagens";

  // ─── Restaura estado do floating chat do localStorage (F5) ──────
  // Espera o usuário estar logado E as conversas carregadas para restaurar,
  // evitando conflito com o reset() que roda durante a hidratação do userStore.
  useEffect(() => {
    if (isOnMessagesPage || !isLoggedIn || conversations.length === 0) return;
    if (isFloatingOpen) return; // já restaurou

    try {
      const saved = localStorage.getItem("floatingChat");
      if (saved) {
        const { id } = JSON.parse(saved);
        if (id && typeof id === "number") {
          const exists = conversations.some((c) => c.id === id);
          if (exists) {
            openFloatingChat(id);
          } else {
            // Conversa não existe mais, limpa o localStorage
            localStorage.removeItem("floatingChat");
          }
        }
      }
    } catch {
      // ignora erro de parse
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, conversations, isOnMessagesPage]);

  // Conversa atual
  const conversation = useMemo(
    () => conversations.find((c) => c.id === floatingConversationId) ?? null,
    [conversations, floatingConversationId]
  );

  const conversationId = conversation?.id ?? null;

  // Mensagens da conversa
  const currentMessages = useMemo(
    () => (conversationId ? messages[conversationId] || [] : []),
    [conversationId, messages]
  );

  // Info da outra parte
  const otherName =
    conversation?.otherParty?.name ||
    conversation?.musicianName ||
    conversation?.clientName ||
    "Sem nome";

  const otherImageUrl = conversation?.otherParty?.profileImageUrl;

  const otherInitials = otherName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const otherUserId = conversation?.otherParty?.id;
  const isOtherOnline = otherUserId ? onlineUsers.has(otherUserId) : false;

  // Paginação
  const convPagination = conversationId ? pagination[conversationId] : null;
  const hasMore = convPagination?.hasMore ?? false;

  // Digitando
  const typing = typingUsers.filter(
    (t) => t.conversationId === conversationId && t.userId !== user?.id
  );

  // ─── Carrega mensagens ao abrir ─────────────────────────────────
  useEffect(() => {
    if (!conversationId || !isFloatingOpen || isOnMessagesPage) return;

    // Sempre entra na room e marca como lida
    emit("conversation:join", { conversationId });
    emit("message:read", { conversationId });

    markConversationAsRead(conversationId);

    // Pula o fetch se as mensagens já estão em cache ou se já está buscando
    const alreadyLoaded = (messages[conversationId]?.length ?? 0) > 0;
    if (alreadyLoaded || fetchingRef.current) {
      setInitialLoad(false);
      return;
    }

    fetchingRef.current = true;
    setInitialLoad(true);
    setIsLoadingMessages(true);

    getConversationMessagesPaginated(conversationId)
      .then((data) => {
        setMessages(conversationId, data.messages);
        setPagination(conversationId, data.hasMore, data.nextCursor);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoadingMessages(false);
        setInitialLoad(false);
        fetchingRef.current = false;
      });

    return () => {
      fetchingRef.current = false;
    };
    // Funções do Zustand são estáveis; emit é estável (useCallback com [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, conversation?.unreadCount, isFloatingOpen, isOnMessagesPage]);

  // ─── Infinite scroll para cima ──────────────────────────────────
  const loadMore = useCallback(async () => {
    // Usa ref para evitar chamadas duplicadas antes do re-render
    if (!conversationId || !hasMore || loadingMoreRef.current) return;
    const cursor = convPagination?.nextCursor;
    if (cursor == null) return;

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await getConversationMessagesPaginated(conversationId, cursor);
      prependMessages(conversationId, data.messages);
      setPagination(conversationId, data.hasMore, data.nextCursor);

      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error("[FloatingChat] Erro ao carregar mais:", err);
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [conversationId, hasMore, convPagination?.nextCursor, prependMessages, setPagination, setLoadingMore]);

  // Scroll handler (com debounce)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !isFloatingOpen) return;

    const handleScroll = () => {
      clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = setTimeout(() => {
        if (container.scrollTop < 60 && hasMore && !loadingMoreRef.current) {
          loadMore();
        }
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(scrollDebounceRef.current);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore, hasMore, isFloatingOpen]);

  // ─── Auto-scroll para novas mensagens ───────────────────────────
  useEffect(() => {
    if (!initialLoad && messagesEndRef.current && isFloatingOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, initialLoad, isFloatingOpen, isMinimized]);

  // Scroll imediato após carga inicial
  useEffect(() => {
    if (!initialLoad && !isLoadingMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [isLoadingMessages, initialLoad]);

  // ─── Marca como lida ao focar na janela ─────────────────────────
  useEffect(() => {
    if (!conversationId || !isFloatingOpen) return;
    const handleFocus = () => {
      emit("message:read", { conversationId });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [conversationId, emit, isFloatingOpen]);

  // ─── Enviar mensagem ────────────────────────────────────────────
  const handleSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      const hasText = trimmed.length > 0;
      const hasFile = Boolean(selectedFile);
      if ((!hasText && !hasFile) || !conversationId || isSending || !isConnected) return;

      setIsSending(true);
      clearTimeout(typingTimeoutRef.current);
      emit("typing:stop", { conversationId });

      if (selectedFile) {
        try {
          await sendMediaMessage({
            file: selectedFile,
            conversationId,
            content: hasText ? trimmed : undefined,
          });
          setInputValue("");
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Erro ao enviar mídia";
          toast.error(message);
        } finally {
          setIsSending(false);
        }
        return;
      }

      emit(
        "message:send",
        { conversationId, content: trimmed },
        (response: unknown) => {
          const res = response as { success: boolean; error?: string };
          if (!res.success) {
            console.error("[FloatingChat] Erro ao enviar:", res.error);
            toast.error(res.error || "Erro ao enviar mensagem");
          }
        }
      );

      setInputValue("");
      setIsSending(false);
    },
    [inputValue, selectedFile, conversationId, isSending, isConnected, emit]
  );

  // ─── Typing indicator ──────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (!conversationId) return;

      emit("typing:start", { conversationId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emit("typing:stop", { conversationId });
      }, 2000);
    },
    [conversationId, emit]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ─── Abrir página completa ──────────────────────────────────────
  const handleExpand = () => {
    closeFloatingChat();
    router.push("/mensagens");
  };

  // Contagem de não lidas desta conversa
  const unreadBubbleCount = conversation?.unreadCount ?? 0;

  // ─── Não renderizar se não deve exibir ──────────────────────────
  if (isOnMessagesPage || !isFloatingOpen || !floatingConversationId) {
    return null;
  }

  // ─── Estado minimizado: bolha circular estilo Facebook ──────────
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip com nome */}
        <div className="group relative">
          {/* Botão fechar (aparece no hover) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFloatingChat();
            }}
            className="absolute -top-1 -right-1 z-10 h-5 w-5 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-foreground shadow-md"
            title="Fechar"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Bolha avatar */}
          <button
            onClick={() => setIsMinimized(false)}
            className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 ring-2 ring-background overflow-hidden"
            title={otherName}
          >
            <Avatar className="h-full w-full">
              {otherImageUrl && (
                <AvatarImage src={otherImageUrl} alt={otherName} className="object-cover" />
              )}
              <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                {otherInitials}
              </AvatarFallback>
            </Avatar>

            {/* Indicador online */}
            {isOtherOnline && (
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </button>

          {/* Badge de não lidas */}
          {unreadBubbleCount > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
              {unreadBubbleCount > 9 ? "9+" : unreadBubbleCount}
            </span>
          )}

          {/* Tooltip nome (aparece no hover) */}
          <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              {otherName}
              <div className="absolute top-full right-5 border-4 border-transparent border-t-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Estado expandido: janela de chat completa ──────────────────
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col" style={{ width: 360 }}>
      <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div
          className="bg-primary text-primary-foreground px-3 py-2.5 flex items-center gap-2.5 cursor-pointer shrink-0"
          onClick={() => setIsMinimized(true)}
        >
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-8 w-8 border border-primary-foreground/20">
              {otherImageUrl && (
                <AvatarImage src={otherImageUrl} alt={otherName} />
              )}
              <AvatarFallback className="text-xs font-medium bg-primary-foreground/20 text-primary-foreground">
                {otherInitials}
              </AvatarFallback>
            </Avatar>
            {isOtherOnline && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border border-primary" />
            )}
          </div>

          {/* Nome e status */}
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm truncate block">
              {otherName}
            </span>
            <span className="text-[10px] text-primary-foreground/70">
              {isOtherOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Ações do header */}
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
              title="Minimizar"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleExpand}
              className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
              title="Abrir chat completo"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={closeFloatingChat}
              className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
              title="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ─── Corpo (mensagens + input) ───────────────────────────── */}
        <>
          {/* Mensagens */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5"
          >
            {/* Spinner carregando mais antigas */}
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <p className="text-xs text-muted-foreground">
                  Nenhuma mensagem ainda. Inicie a conversa!
                </p>
              </div>
            ) : (
              currentMessages
                .filter((msg) => msg && typeof msg === "object" && msg.id)
                .map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={message.senderId === user?.id}
                  />
                ))
            )}

            {typing.length > 0 && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="relative border-t bg-background px-2.5 py-2 flex items-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={!isConnected || isSending}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isConnected || isSending}
              className="rounded-full h-8 w-8 shrink-0"
              aria-label="Anexar arquivo"
              title="Anexar arquivo"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (!conversationId) return;
                emit("message:read", { conversationId });
                markConversationAsRead(conversationId);
              }}
              placeholder={selectedFile ? "Legenda (opcional)" : "Aa"}
              disabled={!isConnected || isSending}
              className="flex-1 h-9 text-sm rounded-full bg-muted/50 border-0 focus-visible:ring-1 px-3"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={(!inputValue.trim() && !selectedFile) || isSending || !isConnected}
              size="icon"
              className="rounded-full h-8 w-8 shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>

            {selectedFile && (
              <div className="absolute -top-8 left-2.5 right-2.5 flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-1 text-[11px] shadow-sm">
                <span className="truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remover arquivo selecionado"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </form>
        </>
      </div>
    </div>
  );
}
