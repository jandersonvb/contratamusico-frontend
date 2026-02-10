import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Conversation, Message } from "@/api/chat";

interface TypingUser {
  userId: number;
  conversationId: number;
}

interface ConversationPagination {
  hasMore: boolean;
  nextCursor: number | null;
}

interface ChatState {
  // Estado
  conversations: Conversation[];
  selectedConversationId: number | null;
  messages: Record<number, Message[]>; // conversationId -> Message[]
  pagination: Record<number, ConversationPagination>; // conversationId -> paginação
  typingUsers: TypingUser[];
  onlineUsers: Set<number>;
  unreadCount: number;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingMore: boolean;

  // Floating chat (popup estilo Facebook)
  floatingConversationId: number | null;
  isFloatingOpen: boolean;

  // Ações
  setConversations: (conversations: Conversation[]) => void;
  selectConversation: (id: number | null) => void;
  addMessage: (conversationId: number, message: Message) => void;
  removeMessage: (conversationId: number, messageId: number) => void;
  setMessages: (conversationId: number, messages: Message[]) => void;
  prependMessages: (conversationId: number, messages: Message[]) => void;
  setPagination: (conversationId: number, hasMore: boolean, nextCursor: number | null) => void;
  markConversationAsRead: (conversationId: number) => void;
  setTyping: (userId: number, conversationId: number, isTyping: boolean) => void;
  setUserOnline: (userId: number, online: boolean) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: (conversationId: number) => number;
  updateConversationLastMessage: (
    conversationId: number,
    content: string,
    date: string
  ) => void;
  addConversation: (conversation: Conversation) => void;
  setLoadingConversations: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  openFloatingChat: (conversationId: number) => void;
  closeFloatingChat: () => void;
  toggleFloatingChat: () => void;
  reset: () => void;
}

const initialState = {
  conversations: [],
  selectedConversationId: null,
  messages: {},
  pagination: {},
  typingUsers: [],
  onlineUsers: new Set<number>(),
  unreadCount: 0,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingMore: false,
  floatingConversationId: null as number | null,
  isFloatingOpen: false,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      ...initialState,

      setConversations: (conversations) =>
        set({ conversations }, false, "chat/setConversations"),

      selectConversation: (id) =>
        set({ selectedConversationId: id }, false, "chat/selectConversation"),

      addMessage: (conversationId, message) =>
        set(
          (state) => {
            const existing = state.messages[conversationId] || [];
            // Evita duplicatas por ID
            if (existing.some((m) => m.id === message.id)) return state;

            // Se chegou a versão "real" de uma mensagem otimista (id negativo),
            // substitui a pendente para evitar duplicar no histórico.
            if (message.id > 0) {
              const createdAtMs = Date.parse(message.createdAt);
              const pendingIndex = existing.findIndex((m) => {
                if (m.id >= 0) return false;
                if (m.senderId !== message.senderId) return false;
                if (m.content !== message.content) return false;
                const pendingMs = Date.parse(m.createdAt);
                if (Number.isNaN(createdAtMs) || Number.isNaN(pendingMs)) return false;
                return Math.abs(createdAtMs - pendingMs) <= 10000;
              });

              if (pendingIndex >= 0) {
                const next = existing.slice();
                next[pendingIndex] = message;
                return {
                  messages: {
                    ...state.messages,
                    [conversationId]: next,
                  },
                };
              }
            }

            return {
              messages: {
                ...state.messages,
                [conversationId]: [...existing, message],
              },
            };
          },
          false,
          "chat/addMessage"
        ),

      removeMessage: (conversationId, messageId) =>
        set(
          (state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] || []).filter(
                (m) => m.id !== messageId
              ),
            },
          }),
          false,
          "chat/removeMessage"
        ),

      setMessages: (conversationId, messages) =>
        set(
          (state) => ({
            messages: { ...state.messages, [conversationId]: messages },
          }),
          false,
          "chat/setMessages"
        ),

      // Insere mensagens mais antigas no INÍCIO do array (para infinite scroll para cima)
      prependMessages: (conversationId, newMessages) =>
        set(
          (state) => {
            const existing = state.messages[conversationId] || [];
            // Filtra duplicatas
            const filtered = newMessages.filter(
              (m) => !existing.some((e) => e.id === m.id)
            );
            if (filtered.length === 0) return state;
            return {
              messages: {
                ...state.messages,
                [conversationId]: [...filtered, ...existing],
              },
            };
          },
          false,
          "chat/prependMessages"
        ),

      setPagination: (conversationId, hasMore, nextCursor) =>
        set(
          (state) => ({
            pagination: {
              ...state.pagination,
              [conversationId]: { hasMore, nextCursor },
            },
          }),
          false,
          "chat/setPagination"
        ),

      markConversationAsRead: (conversationId) =>
        set(
          (state) => {
            const prevUnread =
              state.conversations.find((c) => c.id === conversationId)?.unreadCount ?? 0;
            const nextUnread = Math.max(0, state.unreadCount - prevUnread);

            return {
              messages: {
                ...state.messages,
                [conversationId]: (state.messages[conversationId] || []).map(
                  (m) => ({ ...m, isRead: true })
                ),
              },
              // Zera o unreadCount da conversa na lista
              conversations: state.conversations.map((c) =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
              ),
              unreadCount: nextUnread,
            };
          },
          false,
          "chat/markAsRead"
        ),

      setTyping: (userId, conversationId, isTyping) =>
        set(
          (state) => {
            const filtered = state.typingUsers.filter(
              (t) =>
                !(
                  t.userId === userId &&
                  t.conversationId === conversationId
                )
            );
            return {
              typingUsers: isTyping
                ? [...filtered, { userId, conversationId }]
                : filtered,
            };
          },
          false,
          "chat/setTyping"
        ),

      setUserOnline: (userId, online) =>
        set(
          (state) => {
            const newSet = new Set(state.onlineUsers);
            if (online) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return { onlineUsers: newSet };
          },
          false,
          "chat/setUserOnline"
        ),

      setUnreadCount: (count) =>
        set({ unreadCount: count }, false, "chat/setUnreadCount"),

      incrementUnread: (conversationId) => {
        let nextUnread = 0;
        set(
          (state) => {
            const updated = state.conversations.map((c) => {
              if (c.id !== conversationId) return c;
              const current = c.unreadCount ?? 0;
              return { ...c, unreadCount: current + 1 };
            });
            nextUnread = state.unreadCount + 1;
            return { conversations: updated, unreadCount: nextUnread };
          },
          false,
          "chat/incrementUnread"
        );
        return nextUnread;
      },

      updateConversationLastMessage: (conversationId, content, date) =>
        set(
          (state) => {
            // Move a conversa atualizada para o topo
            const updated = state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, lastMessage: content, lastMessageAt: date }
                : c
            );
            updated.sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime()
            );
            return { conversations: updated };
          },
          false,
          "chat/updateLastMessage"
        ),

      addConversation: (conversation) =>
        set(
          (state) => ({
            conversations: [conversation, ...state.conversations],
          }),
          false,
          "chat/addConversation"
        ),

      setLoadingConversations: (loading) =>
        set({ isLoadingConversations: loading }, false, "chat/setLoadingConvs"),

      setLoadingMessages: (loading) =>
        set({ isLoadingMessages: loading }, false, "chat/setLoadingMsgs"),

      setLoadingMore: (loading) =>
        set({ isLoadingMore: loading }, false, "chat/setLoadingMore"),

      openFloatingChat: (conversationId) => {
        set(
          { floatingConversationId: conversationId, isFloatingOpen: true },
          false,
          "chat/openFloatingChat"
        );
        try {
          localStorage.setItem("floatingChat", JSON.stringify({ id: conversationId }));
        } catch { /* SSR safe */ }
      },

      closeFloatingChat: () => {
        set(
          { isFloatingOpen: false, floatingConversationId: null },
          false,
          "chat/closeFloatingChat"
        );
        try {
          localStorage.removeItem("floatingChat");
        } catch { /* SSR safe */ }
      },

      toggleFloatingChat: () =>
        set(
          (state) => ({ isFloatingOpen: !state.isFloatingOpen }),
          false,
          "chat/toggleFloatingChat"
        ),

      reset: () => {
        set(initialState, false, "chat/reset");
        // Nota: NÃO limpa localStorage("floatingChat") aqui porque reset()
        // é chamado durante a hidratação do userStore (isLoggedIn momentaneamente false).
        // A limpeza do localStorage acontece apenas em closeFloatingChat().
      },
    }),
    { name: "ChatStore", enabled: process.env.NODE_ENV === "development" }
  )
);
