// Define os tipos de usuário conforme o Prisma/Backend
export enum UserType {
  CLIENT = 'CLIENT',
  MUSICIAN = 'MUSICIAN',
}

// Interface baseada no retorno do backend (UserWithProfile)
export interface MusicianGenre {
  id: number;
  name: string;
  slug: string;
}

export interface MusicianInstrument {
  id: number;
  name: string;
  slug: string;
}

export interface UserMusicianProfile {
  id: number;
  category?: string;
  bio?: string;
  location?: string;
  priceFrom?: number;
  experience?: string;
  equipment?: string;
  availability?: string;
  rating?: number;
  ratingCount?: number;
  eventsCount?: number;
  satisfactionRate?: number;
  responseTime?: string;
  isFeatured?: boolean;
  genres: MusicianGenre[];
  instruments: MusicianInstrument[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  city?: string;
  state?: string;
  musicianProfile?: UserMusicianProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  isLoggedIn: boolean;
  error: string | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (data: UpdateUserData) => Promise<void>;
}

// Tipos para Login
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// DTO para atualização de usuário (espelha UpdateUserDto do backend)
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
}

// DTO para registro de usuário
export interface RegisterUserData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  city?: string;
  state?: string;
  terms: boolean;
  // Campos específicos para músicos
  instruments?: string[]; // Array de slugs de instrumentos
  genres?: string[]; // Array de slugs de gêneros
  experience?: string;
  priceRange?: string;
}