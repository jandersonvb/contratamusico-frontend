import { Genre } from '@/lib/types/genre';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

