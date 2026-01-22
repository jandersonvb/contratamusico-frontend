// Tipos baseados na API IBGE do backend

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

export interface LocationState {
  states: IBGEState[];
  cities: IBGECity[];
  selectedState: string | null;
  isLoadingStates: boolean;
  isLoadingCities: boolean;
  error: string | null;

  // Actions
  fetchStates: () => Promise<void>;
  fetchCities: (uf: string) => Promise<void>;
  setSelectedState: (uf: string | null) => void;
  clearCities: () => void;
}

