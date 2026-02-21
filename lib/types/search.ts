import { Genre } from './genre';
import { Instrument } from './instrument';

export type SearchUserTypeFilter = 'musician' | 'client' | 'all';
export type SearchResultUserType = 'MUSICIAN' | 'CLIENT';
export type SearchSortBy = 'rating' | 'price-low' | 'price-high' | 'newest' | 'verified';

export const DEFAULT_SORT_BY_BY_USER_TYPE: Record<SearchUserTypeFilter, SearchSortBy> = {
  all: 'newest',
  musician: 'rating',
  client: 'newest',
};

export const ALLOWED_SORT_BY_BY_USER_TYPE: Record<SearchUserTypeFilter, SearchSortBy[]> = {
  all: ['newest', 'rating', 'verified'],
  musician: ['rating', 'price-low', 'price-high', 'newest', 'verified'],
  client: ['newest'],
};

export function getDefaultSortByForUserType(userType: SearchUserTypeFilter): SearchSortBy {
  return DEFAULT_SORT_BY_BY_USER_TYPE[userType];
}

export function isSortAllowedForUserType(
  sortBy: SearchSortBy,
  userType: SearchUserTypeFilter,
): boolean {
  return ALLOWED_SORT_BY_BY_USER_TYPE[userType].includes(sortBy);
}

// Parâmetros de busca (baseado no SearchMusiciansDto do backend)
export interface SearchMusiciansParams {
  userType?: SearchUserTypeFilter;
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
  sortBy?: 'rating' | 'priceFrom' | 'eventsCount' | 'createdAt' | 'verified';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResultItem {
  id: number;
  userId: number;
  userType: SearchResultUserType;
  badgeLabel: 'Músico' | 'Contratante';
  name: string;
  profileImageUrl?: string | null;
  photos?: string[];
  category: string | null;
  location: string | null;
  priceFrom: number | null;
  rating: number | null;
  ratingCount: number;
  eventsCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  genres: Genre[];
  instruments: Instrument[];
  createdAt: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedSearchResponse {
  data: SearchResultItem[];
  pagination: SearchPagination;
}

// Estado dos filtros no frontend (inclui campos adicionais para UI)
export interface SearchFilters {
  userType: SearchUserTypeFilter;
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
  musicians: SearchResultItem[];
  pagination: SearchPagination | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  sortBy: SearchSortBy;
  sortOrder: 'asc' | 'desc';
  view: 'grid' | 'list';

  // Actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: SearchSortBy) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setView: (view: 'grid' | 'list') => void;
  setPage: (page: number) => void;
  search: () => Promise<void>;
}

// Filtros padrão
export const defaultFilters: SearchFilters = {
  userType: 'all',
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
