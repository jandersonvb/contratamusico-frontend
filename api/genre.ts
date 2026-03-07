import { Genre } from '@/lib/types/genre';
import { getApiBaseUrl } from '@/lib/env';

const API_URL = getApiBaseUrl();

/**
 * Busca todos os gêneros musicais cadastrados
 */
export async function fetchGenres(): Promise<Genre[]> {
  const response = await fetch(`${API_URL}/genres`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao buscar gêneros');
  }

  return response.json();
}
