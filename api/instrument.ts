import { Instrument } from '@/lib/types/instrument';
import { getApiBaseUrl } from '@/lib/env';

const API_URL = getApiBaseUrl();

/**
 * Busca todos os instrumentos cadastrados
 */
export async function fetchInstruments(): Promise<Instrument[]> {
  const response = await fetch(`${API_URL}/instruments`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao buscar instrumentos');
  }

  return response.json();
}
