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

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { on, isConnected } = useSocket();
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
    updateConversationLastMessage,
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

  // Carrega conversas e unread count ao conectar
  const loadInitialData = useCallback(async () => {
    try {
      const [convs, unread] = await Promise.all([
        getMyConversations(),
        getUnreadCount(),
      ]);
      setConversations(convs);
      setUnreadCount(unread.count);
    } catch (error) {
      console.error("[ChatProvider] Erro ao carregar dados iniciais:", error);
    }
  }, [setConversations, setUnreadCount]);

  // Carrega dados quando conecta
  useEffect(() => {
    if (isLoggedIn && isConnected) {
      loadInitialData();
    }
  }, [isLoggedIn, isConnected, loadInitialData]);

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

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitleRef.current}`;
    } else {
      document.title = originalTitleRef.current;
    }

    return () => {
      document.title = originalTitleRef.current;
    };
  }, [unreadCount]);

  // Registra listeners do Socket (apenas quando conecta/desconecta)
  useEffect(() => {
    if (!isLoggedIn || !isConnected) return;

    // Nova mensagem recebida em tempo real
    const offNewMsg = on("message:new", (payload: unknown) => {
      const msg = payload as SocketMessagePayload;
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
      if (msg.senderId !== userIdRef.current) {
        const isOnChatPage = pathnameRef.current === "/mensagens";
        const isConversationOpen = isOnChatPage && msg.conversationId === selectedConversationIdRef.current;

        if (!isConversationOpen) {
          getUnreadCount()
            .then((data) => setUnreadCount(data.count))
            .catch(() => {});

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
      const data = payload as SocketReadPayload;
      markConversationAsRead(data.conversationId);
    });

    // Indicador de digitação
    const offTypingStart = on("typing:start", (payload: unknown) => {
      const data = payload as SocketTypingPayload;
      setTyping(data.userId, data.conversationId, true);
    });

    const offTypingStop = on("typing:stop", (payload: unknown) => {
      const data = payload as SocketTypingPayload;
      setTyping(data.userId, data.conversationId, false);
    });

    // Status online/offline
    const offOnline = on("user:online", (payload: unknown) => {
      const data = payload as SocketOnlinePayload;
      setUserOnline(data.userId, true);
    });

    const offOffline = on("user:offline", (payload: unknown) => {
      const data = payload as SocketOnlinePayload;
      setUserOnline(data.userId, false);
    });

    // Nova conversa criada (o outro iniciou uma conversa comigo)
    const offNewConv = on("conversation:new", () => {
      getMyConversations()
        .then(setConversations)
        .catch(console.error);
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
