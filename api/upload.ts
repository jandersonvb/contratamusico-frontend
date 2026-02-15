const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthToken(): string {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token não encontrado');
  }
  return token;
}

export interface SignedUrlResponse {
  key: string;
  url: string;
  expiresIn: number;
}

export interface SignedUrlsResponse {
  urls: Array<{ key: string; url: string }>;
  expiresIn: number;
}

export async function getSignedUrl(
  key: string,
  expiresIn?: number
): Promise<SignedUrlResponse> {
  const params = new URLSearchParams({ key });
  if (expiresIn) {
    params.set('expiresIn', String(expiresIn));
  }

  const response = await fetch(`${API_URL}/upload/signed-url?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao gerar URL assinada');
  }

  return response.json();
}

export async function getSignedUrls(
  keys: string[],
  expiresIn?: number
): Promise<SignedUrlsResponse> {
  const params = new URLSearchParams({ keys: keys.join(',') });
  if (expiresIn) {
    params.set('expiresIn', String(expiresIn));
  }

  const response = await fetch(`${API_URL}/upload/signed-urls?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao gerar URLs assinadas');
  }

  return response.json();
}
