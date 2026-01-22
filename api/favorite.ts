const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Favorite {
  id: number;
  userId: number;
  musicianProfileId: number;
  createdAt: string;
  musicianName?: string;
  musicianCategory?: string;
  musicianRating?: number;
}

/**
 * Adiciona um músico aos favoritos
 */
export async function addFavorite(musicianProfileId: number): Promise<Favorite> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para favoritar');
  }

  const response = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ musicianProfileId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao adicionar favorito');
  }

  return response.json();
}

/**
 * Remove um músico dos favoritos
 */
export async function removeFavorite(musicianProfileId: number): Promise<void> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/favorites/${musicianProfileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao remover favorito');
  }
}

/**
 * Busca todos os favoritos do usuário logado
 */
export async function getMyFavorites(): Promise<Favorite[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/favorites`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar favoritos');
  }

  return response.json();
}

/**
 * Verifica se um músico está nos favoritos
 */
export async function isFavorite(musicianProfileId: number): Promise<boolean> {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const favorites = await getMyFavorites();
    return favorites.some(fav => fav.musicianProfileId === musicianProfileId);
  } catch {
    return false;
  }
}

