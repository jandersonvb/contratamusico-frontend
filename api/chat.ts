const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function buildApiPath(path: string, useLegacyChatPrefix = false) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!useLegacyChatPrefix) {
    return `${API_URL}${normalizedPath}`;
  }

  if (normalizedPath.startsWith('/chat/')) {
    return `${API_URL}${normalizedPath}`;
  }

  return `${API_URL}/chat${normalizedPath}`;
}


function getChatMessagesEndpoint() {
  const trimmedApiUrl = API_URL.replace(/\/$/, '');
  return trimmedApiUrl.endsWith('/chat')
    ? `${trimmedApiUrl}/messages`
    : `${trimmedApiUrl}/chat/messages`;
}

/**
 * Wrapper de fetch com retry automático para erros 429 (Too Many Requests).
 * Usa backoff exponencial: 1s, 2s, 4s...
 */
async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(input, init);

    if (response.status !== 429) {
      return response;
    }

    // Última tentativa — retorna a resposta 429 para o caller tratar
    if (attempt === maxRetries) {
      return response;
    }

    // Respeita o header Retry-After se presente, senão usa backoff exponencial
    const retryAfter = response.headers.get('Retry-After');
    const delayMs = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : Math.min(1000 * Math.pow(2, attempt), 8000);

    lastError = new Error(`429 Too Many Requests (tentativa ${attempt + 1}/${maxRetries})`);
    console.warn(`[API] Rate limited. Retentando em ${delayMs}ms...`, lastError.message);

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // Fallback (não deveria chegar aqui)
  throw lastError ?? new Error('fetchWithRetry: erro inesperado');
}

async function fetchWithChatFallback(
  path: string,
  init?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  const primaryResponse = await fetchWithRetry(buildApiPath(path), init, maxRetries);

  if (primaryResponse.ok) {
    return primaryResponse;
  }

  // Compatibilidade com backends mais antigos que expõem rotas em /chat/*
  if (primaryResponse.status !== 404 && primaryResponse.status < 500) {
    return primaryResponse;
  }

  return fetchWithRetry(buildApiPath(path, true), init, maxRetries);
}

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
  userAId?: number;
  userBId?: number;
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
  conversationId?: number;
  recipientUserId?: number;
  musicianProfileId?: number;
  content: string;
}

export interface SendMessageResponse {
  id?: number;
  conversationId?: number;
  senderId?: number;
  content?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor: number | null;
}

/**
 * Normaliza os dados da conversa para garantir formato consistente
 */
function normalizeConversation(conv: Record<string, unknown>): Conversation {
  const rawLastMessage = conv.lastMessage;
  const rawOtherParty = conv.otherParty as ConversationParticipant | undefined;

  // Normaliza lastMessage se for objeto
  const lastMessageContent =
    rawLastMessage &&
    typeof rawLastMessage === "object" &&
    "content" in rawLastMessage &&
    typeof (rawLastMessage as { content?: unknown }).content === "string"
      ? (rawLastMessage as { content: string }).content
      : typeof rawLastMessage === "string"
      ? rawLastMessage
      : "";

  // Garante que IDs são números
  const id = typeof conv.id === "number" ? conv.id : parseInt(String(conv.id));
  const clientId = conv.clientId
    ? typeof conv.clientId === "number"
      ? conv.clientId
      : parseInt(String(conv.clientId))
    : undefined;
  const musicianProfileId = conv.musicianProfileId
    ? typeof conv.musicianProfileId === "number"
      ? conv.musicianProfileId
      : parseInt(String(conv.musicianProfileId))
    : undefined;
  const userAId = conv.userAId
    ? typeof conv.userAId === "number"
      ? conv.userAId
      : parseInt(String(conv.userAId))
    : undefined;
  const userBId = conv.userBId
    ? typeof conv.userBId === "number"
      ? conv.userBId
      : parseInt(String(conv.userBId))
    : undefined;
  const unreadCount =
    typeof conv.unreadCount === "number" ? conv.unreadCount : undefined;

  const normalized = {
    id,
    userAId,
    userBId,
    clientId,
    musicianProfileId,
    lastMessageAt: String(conv.lastMessageAt ?? ''),
    createdAt: String(conv.createdAt ?? ''),
    unreadCount,
    clientName: rawOtherParty?.type === 'client' ? rawOtherParty.name : (conv.clientName as string | undefined),
    musicianName: rawOtherParty?.type === 'musician' ? rawOtherParty.name : (conv.musicianName as string | undefined),
    lastMessage: lastMessageContent,
    otherParty: rawOtherParty,
  };
  
  console.log('✅ Conversa normalizada:', {
    id: normalized.id,
    musicianProfileId: normalized.musicianProfileId,
    clientId: normalized.clientId,
    otherPartyName: rawOtherParty?.name
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

  const response = await fetchWithChatFallback('/conversations', {
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
  return Array.isArray(data)
    ? data.map((conversation) => normalizeConversation(conversation as Record<string, unknown>))
    : [];
}

/**
 * Busca mensagens de uma conversa específica
 */
export async function getConversationMessages(conversationId: number): Promise<Message[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetchWithChatFallback(`/conversations/${conversationId}`, {
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
 * Busca mensagens paginadas de uma conversa (infinite scroll)
 * Primeira chamada: sem cursor (carrega as 50 mais recentes)
 * Chamadas seguintes: envia nextCursor para carregar mais antigas
 */
export async function getConversationMessagesPaginated(
  conversationId: number,
  cursor?: number,
  take: number = 50
): Promise<PaginatedMessagesResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const params = new URLSearchParams();
  if (cursor) params.set('cursor', String(cursor));
  params.set('take', String(take));

  const response = await fetchWithChatFallback(
    `/conversations/${conversationId}/messages?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || 'Erro ao buscar mensagens';
    throw new Error(errorMessage);
  }

  const data = await response.json();

  return {
    messages: Array.isArray(data.messages) ? data.messages : [],
    hasMore: data.hasMore ?? false,
    nextCursor: data.nextCursor ?? null,
  };
}

/**
 * Envia uma mensagem
 */
export async function sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para enviar mensagens');
  }

  const { conversationId, recipientUserId, musicianProfileId, content } = data;

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  let response: Response;

  // Mantém compatibilidade com backend atual: envio via rota legada /chat/messages.
  if (conversationId && typeof conversationId === 'number' && !isNaN(conversationId)) {
    response = await fetch(getChatMessagesEndpoint(), {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ conversationId, content }),
    });
  } else {
    if (!recipientUserId || typeof recipientUserId !== 'number' || isNaN(recipientUserId)) {
      throw new Error('ID do destinatário inválido');
    }

    response = await fetch(getChatMessagesEndpoint(), {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ recipientUserId, musicianProfileId, content }),
    });
  }

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

  const response = await fetchWithChatFallback(`/conversations/${conversationId}/read`, {
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
    const response = await fetchWithChatFallback('/conversations/unread/count', {
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
