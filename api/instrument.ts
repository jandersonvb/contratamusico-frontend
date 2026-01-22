import { Instrument } from '@/lib/types/instrument';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

