"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useChatStore } from "@/lib/stores/chatStore";
import { useUserStore } from "@/lib/stores/userStore";
import { getConversationMessagesPaginated, getMyConversations, getUnreadCount } from "@/api/chat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { Loader2, MessageCircle, ArrowLeft, Wifi, WifiOff, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "@/api/chat";
import type { PendingMusician } from "../page";

interface ChatWindowProps {
  conversation: Conversation | null;
  pendingMusician?: PendingMusician | null;
  onBack?: () => void;
  onConversationCreated?: (conversationId: number) => void;
}

export function ChatWindow({
  conversation,
  pendingMusician,
  onBack,
  onConversationCreated,
}: ChatWindowProps) {
  const { emit, isConnected } = useSocket();
  const { user } = useUserStore();
  const {
    messages,
    setMessages,
    setConversations,
    prependMessages,
    pagination,
    setPagination,
    typingUsers,
    setLoadingMessages,
    isLoadingMessages,
    isLoadingMore,
    setLoadingMore,
    onlineUsers,
    markConversationAsRead,
    setUnreadCount,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sendingFirst, setSendingFirst] = useState(false);
  const fetchingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const conversationId = conversation?.id ?? null;
  const currentMessages = useMemo(
    () => (conversationId ? messages[conversationId] || [] : []),
    [conversationId, messages]
  );

  // Determina se está no modo "nova conversa"
  const isNewConversation = !conversation && !!pendingMusician;

  // Estado de paginação da conversa atual
  const convPagination = conversationId ? pagination[conversationId] : null;
  const hasMore = convPagination?.hasMore ?? false;

  // Info da outra parte (conversa existente OU músico pendente)
  const otherName =
    conversation?.otherParty?.name ||
    conversation?.musicianName ||
    conversation?.clientName ||
    pendingMusician?.name ||
    "Sem nome";

  const otherImageUrl =
    conversation?.otherParty?.profileImageUrl || pendingMusician?.profileImageUrl;

  const otherInitials = otherName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const otherUserId = conversation?.otherParty?.id;
  const isOtherOnline = otherUserId ? onlineUsers.has(otherUserId) : false;

  // ─── Carga inicial: 50 mensagens mais recentes (paginado) ────────
  useEffect(() => {
    if (!conversationId) return;

    // Sempre entra na room e marca como lida
    emit("conversation:join", { conversationId });
    emit("message:read", { conversationId });

    // Atualiza badges localmente e re-busca o contador global
    markConversationAsRead(conversationId);
    getUnreadCount()
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});

    // Pula o fetch se as mensagens já estão em cache ou se já está buscando
    const alreadyLoaded = (messages[conversationId]?.length ?? 0) > 0;
    if (alreadyLoaded || fetchingRef.current) {
      setInitialLoad(false);
      return;
    }

    fetchingRef.current = true;
    setInitialLoad(true);
    setLoadingMessages(true);

    getConversationMessagesPaginated(conversationId)
      .then((data) => {
        setMessages(conversationId, data.messages);
        setPagination(conversationId, data.hasMore, data.nextCursor);
      })
      .catch(console.error)
      .finally(() => {
        setLoadingMessages(false);
        setInitialLoad(false);
        fetchingRef.current = false;
      });

    return () => {
      fetchingRef.current = false;
    };
    // Funções do Zustand são estáveis; emit é estável (useCallback com [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // ─── Carregar mais antigas (infinite scroll para cima) ──────────
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

      // Restaura posição do scroll para não pular ao inserir mensagens no topo
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      console.error("[Chat] Erro ao carregar mais mensagens:", err);
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [conversationId, hasMore, convPagination?.nextCursor, prependMessages, setPagination, setLoadingMore]);

  // ─── Detectar scroll no topo para carregar mais (com debounce) ──
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = setTimeout(() => {
        if (container.scrollTop < 100 && hasMore && !loadingMoreRef.current) {
          loadMore();
        }
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(scrollDebounceRef.current);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore, hasMore]);

  // ─── Auto-scroll para baixo quando chega mensagem nova ──────────
  useEffect(() => {
    if (!initialLoad && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, initialLoad]);

  // Scroll para baixo após carga inicial
  useEffect(() => {
    if (!initialLoad && !isLoadingMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [isLoadingMessages, initialLoad]);

  // ─── Envia mensagem via WebSocket ───────────────────────────────
  const handleSend = useCallback(
    (content: string) => {
      if (conversationId) {
        // Conversa existente: fluxo normal
        emit(
          "message:send",
          { conversationId, content },
          (response: unknown) => {
            const res = response as { success: boolean; error?: string };
            if (!res.success) {
              console.error("[Chat] Erro ao enviar:", res.error);
            }
          }
        );
        emit("typing:stop", { conversationId });
      } else if (pendingMusician) {
        // Nova conversa: envia com musicianProfileId para criar conversa
        setSendingFirst(true);
        emit(
          "message:send",
          { musicianProfileId: pendingMusician.id, content },
          async (response: unknown) => {
            const res = response as {
              success: boolean;
              error?: string;
              data?: { conversationId: number };
            };
            if (res.success && res.data?.conversationId) {
              // Recarrega conversas para ter a nova na lista
              try {
                const convs = await getMyConversations();
                setConversations(convs);
              } catch {
                // ignora erro de recarregar lista
              }
              onConversationCreated?.(res.data.conversationId);
            } else {
              console.error("[Chat] Erro ao criar conversa:", res.error);
            }
            setSendingFirst(false);
          }
        );
      }
    },
    [conversationId, pendingMusician, emit, onConversationCreated, setConversations]
  );

  // Indicador de digitação
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;
      emit(isTyping ? "typing:start" : "typing:stop", {
        conversationId,
      });
    },
    [conversationId, emit]
  );

  // Marca como lida quando o chat está focado
  useEffect(() => {
    if (!conversationId) return;

    const handleFocus = () => {
      emit("message:read", { conversationId });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [conversationId, emit]);

  // Usuários digitando nesta conversa (exceto eu)
  const typing = typingUsers.filter(
    (t) => t.conversationId === conversationId && t.userId !== user?.id
  );

  // ─── Estado vazio: nenhuma conversa selecionada e sem músico pendente
  if (!conversation && !pendingMusician) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-muted/50 rounded-full p-6 mb-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h3 className="font-medium text-foreground/80 mb-1">
          Suas mensagens
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Selecione uma conversa para ver as mensagens
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-3 sm:px-4 py-3 flex items-center gap-3">
        {/* Botão voltar (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-1 -ml-1 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-9 w-9">
            {otherImageUrl && (
              <AvatarImage src={otherImageUrl} alt={otherName} />
            )}
            <AvatarFallback className="text-xs font-medium bg-primary/10">
              {otherInitials}
            </AvatarFallback>
          </Avatar>
          {isOtherOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>

        {/* Nome e status */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{otherName}</h2>
          <p className="text-[11px] text-muted-foreground">
            {isNewConversation
              ? "Nova conversa"
              : isOtherOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>

        {/* Status da conexão */}
        <div className="shrink-0" title={isConnected ? "Conectado" : "Desconectado"}>
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-2"
      >
        {/* Spinner de carregar mais antigas (topo) */}
        {isLoadingMore && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isNewConversation ? (
          // Estado de nova conversa: convite para enviar primeira mensagem
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Avatar className="h-16 w-16 mb-4">
              {otherImageUrl && (
                <AvatarImage src={otherImageUrl} alt={otherName} />
              )}
              <AvatarFallback className="text-lg font-medium bg-primary/10">
                {otherInitials}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-foreground mb-1">{otherName}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Envie uma mensagem para iniciar a conversa
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/60">
              <Send className="h-3 w-3" />
              <span>Use o campo abaixo para escrever</span>
            </div>
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          </div>
        ) : (
          <>
            {currentMessages
              .filter(
                (msg) => msg && typeof msg === "object" && msg.id
              )
              .map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMine={message.senderId === user?.id}
                />
              ))}
          </>
        )}
        {typing.length > 0 && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!isConnected || sendingFirst}
      />
    </div>
  );
}
