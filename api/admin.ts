const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAuthToken(): string {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token não encontrado');
  }
  return token;
}

function getAuthHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  };
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalMusicians: number;
  totalClients: number;
  totalBookings: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  recentSignups: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: number;
    client: string;
    musician: string;
    eventType: string;
    eventDate: string;
    status: string;
    createdAt: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  role: string;
  city?: string | null;
  state?: string | null;
  createdAt: string;
}

export interface AdminMusicianItem {
  id: number;
  userId: number;
  name: string;
  email: string;
  category?: string | null;
  location: string;
  rating: number;
  ratingCount: number;
  eventsCount: number;
  isFeatured: boolean;
  createdAt: string;
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar dashboard admin');
  }

  return response.json();
}

export async function getAdminUsers(page = 1, limit = 20): Promise<PaginatedResponse<AdminUserItem>> {
  const response = await fetch(`${API_URL}/admin/users?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar usuários');
  }

  return response.json();
}

export async function getAdminMusicians(page = 1, limit = 20): Promise<PaginatedResponse<AdminMusicianItem>> {
  const response = await fetch(`${API_URL}/admin/musicians?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar músicos');
  }

  return response.json();
}

export async function toggleAdminFeatured(musicianId: number): Promise<{ message: string; isFeatured: boolean }> {
  const response = await fetch(`${API_URL}/admin/musicians/${musicianId}/featured`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao atualizar destaque do músico');
  }

  return response.json();
}
