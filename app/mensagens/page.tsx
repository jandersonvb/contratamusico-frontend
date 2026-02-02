"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/lib/stores/userStore";
import { getMyConversations, getConversationMessages, sendMessage, markMessagesAsRead } from "@/api/chat";
import type { Conversation, Message, LastMessage } from "@/api/chat";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function MensagensPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: userLoading } = useUserStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, userLoading, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchConversations();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      
      // Marca como lida após um delay para evitar rate limit
      setTimeout(() => {
        markMessagesAsRead(selectedConversation.id).then(() => {
          // Dispara evento para atualizar contador na navbar
          window.dispatchEvent(new Event('unread-messages-updated'));
        }).catch(() => {
          // Silently fail - não mostra erro de throttling
        });
      }, 300);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const data = await getMyConversations();
      
      // Garante que data é um array
      const conversationsArray = Array.isArray(data) ? data : [];
      setConversations(conversationsArray);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar conversas';
      // Não mostra erro de throttling
      if (!message.includes('Too Many Requests') && !message.includes('ThrottlerException')) {
        toast.error(message);
      }
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    setIsLoadingMessages(true);
    try {
      const data = await getConversationMessages(conversationId);
      
      // Garante que data é um array
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar mensagens';
      // Não mostra erro de throttling
      if (!message.includes('Too Many Requests') && !message.includes('ThrottlerException')) {
        toast.error(message);
      }
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) {
      return;
    }

    setIsSending(true);

    try {
      const musicianId = selectedConversation.musicianProfileId;

      if (!musicianId || typeof musicianId !== 'number') {
        toast.error('Erro: ID do músico não encontrado na conversa');
        console.error('❌ Erro: musicianProfileId não encontrado', selectedConversation);
        return;
      }

      console.log('📤 Enviando mensagem:', {
        conversationId: selectedConversation.id,
        musicianId,
        contentLength: newMessage.trim().length
      });

      const message = await sendMessage({
        musicianId,
        content: newMessage.trim(),
      });

      setMessages([...messages, message]);
      setNewMessage("");

      // Atualiza a lista de conversas
      fetchConversations();

      // Dispara evento para atualizar contador na navbar
      window.dispatchEvent(new Event('unread-messages-updated'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
      console.error('❌ Erro ao enviar mensagem:', error);
      // Não mostra erro de throttling
      if (!message.includes('Too Many Requests') && !message.includes('ThrottlerException')) {
        toast.error(message);
      }
    } finally {
      setIsSending(false);
    }
  };

  if (userLoading || isLoadingConversations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <section className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Mensagens</h1>

        <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-200px)]">
          {/* Lista de conversas */}
          <Card className="overflow-hidden flex flex-col">
            <CardContent className="p-4 flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma conversa ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations
                    .filter(conversation => conversation && typeof conversation === 'object' && conversation.id)
                    .map((conversation) => {
                      // Determina o nome a exibir
                      const displayName = conversation.otherParty?.name 
                        || conversation.musicianName 
                        || conversation.clientName 
                        || "Sem nome";
                      
                      // Extrai o conteúdo da última mensagem
                      const lastMessageText = typeof conversation.lastMessage === 'object' && conversation.lastMessage !== null
                        ? (conversation.lastMessage as LastMessage).content || ''
                        : (typeof conversation.lastMessage === 'string' ? conversation.lastMessage : '');
                      
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="font-medium truncate">
                            {displayName}
                          </div>
                          {lastMessageText && (
                            <div className="text-sm opacity-80 truncate">
                              {lastMessageText}
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-1">
                            {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString('pt-BR') : ''}
                          </div>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <span className="inline-block mt-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de mensagens */}
          <Card className="overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header da conversa */}
                <div className="border-b p-4">
                  <h2 className="font-semibold">
                    {selectedConversation.otherParty?.name 
                      || selectedConversation.musicianName 
                      || selectedConversation.clientName 
                      || "Sem nome"}
                  </h2>
                </div>

                {/* Mensagens */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Nenhuma mensagem ainda. Inicie a conversa!
                      </p>
                    </div>
                  ) : (
                    messages
                      .filter(message => message && typeof message === 'object' && message.id)
                      .map((message) => {
                        const isMyMessage = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isMyMessage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{String(message.content || '')}</p>
                              <span className="text-xs opacity-70 mt-1 block">
                                {message.createdAt ? new Date(message.createdAt).toLocaleString('pt-BR') : ''}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </CardContent>

                {/* Input de nova mensagem */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecione uma conversa para começar
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

