import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchGenres } from '@/api/genre';
import { GenreState } from '../types/genre';

export const useGenreStore = create<GenreState>()(
  devtools(
    (set, get) => ({
      genres: [],
      isLoading: false,
      error: null,

      fetchGenres: async () => {
        // Se já tem gêneros carregados, não busca novamente
        if (get().genres.length > 0 || get().isLoading) return;

        set({ isLoading: true, error: null }, false, 'genre/fetchStart');

        try {
          const genres = await fetchGenres();
          set({ genres, isLoading: false }, false, 'genre/fetchSuccess');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar gêneros';
          set({ error: message, isLoading: false }, false, 'genre/fetchError');
        }
      },
    }),
    {
      name: 'GenreStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

