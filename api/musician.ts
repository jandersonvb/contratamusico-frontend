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
export async function searchMusicians(params: SearchMusiciansParams = {}): Promise<PaginatedMusiciansResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_URL}/musicians${queryString ? `?${queryString}` : ''}`;

  // Inclui token JWT se disponível para excluir o próprio perfil dos resultados
  const headers: HeadersInit = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

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

