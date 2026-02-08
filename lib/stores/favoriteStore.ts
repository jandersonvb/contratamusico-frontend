import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { addFavorite, removeFavorite, getMyFavorites } from '@/api/favorite';
import type { Favorite } from '@/api/favorite';

interface FavoriteState {
  /** Lista completa de favoritos do usuário */
  favorites: Favorite[];
  /** Set de musicianProfileIds para lookup O(1) */
  favoriteIds: Set<number>;
  /** Indica se está carregando os favoritos */
  isLoading: boolean;
  /** IDs de músicos sendo toggled (para loading individual) */
  togglingIds: Set<number>;

  // Actions
  /** Carrega todos os favoritos do backend */
  fetchFavorites: () => Promise<void>;
  /** Adiciona ou remove favorito (toggle) - retorna novo estado (true=favoritou) */
  toggleFavorite: (musicianProfileId: number) => Promise<boolean>;
  /** Verifica se um músico está nos favoritos (síncrono, via cache local) */
  isFavorite: (musicianProfileId: number) => boolean;
  /** Verifica se um músico está sendo toggled */
  isToggling: (musicianProfileId: number) => boolean;
  /** Número total de favoritos */
  count: () => number;
  /** Limpa todos os favoritos (usado no logout) */
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  devtools(
    (set, get) => ({
      favorites: [],
      favoriteIds: new Set(),
      isLoading: false,
      togglingIds: new Set(),

      fetchFavorites: async () => {
        // Evita chamadas duplicadas
        if (get().isLoading) return;

        set({ isLoading: true }, false, 'favorites/fetchStart');

        try {
          const data = await getMyFavorites();
          const ids = new Set(data.map((f) => f.musicianProfileId));
          set(
            { favorites: data, favoriteIds: ids, isLoading: false },
            false,
            'favorites/fetchSuccess'
          );
        } catch {
          set({ isLoading: false }, false, 'favorites/fetchError');
        }
      },

      toggleFavorite: async (musicianProfileId: number) => {
        const { favoriteIds, togglingIds } = get();

        // Evita duplo clique
        if (togglingIds.has(musicianProfileId)) {
          return favoriteIds.has(musicianProfileId);
        }

        // Marca como toggling
        const newTogglingIds = new Set(togglingIds);
        newTogglingIds.add(musicianProfileId);
        set({ togglingIds: newTogglingIds }, false, 'favorites/toggleStart');

        const wasFavorite = favoriteIds.has(musicianProfileId);

        try {
          if (wasFavorite) {
            await removeFavorite(musicianProfileId);
            set(
              (state) => {
                const newIds = new Set(state.favoriteIds);
                newIds.delete(musicianProfileId);
                const newToggling = new Set(state.togglingIds);
                newToggling.delete(musicianProfileId);
                return {
                  favorites: state.favorites.filter(
                    (f) => f.musicianProfileId !== musicianProfileId
                  ),
                  favoriteIds: newIds,
                  togglingIds: newToggling,
                };
              },
              false,
              'favorites/removed'
            );
            return false;
          } else {
            const response = await addFavorite(musicianProfileId);
            set(
              (state) => {
                const newIds = new Set(state.favoriteIds);
                newIds.add(musicianProfileId);
                const newToggling = new Set(state.togglingIds);
                newToggling.delete(musicianProfileId);
                return {
                  favorites: [...state.favorites, response.favorite],
                  favoriteIds: newIds,
                  togglingIds: newToggling,
                };
              },
              false,
              'favorites/added'
            );
            return true;
          }
        } catch (error) {
          // Remove do toggling em caso de erro
          set(
            (state) => {
              const newToggling = new Set(state.togglingIds);
              newToggling.delete(musicianProfileId);
              return { togglingIds: newToggling };
            },
            false,
            'favorites/toggleError'
          );
          throw error;
        }
      },

      isFavorite: (musicianProfileId: number) => {
        return get().favoriteIds.has(musicianProfileId);
      },

      isToggling: (musicianProfileId: number) => {
        return get().togglingIds.has(musicianProfileId);
      },

      count: () => {
        return get().favoriteIds.size;
      },

      clearFavorites: () => {
        set(
          {
            favorites: [],
            favoriteIds: new Set(),
            isLoading: false,
            togglingIds: new Set(),
          },
          false,
          'favorites/cleared'
        );
      },
    }),
    {
      name: 'FavoriteStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
