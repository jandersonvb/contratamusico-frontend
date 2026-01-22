// Tipo baseado no retorno do endpoint /genres

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface GenreState {
  genres: Genre[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGenres: () => Promise<void>;
}

