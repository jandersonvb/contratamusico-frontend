// Tipo baseado no retorno do endpoint /instruments

export interface Instrument {
  id: number;
  name: string;
  slug: string;
}

export interface InstrumentState {
  instruments: Instrument[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchInstruments: () => Promise<void>;
}

