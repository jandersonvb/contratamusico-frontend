const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string | null;
}

export type GroupedFAQResponse = Record<string, FAQItem[]>;

export async function getFaq(category?: string): Promise<FAQItem[]> {
  const params = new URLSearchParams();
  if (category) {
    params.set('category', category);
  }

  const url = `${API_URL}/faq${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar FAQ');
  }

  return response.json();
}

export async function getFaqGrouped(): Promise<GroupedFAQResponse> {
  const response = await fetch(`${API_URL}/faq/grouped`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar FAQ agrupado');
  }

  return response.json();
}

export async function getFaqCategories(): Promise<string[]> {
  const response = await fetch(`${API_URL}/faq/categories`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar categorias de FAQ');
  }

  return response.json();
}
