// Define os tipos de usuário conforme o Prisma/Backend
export enum UserType {
  CLIENT = 'CLIENT',
  MUSICIAN = 'MUSICIAN',
}

// Interface baseada no retorno do backend (UserWithProfile)
export interface MusicianProfile {
  id: number;
  userId: number;
  experience?: string;
  priceFrom?: number;
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
  musicianProfile?: MusicianProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
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