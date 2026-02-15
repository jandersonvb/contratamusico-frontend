const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthToken(): string {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token não encontrado');
  }
  return token;
}

export interface ReviewItem {
  id: number;
  rating: number;
  content: string;
  date: string;
  event: string;
  clientName: string;
  createdAt: string;
}

export interface ReviewListResponse {
  data: ReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CreateReviewData {
  rating: number;
  content: string;
  event: string;
}

export interface ReviewStatsResponse {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export class ReviewApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ReviewApiError';
    this.status = status;
  }
}

function formatReviewDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('pt-BR');
}

function normalizeReview(raw: Record<string, unknown>): ReviewItem {
  const client = (raw.client as Record<string, unknown> | undefined) ?? {};
  const clientName =
    (typeof raw.clientName === 'string' && raw.clientName) ||
    (typeof client.name === 'string' && client.name) ||
    [client.firstName, client.lastName]
      .filter((item): item is string => typeof item === 'string' && item.length > 0)
      .join(' ') ||
    'Cliente';

  const createdAt =
    (typeof raw.createdAt === 'string' && raw.createdAt) ||
    (typeof raw.date === 'string' && raw.date) ||
    new Date().toISOString();

  return {
    id: Number(raw.id ?? 0),
    rating: Number(raw.rating ?? 0),
    content: String(raw.content ?? ''),
    event: String(raw.event ?? raw.eventType ?? ''),
    clientName,
    createdAt,
    date:
      (typeof raw.date === 'string' && raw.date) ||
      formatReviewDate(createdAt),
  };
}

function normalizeReviewList(raw: unknown): ReviewListResponse {
  const payload = (raw ?? {}) as Record<string, unknown>;
  const rawData = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(raw)
      ? raw
      : [];
  const paginationPayload = (payload.pagination ?? {}) as Record<string, unknown>;

  const page = Number(paginationPayload.page ?? 1);
  const limit = Number(paginationPayload.limit ?? 10);
  const total =
    Number(paginationPayload.total ?? rawData.length);
  const totalPages =
    Number(paginationPayload.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit))));

  return {
    data: rawData.map((item) => normalizeReview(item as Record<string, unknown>)),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: Boolean(paginationPayload.hasMore ?? page < totalPages),
    },
  };
}

function normalizeRatingDistribution(
  source?: Record<string, unknown>
): Record<'1' | '2' | '3' | '4' | '5', number> | undefined {
  if (!source) return undefined;

  return {
    '1': Number(source['1'] ?? 0),
    '2': Number(source['2'] ?? 0),
    '3': Number(source['3'] ?? 0),
    '4': Number(source['4'] ?? 0),
    '5': Number(source['5'] ?? 0),
  };
}

function normalizeReviewStats(raw: unknown): ReviewStatsResponse {
  const payload = (raw ?? {}) as Record<string, unknown>;
  const distributionSource =
    (payload.ratingDistribution as Record<string, unknown> | undefined) ||
    (payload.distribution as Record<string, unknown> | undefined);

  return {
    averageRating: Number(payload.averageRating ?? payload.avgRating ?? 0),
    totalReviews: Number(payload.totalReviews ?? payload.count ?? 0),
    ratingDistribution: normalizeRatingDistribution(distributionSource),
  };
}

async function buildReviewError(response: Response, fallbackMessage: string): Promise<ReviewApiError> {
  const errorData = (await response.json().catch(() => null)) as
    | { message?: string | string[]; error?: string }
    | null;

  const messageFromArray = Array.isArray(errorData?.message)
    ? errorData?.message[0]
    : undefined;
  const messageFromString = typeof errorData?.message === 'string' ? errorData.message : undefined;
  const messageFromError = typeof errorData?.error === 'string' ? errorData.error : undefined;

  const message = messageFromArray || messageFromString || messageFromError || fallbackMessage;
  return new ReviewApiError(response.status, message);
}

/**
 * Cria avaliação para um músico
 */
export async function createReview(
  musicianId: number,
  data: CreateReviewData
): Promise<ReviewItem> {
  const response = await fetch(`${API_URL}/musicians/${musicianId}/reviews`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw await buildReviewError(response, 'Erro ao criar avaliação');
  }

  const result = await response.json();
  return normalizeReview(result as Record<string, unknown>);
}

/**
 * Busca avaliações paginadas de um músico
 */
export async function getMusicianReviews(
  musicianId: number,
  page = 1,
  limit = 10
): Promise<ReviewListResponse> {
  const response = await fetch(`${API_URL}/musicians/${musicianId}/reviews?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw await buildReviewError(response, 'Erro ao buscar avaliações');
  }

  const result = await response.json();
  return normalizeReviewList(result);
}

/**
 * Busca estatísticas de avaliações de um músico
 */
export async function getMusicianReviewStats(
  musicianId: number
): Promise<ReviewStatsResponse> {
  const response = await fetch(`${API_URL}/musicians/${musicianId}/reviews/stats`);

  if (!response.ok) {
    throw await buildReviewError(response, 'Erro ao buscar estatísticas de avaliações');
  }

  const result = await response.json();
  return normalizeReviewStats(result);
}
