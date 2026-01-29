// Tipos para Portfolio baseados no backend

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: MediaType;
  date?: string;
  location?: string;
  genre?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioData {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  genre?: string;
}

export interface UpdatePortfolioData {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  genre?: string;
}

export interface UploadPortfolioFileData extends CreatePortfolioData {
  file: File;
}
