import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchInstruments } from '@/api/instrument';
import { InstrumentState } from '../types/instrument';

export const useInstrumentStore = create<InstrumentState>()(
  devtools(
    (set, get) => ({
      instruments: [],
      isLoading: false,
      error: null,

      fetchInstruments: async () => {
        // Se já tem instrumentos carregados, não busca novamente
        if (get().instruments.length > 0 || get().isLoading) return;

        set({ isLoading: true, error: null }, false, 'instrument/fetchStart');

        try {
          const instruments = await fetchInstruments();
          set({ instruments, isLoading: false }, false, 'instrument/fetchSuccess');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao buscar instrumentos';
          set({ error: message, isLoading: false }, false, 'instrument/fetchError');
        }
      },
    }),
    {
      name: 'InstrumentStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

