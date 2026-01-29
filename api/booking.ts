const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Booking {
  id: number;
  musicianProfileId: number;
  clientId: number | null;
  eventDate: string;
  eventType: string;
  message: string;
  status: string;
  musicianName?: string;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  musicianProfileId: number;
  eventDate: string;
  eventType: string;
  message: string;
}

/**
 * Cria uma nova solicitação de booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para solicitar uma contratação');
  }

  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao criar solicitação de contratação');
  }

  return response.json();
}

/**
 * Busca todos os bookings do usuário logado
 */
export async function getMyBookings(): Promise<Booking[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  try {
    const response = await fetch(`${API_URL}/bookings/my-bookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Se for 404 ou erro similar, retorna array vazio ao invés de erro
      if (response.status === 404) {
        console.log('Nenhum booking encontrado');
        return [];
      }
      
      const errorData = await response.json().catch(() => null);
      console.error('Erro na API de bookings:', errorData);
      
      // Se for erro de validação do backend, retorna array vazio
      if (errorData?.message?.includes('Validation failed')) {
        console.warn('Erro de validação ao buscar bookings, retornando lista vazia');
        return [];
      }
      
      throw new Error(errorData?.message || 'Erro ao buscar contratações');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar bookings:', error);
    // Em caso de erro de rede ou outro, retorna array vazio
    return [];
  }
}

/**
 * Atualiza o status de um booking
 */
export async function updateBookingStatus(
  bookingId: number,
  status: string
): Promise<Booking> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao atualizar status da contratação');
  }

  return response.json();
}

