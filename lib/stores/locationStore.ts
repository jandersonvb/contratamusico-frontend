import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchStates, fetchCities } from '@/api/location';
import { LocationState } from '../types/location';

export const useLocationStore = create<LocationState>()(
  devtools(
    (set, get) => ({
      states: [],
      cities: [],
      selectedState: null,
      isLoadingStates: false,
      isLoadingCities: false,
      error: null,

      fetchStates: async () => {
        // Se já tem estados carregados, não busca novamente
        if (get().states.length > 0 || get().isLoadingStates) return;

        set({ isLoadingStates: true, error: null }, false, 'location/fetchStatesStart');

        try {
          const states = await fetchStates();
          set({ states, isLoadingStates: false }, false, 'location/fetchStatesSuccess');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar estados';
          set({ error: message, isLoadingStates: false }, false, 'location/fetchStatesError');
        }
      },

      fetchCities: async (uf: string) => {
        if (get().isLoadingCities) return;

        set({ isLoadingCities: true, error: null, selectedState: uf }, false, 'location/fetchCitiesStart');

        try {
          const cities = await fetchCities(uf);
          set({ cities, isLoadingCities: false }, false, 'location/fetchCitiesSuccess');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar cidades';
          set({ error: message, isLoadingCities: false, cities: [] }, false, 'location/fetchCitiesError');
        }
      },

      setSelectedState: (uf: string | null) => {
        set({ selectedState: uf }, false, 'location/setSelectedState');
        if (uf) {
          get().fetchCities(uf);
        } else {
          get().clearCities();
        }
      },

      clearCities: () => {
        set({ cities: [], selectedState: null }, false, 'location/clearCities');
      },
    }),
    {
      name: 'LocationStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

