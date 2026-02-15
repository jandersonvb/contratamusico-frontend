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

function getChatMediaMessagesEndpoint() {
  const trimmedApiUrl = API_URL.replace(/\/$/, '');
  return trimmedApiUrl.endsWith('/chat')
    ? `${trimmedApiUrl}/messages/media`
    : `${trimmedApiUrl}/chat/messages/media`;
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
  type?: ChatMessageType;
  media?: MessageMedia | null;
  isRead: boolean;
  createdAt: string;
}

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface MessageMedia {
  key: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
  fileName?: string | null;
}

export interface ConversationParticipant {
  id: number;
  name: string;
  profileImageUrl?: string;
  type: 'musician' | 'client';
}

export interface LastMessage {
  content: string;
  type?: ChatMessageType;
  media?: MessageMedia | null;
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
  lastMessage?: string | LastMessage | null;
  otherParty?: ConversationParticipant;
}

export interface SendMessageData {
  conversationId?: number;
  recipientUserId?: number;
  musicianProfileId?: number;
  content: string;
}

export interface SendMediaMessageData {
  file: File;
  conversationId?: number;
  recipientUserId?: number;
  musicianProfileId?: number;
  content?: string;
}

export interface SendMessageResponse {
  id?: number;
  conversationId?: number;
  senderId?: number;
  content?: string;
  type?: ChatMessageType;
  media?: MessageMedia | null;
  isRead?: boolean;
  createdAt?: string;
}

export interface PaginatedMessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor: number | null;
}

function toNumberOrUndefined(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isNaN(n) ? undefined : n;
}

function normalizeMedia(raw: Record<string, unknown>): MessageMedia | null {
  const directMedia = raw.media;

  if (directMedia && typeof directMedia === 'object') {
    const mediaObj = directMedia as Record<string, unknown>;
    if (typeof mediaObj.key === 'string' && mediaObj.key.trim()) {
      return {
        key: mediaObj.key,
        url:
          typeof mediaObj.url === 'string'
            ? mediaObj.url
            : mediaObj.url == null
              ? null
              : String(mediaObj.url),
        mimeType:
          typeof mediaObj.mimeType === 'string'
            ? mediaObj.mimeType
            : mediaObj.mimeType == null
              ? null
              : String(mediaObj.mimeType),
        size: toNumberOrUndefined(mediaObj.size) ?? null,
        fileName:
          typeof mediaObj.fileName === 'string'
            ? mediaObj.fileName
            : mediaObj.fileName == null
              ? null
              : String(mediaObj.fileName),
      };
    }
  }

  if (typeof raw.mediaKey === 'string' && raw.mediaKey.trim()) {
    return {
      key: raw.mediaKey,
      url:
        typeof raw.mediaUrl === 'string'
          ? raw.mediaUrl
          : raw.mediaUrl == null
            ? null
            : String(raw.mediaUrl),
      mimeType:
        typeof raw.mediaMimeType === 'string'
          ? raw.mediaMimeType
          : raw.mediaMimeType == null
            ? null
            : String(raw.mediaMimeType),
      size: toNumberOrUndefined(raw.mediaSize) ?? null,
      fileName:
        typeof raw.mediaFileName === 'string'
          ? raw.mediaFileName
          : raw.mediaFileName == null
            ? null
            : String(raw.mediaFileName),
    };
  }

  return null;
}

function normalizeMessage(raw: unknown): Message {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const media = normalizeMedia(data);
  const type = (typeof data.type === 'string' ? data.type : undefined) as ChatMessageType | undefined;

  return {
    id: toNumberOrUndefined(data.id) ?? 0,
    conversationId: toNumberOrUndefined(data.conversationId) ?? 0,
    senderId: toNumberOrUndefined(data.senderId) ?? 0,
    content: typeof data.content === 'string' ? data.content : '',
    type,
    media,
    isRead: Boolean(data.isRead),
    createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
  };
}

/**
 * Normaliza os dados da conversa para garantir formato consistente
 */
function normalizeConversation(conv: Record<string, unknown>): Conversation {
  const rawLastMessage = conv.lastMessage;
  const rawOtherParty = conv.otherParty as ConversationParticipant | undefined;

  let normalizedLastMessage: string | LastMessage | null = null;
  if (typeof rawLastMessage === 'string') {
    normalizedLastMessage = rawLastMessage;
  } else if (rawLastMessage && typeof rawLastMessage === 'object') {
    const messageObject = rawLastMessage as Record<string, unknown>;
    normalizedLastMessage = {
      content: typeof messageObject.content === 'string' ? messageObject.content : '',
      type:
        typeof messageObject.type === 'string'
          ? (messageObject.type as ChatMessageType)
          : undefined,
      media: normalizeMedia(messageObject),
      createdAt: messageObject.createdAt ? String(messageObject.createdAt) : '',
      isRead: Boolean(messageObject.isRead),
    };
  }

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
    lastMessage: normalizedLastMessage,
    otherParty: rawOtherParty,
  };

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

  const rawMessages = Array.isArray(data)
    ? data
    : Array.isArray(data?.messages)
      ? data.messages
      : [];
  return rawMessages.map((message: unknown) => normalizeMessage(message));
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
    messages: Array.isArray(data.messages)
      ? data.messages.map((message: unknown) => normalizeMessage(message))
      : [],
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

  return normalizeMessage(result.data || result);
}

/**
 * Envia mídia (imagem, vídeo ou áudio)
 */
export async function sendMediaMessage(data: SendMediaMessageData): Promise<SendMessageResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para enviar mensagens');
  }

  const { file, conversationId, recipientUserId, musicianProfileId, content } = data;

  if (!file) {
    throw new Error('Arquivo de mídia é obrigatório');
  }

  const formData = new FormData();
  formData.append('file', file);

  if (content && content.trim()) {
    formData.append('content', content.trim());
  }

  if (conversationId && typeof conversationId === 'number' && !isNaN(conversationId)) {
    formData.append('conversationId', String(conversationId));
  }

  if (recipientUserId && typeof recipientUserId === 'number' && !isNaN(recipientUserId)) {
    formData.append('recipientUserId', String(recipientUserId));
  }

  if (musicianProfileId && typeof musicianProfileId === 'number' && !isNaN(musicianProfileId)) {
    formData.append('musicianProfileId', String(musicianProfileId));
  }

  const response = await fetch(getChatMediaMessagesEndpoint(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || 'Erro ao enviar mídia';
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return normalizeMessage(result.data || result);
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
