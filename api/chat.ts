const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: number;
  clientId: number;
  musicianProfileId: number;
  lastMessageAt: string;
  createdAt: string;
  clientName?: string;
  musicianName?: string;
  unreadCount?: number;
  lastMessage?: string;
}

export interface SendMessageData {
  recipientId: number;
  content: string;
}

/**
 * Busca todas as conversas do usuário logado
 */
export async function getMyConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/chat/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar conversas');
  }

  return response.json();
}

/**
 * Busca mensagens de uma conversa específica
 */
export async function getConversationMessages(conversationId: number): Promise<Message[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar mensagens');
  }

  return response.json();
}

/**
 * Envia uma mensagem
 */
export async function sendMessage(data: SendMessageData): Promise<Message> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para enviar mensagens');
  }

  const response = await fetch(`${API_URL}/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao enviar mensagem');
  }

  return response.json();
}

/**
 * Marca mensagens como lidas
 */
export async function markMessagesAsRead(conversationId: number): Promise<void> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/mark-read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao marcar mensagens como lidas');
  }
}

