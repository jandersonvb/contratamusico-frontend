import { IBGEState, IBGECity } from '@/lib/types/location';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Busca todos os estados brasileiros
 */
export async function fetchStates(): Promise<IBGEState[]> {
  const response = await fetch(`${API_URL}/locations/states`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao buscar estados');
  }

  return response.json();
}

/**
 * Busca cidades de um estado específico
 * @param uf Sigla do estado (ex: SP, RJ, MG)
 */
export async function fetchCities(uf: string): Promise<IBGECity[]> {
  const response = await fetch(`${API_URL}/locations/cities/${uf.toUpperCase()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Falha ao buscar cidades de ${uf}`);
  }

  return response.json();
}

