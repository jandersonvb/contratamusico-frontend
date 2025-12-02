import { LoginCredentials, AuthResponse, User } from '../lib/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao realizar login');
  }

  return response.json();
}

export async function fetchUserDataFromApi(): Promise<User> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/user/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Se der 401, o token é inválido/expirou
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Falha ao buscar dados do usuário');
  }

  return response.json();
}