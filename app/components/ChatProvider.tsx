"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useChatStore } from "@/lib/stores/chatStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useFavoriteStore } from "@/lib/stores/favoriteStore";
import { getUnreadCount, getMyConversations } from "@/api/chat";

interface SocketMessagePayload {
  id: number;
  conversationId: number;
  content: string;
  senderId: number;
  sender?: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageKey?: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface SocketReadPayload {
  conversationId: number;
  readBy: number;
}

interface SocketTypingPayload {
  userId: number;
  conversationId: number;
}

interface SocketOnlinePayload {
  userId: number;
}

function normalizeSocketPayload<T extends object>(
  payload: unknown,
  keys: string[] = ["data", "message", "payload"]
): T | null {
  if (!payload || typeof payload !== "object") return null;

  const direct = payload as T;
  if (typeof (direct as Record<string, unknown>).id === "number") {
    return direct;
  }

  for (const key of keys) {
    const nested = (payload as Record<string, unknown>)[key];
    if (nested && typeof nested === "object") {
      return nested as T;
    }
  }

  return direct;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { on, emit, isConnected } = useSocket();
  const { isLoggedIn, user } = useUserStore();
  const { fetchFavorites, clearFavorites } = useFavoriteStore();
  const pathname = usePathname();
  const originalTitleRef = useRef("Contrata Músico");
  const {
    addMessage,
    setTyping,
    setUserOnline,
    markConversationAsRead,
    setUnreadCount,
    incrementUnread,
    updateConversationLastMessage,
    conversations,
    setConversations,
    selectedConversationId,
    unreadCount,
    openFloatingChat,
    reset,
  } = useChatStore();

  // Refs para valores que mudam frequentemente, evitando re-registro dos listeners
  const selectedConversationIdRef = useRef(selectedConversationId);
  selectedConversationIdRef.current = selectedConversationId;

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;
  const unreadCountRef = useRef(unreadCount);
  unreadCountRef.current = unreadCount;
  const bootstrapAttemptRef = useRef(0);
  const bootstrapRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldRetryBootstrapRef = useRef(true);

  // Carrega conversas e unread count ao conectar
  const joinConversations = useCallback(
    (convs: { id: number }[]) => {
      convs.forEach((c) => {
        emit("conversation:join", { conversationId: c.id });
      });
    },
    [emit]
  );

  const loadInitialData = useCallback(async () => {
    try {
      const [convs, unread] = await Promise.all([
        getMyConversations(),
        getUnreadCount(),
      ]);
      setConversations(convs);
      joinConversations(convs);
      setUnreadCount(unread.count);
      bootstrapAttemptRef.current = 0;
      shouldRetryBootstrapRef.current = true;
      if (bootstrapRetryRef.current) {
        clearTimeout(bootstrapRetryRef.current);
        bootstrapRetryRef.current = null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const normalizedMessage = message.toLowerCase();
      const isTransientError =
        normalizedMessage.includes("too many requests") ||
        normalizedMessage.includes("failed to fetch") ||
        normalizedMessage.includes("network");

      shouldRetryBootstrapRef.current = isTransientError;

      if (normalizedMessage.includes("too many requests")) {
        console.warn("[ChatProvider] Rate limit ao carregar dados iniciais.");
      } else {
        console.error("[ChatProvider] Erro ao carregar dados iniciais:", error);
      }
    }
  }, [setConversations, setUnreadCount, joinConversations]);

  // Carrega dados quando conecta
  useEffect(() => {
    if (isLoggedIn && isConnected) {
      loadInitialData();
    }
  }, [isLoggedIn, isConnected, loadInitialData]);

  // Retry controlado do bootstrap em caso de falha transitória (ex.: 429).
  useEffect(() => {
    if (!isLoggedIn || !isConnected) return;

    if (conversations.length > 0) return;
    if (!shouldRetryBootstrapRef.current) return;
    if (bootstrapAttemptRef.current >= 5) return;
    if (bootstrapRetryRef.current) return;

    bootstrapAttemptRef.current += 1;
    bootstrapRetryRef.current = setTimeout(() => {
      bootstrapRetryRef.current = null;
      loadInitialData();
    }, 3000);

    return () => {
      if (bootstrapRetryRef.current) {
        clearTimeout(bootstrapRetryRef.current);
        bootstrapRetryRef.current = null;
      }
    };
  }, [isLoggedIn, isConnected, conversations.length, loadInitialData]);

  useEffect(() => {
    if (isLoggedIn && isConnected) return;
    if (bootstrapRetryRef.current) {
      clearTimeout(bootstrapRetryRef.current);
      bootstrapRetryRef.current = null;
    }
    bootstrapAttemptRef.current = 0;
    shouldRetryBootstrapRef.current = true;
  }, [isLoggedIn, isConnected]);

  // Sempre que a lista de conversas mudar, garante entrada nas rooms via socket.
  useEffect(() => {
    if (!isLoggedIn || !isConnected || conversations.length === 0) return;
    joinConversations(conversations);
  }, [isLoggedIn, isConnected, conversations, joinConversations]);

  // Reseta as stores quando desloga
  useEffect(() => {
    if (!isLoggedIn) {
      reset();
      clearFavorites();
    }
  }, [isLoggedIn, reset, clearFavorites]);

  // Carrega favoritos quando o usuário está logado
  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn, fetchFavorites]);

  // Título da aba com contador de não lidas (estilo Gmail)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = originalTitleRef.current;

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }

    return () => {
      document.title = baseTitle;
    };
  }, [unreadCount]);

  // Registra listeners do Socket (apenas quando conecta/desconecta)
  useEffect(() => {
    if (!isLoggedIn || !isConnected) return;

    // Nova mensagem recebida em tempo real
    const offNewMsg = on("message:new", (payload: unknown) => {
      const msg = normalizeSocketPayload<SocketMessagePayload>(payload);
      if (!msg?.conversationId || !msg?.id) {
        console.warn("[ChatProvider] Payload inválido em message:new", payload);
        return;
      }

      addMessage(msg.conversationId, {
        id: msg.id,
        conversationId: msg.conversationId,
        content: msg.content,
        senderId: msg.senderId,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
      });
      updateConversationLastMessage(
        msg.conversationId,
        msg.content,
        msg.createdAt
      );

      // Atualiza contador se a mensagem não é do usuário atual
      // e a conversa não está aberta (usa refs para evitar re-registro)
      if (Number(msg.senderId) !== Number(userIdRef.current)) {
        const isOnChatPage = pathnameRef.current === "/mensagens";
        const isConversationOpen = isOnChatPage && msg.conversationId === selectedConversationIdRef.current;

        if (!isConversationOpen) {
          const nextUnread = incrementUnread(msg.conversationId);
          unreadCountRef.current = nextUnread;

          // Notificação sonora
          playNotificationSound();

          // Abre o chat flutuante no canto inferior direito (estilo Facebook)
          if (!isOnChatPage) {
            openFloatingChat(msg.conversationId);
          }
        }
      }
    });

    // Mensagens marcadas como lidas pelo outro
    const offRead = on("message:read", (payload: unknown) => {
      const data = normalizeSocketPayload<SocketReadPayload>(payload);
      if (!data?.conversationId) return;
      markConversationAsRead(data.conversationId);
    });

    // Indicador de digitação
    const offTypingStart = on("typing:start", (payload: unknown) => {
      const data = normalizeSocketPayload<SocketTypingPayload>(payload);
      if (!data?.conversationId || !data?.userId) return;
      setTyping(data.userId, data.conversationId, true);
    });

    const offTypingStop = on("typing:stop", (payload: unknown) => {
      const data = normalizeSocketPayload<SocketTypingPayload>(payload);
      if (!data?.conversationId || !data?.userId) return;
      setTyping(data.userId, data.conversationId, false);
    });

    // Status online/offline
    const offOnline = on("user:online", (payload: unknown) => {
      const data = normalizeSocketPayload<SocketOnlinePayload>(payload);
      if (!data?.userId) return;
      setUserOnline(data.userId, true);
    });

    const offOffline = on("user:offline", (payload: unknown) => {
      const data = normalizeSocketPayload<SocketOnlinePayload>(payload);
      if (!data?.userId) return;
      setUserOnline(data.userId, false);
    });

    // Nova conversa criada (o outro iniciou uma conversa comigo)
    const offNewConv = on("conversation:new", () => {
      getMyConversations()
        .then((convs) => {
          setConversations(convs);
          joinConversations(convs);
        })
        .catch(() => {});
    });

    return () => {
      offNewMsg();
      offRead();
      offTypingStart();
      offTypingStop();
      offOnline();
      offOffline();
      offNewConv();
    };
    // Funções do Zustand são estáveis (criadas uma vez no store).
    // Valores que mudam frequentemente (pathname, selectedConversationId, user.id)
    // são acessados via refs para evitar re-registro dos listeners a cada mudança.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isConnected, on]);

  return <>{children}</>;
}

// Utilitário: toca som de notificação
function playNotificationSound() {
  try {
    // Cria um bipe curto usando Web Audio API (sem precisar de arquivo externo)
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.1;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    // Silently fail se autoplay bloqueado
  }
}
