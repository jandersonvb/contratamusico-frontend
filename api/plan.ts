const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PlanFeature {
  id: number;
  planId: number;
  text: string;
  available: boolean;
  highlight: boolean;
}

export interface Plan {
  id: number;
  title: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  badge: string | null;
  isMusicianPlan: boolean;
  isClientPlan: boolean;
  features: PlanFeature[];
  createdAt: string;
}

/**
 * Busca todos os planos disponíveis
 */
export async function getPlans(type?: 'musician' | 'client'): Promise<Plan[]> {
  let url = `${API_URL}/plans`;
  
  if (type) {
    url += `?type=${type}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar planos');
  }

  return response.json();
}

/**
 * Busca um plano específico por ID
 */
export async function getPlanById(id: number): Promise<Plan> {
  const response = await fetch(`${API_URL}/plans/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Plano não encontrado');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar plano');
  }

  return response.json();
}

