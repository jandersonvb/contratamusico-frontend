import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { searchMusicians } from '@/api/musician';
import {
  SearchFilters,
  SearchMusiciansParams,
  SearchSortBy,
  SearchState,
  defaultFilters,
  getDefaultSortByForUserType,
  isSortAllowedForUserType,
} from '../types/search';

let activeSearchController: AbortController | null = null;
let activeSearchRequestId = 0;

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
  hasMore: false,
};

function clearMusicianOnlyFilters(filters: SearchFilters): SearchFilters {
  return {
    ...filters,
    genres: [],
    instruments: [],
    priceMin: '',
    priceMax: '',
    rating: '',
  };
}

function normalizeSortBy(sortBy: SearchSortBy, userType: SearchFilters['userType']): SearchSortBy {
  if (isSortAllowedForUserType(sortBy, userType)) {
    return sortBy;
  }

  return getDefaultSortByForUserType(userType);
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      // Filtros
      filters: { ...defaultFilters },

      // Resultados
      musicians: [],
      pagination: null,

      // UI State
      isLoading: false,
      error: null,
      sortBy: getDefaultSortByForUserType(defaultFilters.userType),
      sortOrder: 'desc',
      view: 'grid',

      // Actions
      setFilters: (newFilters: Partial<SearchFilters>) => {
        set(
          (state) => {
            const previousUserType = state.filters.userType;
            let nextFilters: SearchFilters = { ...state.filters, ...newFilters };

            if (nextFilters.userType === 'client') {
              nextFilters = clearMusicianOnlyFilters(nextFilters);
            }

            const userTypeChanged =
              typeof newFilters.userType === 'string' &&
              newFilters.userType !== previousUserType;

            const nextSortBy = userTypeChanged
              ? normalizeSortBy(state.sortBy, nextFilters.userType)
              : state.sortBy;

            return {
              filters: nextFilters,
              sortBy: nextSortBy,
              pagination: userTypeChanged
                ? state.pagination
                  ? { ...state.pagination, page: 1 }
                  : { ...DEFAULT_PAGINATION }
                : state.pagination,
            };
          },
          false,
          'search/setFilters'
        );
      },

      clearFilters: () => {
        set(
          {
            filters: { ...defaultFilters },
            sortBy: getDefaultSortByForUserType(defaultFilters.userType),
            pagination: { ...DEFAULT_PAGINATION },
          },
          false,
          'search/clearFilters'
        );
      },

      setSortBy: (sortBy: SearchSortBy) => {
        set(
          (state) => ({
            sortBy: normalizeSortBy(sortBy, state.filters.userType),
          }),
          false,
          'search/setSortBy'
        );
      },

      setSortOrder: (sortOrder: 'asc' | 'desc') => {
        set({ sortOrder }, false, 'search/setSortOrder');
      },

      setView: (view: 'grid' | 'list') => {
        set({ view }, false, 'search/setView');
      },

      setPage: (page: number) => {
        set(
          (state) => ({
            pagination: state.pagination
              ? { ...state.pagination, page }
              : { ...DEFAULT_PAGINATION, page },
          }),
          false,
          'search/setPage'
        );
      },

      search: async () => {
        const { filters, sortBy, sortOrder, pagination } = get();
        const requestId = ++activeSearchRequestId;

        if (activeSearchController) {
          activeSearchController.abort();
        }
        activeSearchController = new AbortController();

        set({ isLoading: true, error: null }, false, 'search/searchStart');

        try {
          // Converte filtros do frontend para parâmetros da API
          const params: SearchMusiciansParams = {
            userType: filters.userType,
            page: pagination?.page || 1,
            limit: 12,
            sortOrder,
          };

          const effectiveSortBy = normalizeSortBy(sortBy, filters.userType);
          if (effectiveSortBy !== sortBy) {
            set({ sortBy: effectiveSortBy }, false, 'search/normalizeSortBy');
          }

          // Mapeia sortBy do frontend para o backend
          if (effectiveSortBy === 'rating') params.sortBy = 'rating';
          else if (effectiveSortBy === 'price-low') {
            params.sortBy = 'priceFrom';
            params.sortOrder = 'asc';
          } else if (effectiveSortBy === 'price-high') {
            params.sortBy = 'priceFrom';
            params.sortOrder = 'desc';
          } else if (effectiveSortBy === 'newest') {
            params.sortBy = 'createdAt';
            params.sortOrder = 'desc';
          } else if (effectiveSortBy === 'verified') {
            params.sortBy = 'verified';
            params.sortOrder = 'desc';
          }

          // Filtros de localização
          if (filters.city) params.city = filters.city;
          if (filters.state && filters.state !== 'all') params.state = filters.state;

          const canUseMusicianOnlyFilters = filters.userType !== 'client';

          // Filtros de gêneros e instrumentos (usa slugs)
          if (canUseMusicianOnlyFilters && filters.genres.length > 0) {
            params.genres = filters.genres;
          }
          if (canUseMusicianOnlyFilters && filters.instruments.length > 0) {
            params.instruments = filters.instruments;
          }

          // Filtros de preço
          if (canUseMusicianOnlyFilters && filters.priceMin) {
            params.priceMin = parseInt(filters.priceMin, 10);
          }
          if (canUseMusicianOnlyFilters && filters.priceMax) {
            params.priceMax = parseInt(filters.priceMax, 10);
          }

          // Filtro de rating
          if (canUseMusicianOnlyFilters && filters.rating) {
            params.rating = parseInt(filters.rating, 10);
          }

          // Busca textual
          if (filters.search) params.search = filters.search;

          const response = await searchMusicians(params, {
            signal: activeSearchController.signal,
          });

          if (requestId !== activeSearchRequestId) return;

          set(
            {
              musicians: response.data,
              pagination: response.pagination,
              isLoading: false,
            },
            false,
            'search/searchSuccess'
          );
        } catch (error) {
          if (requestId !== activeSearchRequestId) return;

          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          const message = error instanceof Error ? error.message : 'Erro ao buscar resultados';
          set({ error: message, isLoading: false, musicians: [] }, false, 'search/searchError');
        } finally {
          if (requestId === activeSearchRequestId) {
            activeSearchController = null;
          }
        }
      },
    }),
    {
      name: 'SearchStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
