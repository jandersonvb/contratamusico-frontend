import { PublicClientProfile, UpdateUserData, User } from "@/lib/types/user";

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

/**
 * Upload de foto de perfil (avatar)
 * POST /users/me/avatar
 */
export async function uploadAvatar(file: File): Promise<User> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  // Validações client-side
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao fazer upload da imagem');
  }

  return response.json();
}

/**
 * Busca perfil público de um contratante por ID
 * GET /users/clients/:id
 */
export async function fetchPublicClientById(id: number): Promise<PublicClientProfile> {
  if (!id || Number.isNaN(id) || id <= 0) {
    throw new Error("ID do contratante inválido");
  }

  const response = await fetch(`${API_URL}/users/clients/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Contratante não encontrado");
    }

    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Falha ao buscar perfil do contratante");
  }

  return response.json();
}
