const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  id: number;
  name: string;
  profileImageUrl?: string;
  type: 'musician' | 'client';
}

export interface LastMessage {
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  clientId?: number;
  musicianProfileId?: number;
  lastMessageAt: string;
  createdAt: string;
  clientName?: string;
  musicianName?: string;
  unreadCount?: number;
  lastMessage?: string | LastMessage;
  otherParty?: ConversationParticipant;
}

export interface SendMessageData {
  musicianId: number;
  content: string;
}

/**
 * Normaliza os dados da conversa para garantir formato consistente
 */
function normalizeConversation(conv: any): Conversation {
  // Normaliza lastMessage se for objeto
  const lastMessageContent = typeof conv.lastMessage === 'object' && conv.lastMessage?.content
    ? conv.lastMessage.content
    : (typeof conv.lastMessage === 'string' ? conv.lastMessage : '');

  // Garante que IDs são números
  const id = typeof conv.id === 'number' ? conv.id : parseInt(conv.id);
  const clientId = conv.clientId ? (typeof conv.clientId === 'number' ? conv.clientId : parseInt(conv.clientId)) : undefined;
  const musicianProfileId = conv.musicianProfileId ? (typeof conv.musicianProfileId === 'number' ? conv.musicianProfileId : parseInt(conv.musicianProfileId)) : undefined;

  const normalized = {
    id,
    clientId,
    musicianProfileId,
    lastMessageAt: conv.lastMessageAt,
    createdAt: conv.createdAt,
    unreadCount: conv.unreadCount,
    clientName: conv.otherParty?.type === 'client' ? conv.otherParty.name : conv.clientName,
    musicianName: conv.otherParty?.type === 'musician' ? conv.otherParty.name : conv.musicianName,
    lastMessage: lastMessageContent,
    otherParty: conv.otherParty,
  };
  
  console.log('✅ Conversa normalizada:', {
    id: normalized.id,
    musicianProfileId: normalized.musicianProfileId,
    clientId: normalized.clientId,
    otherPartyName: conv.otherParty?.name
  });
  
  return normalized;
}

/**
 * Busca todas as conversas do usuário logado
 */
export async function getMyConversations(): Promise<Conversation[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/conversations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || 'Erro ao buscar conversas';
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Normaliza cada conversa
  return Array.isArray(data) ? data.map(normalizeConversation) : [];
}

/**
 * Busca mensagens de uma conversa específica
 */
export async function getConversationMessages(conversationId: number): Promise<Message[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || 'Erro ao buscar mensagens';
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // O backend retorna um objeto com { messages: [...] }
  // Extrai apenas o array de mensagens
  return Array.isArray(data) ? data : (data.messages || []);
}

/**
 * Envia uma mensagem
 */
export async function sendMessage(data: SendMessageData): Promise<Message> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para enviar mensagens');
  }

  const { musicianId, content } = data;

  // Validação do musicianId
  if (!musicianId || typeof musicianId !== 'number' || isNaN(musicianId)) {
    throw new Error('ID do músico inválido');
  }

  const response = await fetch(`${API_URL}/conversations/${musicianId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || 'Erro ao enviar mensagem';
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  // O backend retorna { message: '...', data: {...} }
  // Retorna apenas os dados da mensagem
  return result.data || result;
}

/**
 * Marca mensagens como lidas
 */
export async function markMessagesAsRead(conversationId: number): Promise<void> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || 'Erro ao marcar mensagens como lidas';
    throw new Error(errorMessage);
  }
}

/**
 * Busca o número de mensagens não lidas
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  const token = localStorage.getItem('token');

  if (!token) {
    return { count: 0 };
  }

  try {
    const response = await fetch(`${API_URL}/conversations/unread/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { count: 0 };
    }

    return response.json();
  } catch {
    return { count: 0 };
  }
}

