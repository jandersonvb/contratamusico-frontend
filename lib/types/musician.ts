// Tipos baseados no retorno da API /musicians

import { Genre } from './genre';
import { Instrument } from './instrument';

// Músico para listagem (dados resumidos)
export interface MusicianListItem {
  id: number;
  name: string;
  profileImageUrl?: string | null;
  /** Fotos de capa / portfolio para exibir no carrossel do card */
  photos?: string[];
  category: string | null;
  location: string;
  priceFrom: number | null;
  rating: number;
  ratingCount: number;
  eventsCount: number;
  isFeatured: boolean;
  genres: Genre[];
  instruments: Instrument[];
}

// Review de um músico
export interface MusicianReview {
  id: number;
  rating: number;
  content: string;
  date: string;
  event: string;
  clientName: string;
}

// Portfolio item (alinhado com o backend: mediaUrl e mediaType)
export interface PortfolioItem {
  id: number;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  mediaUrl: string;
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  genre?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Perfil completo do músico
export interface MusicianProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl?: string | null;
  category: string | null;
  bio: string | null;
  location: string;
  priceFrom: number | null;
  experience: string | null;
  equipment: string | null;
  availability: string | null;
  rating: number;
  ratingCount: number;
  eventsCount: number;
  satisfactionRate: number | null;
  responseTime: string | null;
  isFeatured: boolean;
  genres: Genre[];
  instruments: Instrument[];
  portfolio: PortfolioItem[];
  reviews: MusicianReview[];
  createdAt: string;
  updatedAt: string;
}

// Resposta paginada da busca de músicos
export interface PaginatedMusiciansResponse {
  data: MusicianListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

