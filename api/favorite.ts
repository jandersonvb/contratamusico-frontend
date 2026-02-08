const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Dados do músico dentro de um favorito (formato retornado pelo backend)
 */
export interface FavoriteMusician {
  id: number;
  name: string;
  category: string;
  location: string;
  priceFrom: number;
  rating: number;
  ratingCount: number;
  profileImageUrl?: string;
  genres: { id: number; name: string; slug: string }[];
  instruments: { id: number; name: string; slug: string }[];
}

/**
 * Favorito completo retornado pelo backend
 */
export interface Favorite {
  id: number;
  musicianProfileId: number;
  musician: FavoriteMusician;
  createdAt: string;
}

/**
 * Resposta ao adicionar favorito
 */
interface AddFavoriteResponse {
  message: string;
  favorite: Favorite;
}

/**
 * Adiciona um músico aos favoritos
 */
export async function addFavorite(musicianProfileId: number): Promise<AddFavoriteResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para favoritar');
  }

  const response = await fetch(`${API_URL}/favorites/${musicianProfileId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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
export async function checkIsFavorite(musicianProfileId: number): Promise<boolean> {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/favorites/check/${musicianProfileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isFavorite ?? false;
  } catch {
    return false;
  }
}

/**
 * Retorna a contagem de favoritos do usuário
 */
export async function getFavoritesCount(): Promise<number> {
  const token = localStorage.getItem('token');

  if (!token) {
    return 0;
  }

  try {
    const response = await fetch(`${API_URL}/favorites/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

