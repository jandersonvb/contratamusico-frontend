import { MusicianListItem, MusicianProfile, PaginatedMusiciansResponse } from '@/lib/types/musician';
import { SearchMusiciansParams } from '@/lib/types/search';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Converte os parâmetros de busca para query string
 */
function buildQueryString(params: SearchMusiciansParams): string {
  const searchParams = new URLSearchParams();

  // Arrays (genres, instruments) - adiciona múltiplos valores
  if (params.genres?.length) {
    params.genres.forEach((genre) => searchParams.append('genres', genre));
  }
  if (params.instruments?.length) {
    params.instruments.forEach((instrument) => searchParams.append('instruments', instrument));
  }

  // Strings simples
  if (params.city) searchParams.set('city', params.city);
  if (params.state) searchParams.set('state', params.state);
  if (params.search) searchParams.set('search', params.search);

  // Números
  if (params.priceMin !== undefined) searchParams.set('priceMin', String(params.priceMin));
  if (params.priceMax !== undefined) searchParams.set('priceMax', String(params.priceMax));
  if (params.rating !== undefined) searchParams.set('rating', String(params.rating));
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));

  // Ordenação
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  return searchParams.toString();
}

/**
 * Busca músicos com filtros e paginação
 */
export async function searchMusicians(
  params: SearchMusiciansParams = {},
  options?: { signal?: AbortSignal }
): Promise<PaginatedMusiciansResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_URL}/musicians${queryString ? `?${queryString}` : ''}`;

  // Inclui token JWT se disponível para excluir o próprio perfil dos resultados
  const headers: HeadersInit = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers, signal: options?.signal });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao buscar músicos');
  }

  return response.json();
}

/**
 * Busca músicos em destaque
 * @param limit Número máximo de músicos (padrão: 6)
 */
export async function fetchFeaturedMusicians(limit: number = 6): Promise<MusicianListItem[]> {
  // Garantir que limit é um número válido
  const validLimit = !limit || isNaN(limit) || limit <= 0 ? 6 : limit;
  
  const response = await fetch(`${API_URL}/musicians/featured?limit=${validLimit}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao buscar músicos em destaque');
  }

  return response.json();
}

/**
 * Busca perfil completo de um músico por ID
 */
export async function fetchMusicianById(id: number): Promise<MusicianProfile> {
  // Validar que o ID é um número válido
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('ID do músico inválido');
  }

  const response = await fetch(`${API_URL}/musicians/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Músico não encontrado');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao buscar músico');
  }

  return response.json();
}

export interface UpdateMyMusicianProfileData {
  category?: string;
  bio?: string;
  location?: string;
  priceFrom?: number;
  experience?: string;
  equipment?: string;
  availability?: string;
}

function getAuthToken(): string {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token não encontrado');
  }
  return token;
}

/**
 * Busca o perfil do músico logado
 */
export async function getMyMusicianProfile(): Promise<MusicianProfile> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/musicians/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar perfil do músico');
  }

  return response.json();
}

/**
 * Atualiza dados do perfil do músico logado
 */
export async function updateMyMusicianProfile(
  data: UpdateMyMusicianProfileData
): Promise<MusicianProfile> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/musicians/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao atualizar perfil do músico');
  }

  return response.json();
}

/**
 * Atualiza gêneros do músico logado
 */
export async function updateMyMusicianGenres(genres: string[]): Promise<MusicianProfile> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/musicians/me/genres`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ genres }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao atualizar gêneros');
  }

  return response.json();
}

/**
 * Atualiza instrumentos do músico logado
 */
export async function updateMyMusicianInstruments(instruments: string[]): Promise<MusicianProfile> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}/musicians/me/instruments`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ instruments }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao atualizar instrumentos');
  }

  return response.json();
}
