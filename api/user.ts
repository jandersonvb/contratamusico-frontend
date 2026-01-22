import { User, UpdateUserData } from "@/lib/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Busca dados do usuário logado (alternativa ao auth.ts)
 * @deprecated Use fetchUserDataFromApi de api/auth.ts
 */
export async function fetchUserDataFromApi(): Promise<User> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Falha ao buscar dados do usuário: ${response.status}`);
  }

  return response.json();
}

/**
 * Atualiza dados do usuário logado
 * PATCH /users/me
 */
export async function updateUserApi(data: UpdateUserData): Promise<User> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Falha ao atualizar dados do usuário');
  }

  return response.json();
}