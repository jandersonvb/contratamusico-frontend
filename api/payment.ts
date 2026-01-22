import { Plan } from './plan';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreateCheckoutSessionData {
  planId: number;
  billingInterval: 'monthly' | 'yearly';
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface SubscriptionDetail {
  id: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
}

export interface SubscriptionResponse {
  hasSubscription: boolean;
  subscription?: SubscriptionDetail;
}

export interface CancelSubscriptionResponse {
  message: string;
  subscription: SubscriptionDetail;
}

export interface ReactivateSubscriptionResponse {
  message: string;
  subscription: SubscriptionDetail;
}

export interface PortalResponse {
  portalUrl: string;
}

export interface PaymentHistoryItem {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  stripePaymentId: string | null;
  description: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  data: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Cria uma sessão de checkout do Stripe
 */
export async function createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Você precisa estar logado para assinar um plano');
  }

  const response = await fetch(`${API_URL}/payments/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao criar sessão de checkout');
  }

  return response.json();
}

/**
 * Busca a assinatura ativa do usuário
 */
export async function getMySubscription(): Promise<SubscriptionResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/payments/subscription`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar assinatura');
  }

  return response.json();
}

/**
 * Busca histórico de pagamentos do usuário
 */
export async function getPaymentHistory(page: number = 1, limit: number = 10): Promise<PaymentHistoryResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/payments/history?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao buscar histórico de pagamentos');
  }

  return response.json();
}

/**
 * Cancela a assinatura no final do período atual
 */
export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/payments/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao cancelar assinatura');
  }

  return response.json();
}

/**
 * Reativa uma assinatura cancelada
 */
export async function reactivateSubscription(): Promise<ReactivateSubscriptionResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/payments/reactivate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao reativar assinatura');
  }

  return response.json();
}

/**
 * Cria um portal de gerenciamento do Stripe
 */
export async function createPortalSession(returnUrl?: string): Promise<PortalResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/payments/portal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ returnUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erro ao criar portal de gerenciamento');
  }

  return response.json();
}

