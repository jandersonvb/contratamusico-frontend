const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CreateContactResponse {
  id: number;
  message: string;
}

export async function createContact(data: CreateContactData): Promise<CreateContactResponse> {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao enviar contato');
  }

  return response.json();
}
