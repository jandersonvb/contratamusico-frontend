import { LoginCredentials, AuthResponse, User, RegisterUserData } from '../lib/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao realizar login');
    }

    return response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao realizar login');
  }



}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao solicitar recuperação de senha');
    }

    return response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao solicitar recuperação de senha');
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao redefinir senha');
    }

    return response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao redefinir senha');
  }
}

export async function fetchUserDataFromApi(): Promise<User> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/users/me`, {
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

export async function registerUser(data: RegisterUserData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao realizar cadastro');
    }

    return response.json();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao realizar cadastro');
  }
}