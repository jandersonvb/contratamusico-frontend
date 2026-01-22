// Tipos para busca de músicos

import { MusicianListItem, PaginatedMusiciansResponse } from './musician';

// Parâmetros de busca (baseado no SearchMusiciansDto do backend)
export interface SearchMusiciansParams {
  genres?: string[];
  instruments?: string[];
  city?: string;
  state?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'priceFrom' | 'eventsCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Estado dos filtros no frontend (inclui campos adicionais para UI)
export interface SearchFilters {
  city: string;
  state: string;
  instruments: string[];
  genres: string[];
  priceMin: string;
  priceMax: string;
  rating: string;
  search: string;
  date: string;
  availability: string[];
}

// Estado da store de busca
export interface SearchState {
  // Filtros
  filters: SearchFilters;
  
  // Resultados
  musicians: MusicianListItem[];
  pagination: PaginatedMusiciansResponse['pagination'] | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  view: 'grid' | 'list';

  // Actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setView: (view: 'grid' | 'list') => void;
  setPage: (page: number) => void;
  search: () => Promise<void>;
}

// Filtros padrão
export const defaultFilters: SearchFilters = {
  city: '',
  state: '',
  instruments: [],
  genres: [],
  priceMin: '',
  priceMax: '',
  rating: '',
  search: '',
  date: '',
  availability: [],
};

