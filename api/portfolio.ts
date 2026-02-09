import { PortfolioItem, CreatePortfolioData, UpdatePortfolioData } from "@/lib/types/portfolio";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Upload de arquivo de portfólio (imagem, vídeo ou áudio)
 * POST /musicians/me/portfolio/upload
 */
export async function uploadPortfolioFile(
  file: File,
  data: CreatePortfolioData
): Promise<PortfolioItem> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  // Validações client-side
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  const allAllowedTypes = [...imageTypes, ...videoTypes, ...audioTypes];

  if (!allAllowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use imagens (JPEG, PNG, WebP), vídeos (MP4, WebM, QuickTime) ou áudios (MP3, WAV, OGG)');
  }

  // Validar tamanho baseado no tipo
  let maxSize: number;
  if (imageTypes.includes(file.type)) {
    maxSize = 5 * 1024 * 1024; // 5MB
  } else if (videoTypes.includes(file.type)) {
    maxSize = 50 * 1024 * 1024; // 50MB
  } else {
    maxSize = 10 * 1024 * 1024; // 10MB
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / 1024 / 1024;
    throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', data.title);

  if (data.description) formData.append('description', data.description);
  if (data.date) formData.append('date', data.date);
  if (data.location) formData.append('location', data.location);
  if (data.genre) formData.append('genre', data.genre);

  const response = await fetch(`${API_URL}/musicians/me/portfolio/upload`, {
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

    if (response.status === 403 && errorData?.message) {
      // Retorna a mensagem exata do backend (ex: "Limite de fotos atingido")
      throw new Error(errorData.message);
    }
  
    throw new Error(errorData?.message || 'Erro ao fazer upload do arquivo');
  }

  return response.json();
}

/**
 * Listar itens do meu portfólio
 * GET /musicians/me/portfolio
 */
export async function getMyPortfolio(): Promise<PortfolioItem[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/musicians/me/portfolio`, {
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
    if (response.status === 403) {
      throw new Error('Apenas músicos podem acessar portfólio');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar portfólio');
  }

  return response.json();
}

/**
 * Listar portfólio público de um músico
 * GET /musicians/:id/portfolio
 */
export async function getMusicianPortfolio(musicianId: number): Promise<PortfolioItem[]> {
  const response = await fetch(`${API_URL}/musicians/${musicianId}/portfolio`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar portfólio');
  }

  return response.json();
}

/**
 * Atualizar item do portfólio
 * PATCH /musicians/me/portfolio/:id
 */
export async function updatePortfolioItem(
  itemId: number,
  data: UpdatePortfolioData
): Promise<PortfolioItem> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/musicians/me/portfolio/${itemId}`, {
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
    if (response.status === 404) {
      throw new Error('Item não encontrado');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao atualizar item');
  }

  return response.json();
}

/**
 * Remover item do portfólio
 * DELETE /musicians/me/portfolio/:id
 */
export async function deletePortfolioItem(itemId: number): Promise<void> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/musicians/me/portfolio/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      throw new Error('Item não encontrado');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao remover item');
  }
}
