import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { searchMusicians } from '@/api/musician';
import { SearchState, SearchFilters, defaultFilters, SearchMusiciansParams } from '../types/search';

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
      sortBy: 'rating',
      sortOrder: 'desc',
      view: 'grid',

      // Actions
      setFilters: (newFilters: Partial<SearchFilters>) => {
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
          }),
          false,
          'search/setFilters'
        );
      },

      clearFilters: () => {
        set({ filters: { ...defaultFilters } }, false, 'search/clearFilters');
      },

      setSortBy: (sortBy: string) => {
        set({ sortBy }, false, 'search/setSortBy');
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
            pagination: state.pagination ? { ...state.pagination, page } : null,
          }),
          false,
          'search/setPage'
        );
      },

      search: async () => {
        const { filters, sortBy, sortOrder, pagination } = get();

        set({ isLoading: true, error: null }, false, 'search/searchStart');

        try {
          // Converte filtros do frontend para parâmetros da API
          const params: SearchMusiciansParams = {
            page: pagination?.page || 1,
            limit: 12,
            sortOrder,
          };

          // Mapeia sortBy do frontend para o backend
          if (sortBy === 'rating') params.sortBy = 'rating';
          else if (sortBy === 'price-low') {
            params.sortBy = 'priceFrom';
            params.sortOrder = 'asc';
          } else if (sortBy === 'price-high') {
            params.sortBy = 'priceFrom';
            params.sortOrder = 'desc';
          } else if (sortBy === 'newest') params.sortBy = 'createdAt';

          // Filtros de localização
          if (filters.city) params.city = filters.city;
          if (filters.state && filters.state !== 'all') params.state = filters.state;

          // Filtros de gêneros e instrumentos (usa slugs)
          if (filters.genres.length > 0) params.genres = filters.genres;
          if (filters.instruments.length > 0) params.instruments = filters.instruments;

          // Filtros de preço
          if (filters.priceMin) params.priceMin = parseInt(filters.priceMin, 10);
          if (filters.priceMax) params.priceMax = parseInt(filters.priceMax, 10);

          // Filtro de rating
          if (filters.rating) params.rating = parseInt(filters.rating, 10);

          // Busca textual
          if (filters.search) params.search = filters.search;

          const response = await searchMusicians(params);

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
          const message = error instanceof Error ? error.message : 'Erro ao buscar músicos';
          set({ error: message, isLoading: false, musicians: [] }, false, 'search/searchError');
        }
      },
    }),
    {
      name: 'SearchStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

