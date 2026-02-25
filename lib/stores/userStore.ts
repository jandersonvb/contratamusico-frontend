import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { fetchUserDataFromApi, loginRequest } from '@/api/auth';
import { updateUserApi } from '@/api/user';
import { sendStoredUtmAfterAuth } from '@/lib/utm';
import { LoginCredentials, User, UserState, UpdateUserData } from '../types/user';

const USER_STORAGE_KEY = 'user-storage';
const TOKEN_STORAGE_KEY = 'token';

const hasStoredToken = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return typeof token === 'string' && token.trim().length > 0;
};

const clearPersistedAuth = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        isUpdating: false,
        isLoggedIn: false,
        error: null,

        // Ação de Login (Chama API e atualiza estado)
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null }, false, 'user/loginStart');
          try {
            const data = await loginRequest(credentials);
            
            // Salva o token
            localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);

            // Busca o usuário completo após login para garantir campos
            // derivados (ex.: profileImageUrl assinada) já no primeiro render.
            let userData = data.user;
            try {
              userData = await fetchUserDataFromApi();
            } catch {
              // Fallback para payload do login se /users/me falhar momentaneamente.
            }

            set({ 
              user: userData, 
              isLoggedIn: true, 
              isLoading: false 
            }, false, 'user/loginSuccess');

            try {
              await sendStoredUtmAfterAuth(data.access_token);
            } catch (utmError) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Falha ao enviar UTM no login:', utmError);
              }
            }

          } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao realizar login';
            set({ error: message, isLoading: false }, false, 'user/loginError');
            throw error; // Re-lança para que o componente de UI possa exibir toast/alerta
          }
        },

        // Busca dados do usuário (usado na reidratação/refresh)
        fetchUser: async () => {
          if (get().isLoading) return;

          const token = localStorage.getItem(TOKEN_STORAGE_KEY);

          if (!token) {
            // Se não tem token, garante que está deslogado
            set(
              { user: null, isLoggedIn: false, isLoading: false, error: null },
              false,
              'user/noTokenFound',
            );
            return;
          }

          set({ isLoading: true, error: null }, false, 'user/fetchUserStart');

          try {
            const userData = await fetchUserDataFromApi();
            set({ user: userData, isLoading: false, isLoggedIn: true }, false, 'user/fetchUserSuccess');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
            
            // Se o erro for Unauthorized (token expirado), desloga
            if (message === 'Unauthorized') {
              get().logout();
              return;
            } else {
              set({ error: message, isLoading: false }, false, 'user/fetchUserError');
            }
          }
        },

        setUser: (user: User) => {
          set({ user, isLoggedIn: true, error: null }, false, 'user/setUser');
        },

        // Atualizar dados do usuário
        updateUser: async (data: UpdateUserData) => {
          set({ isUpdating: true, error: null }, false, 'user/updateStart');
          try {
            const updatedUser = await updateUserApi(data);
            set({ user: updatedUser, isUpdating: false }, false, 'user/updateSuccess');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
            set({ error: message, isUpdating: false }, false, 'user/updateError');
            throw error;
          }
        },

        logout: () => {
          clearPersistedAuth();
          set({ user: null, error: null, isLoggedIn: false, isLoading: false, isUpdating: false }, false, 'user/logout');
          
          // Opcional: Redirecionar via window ou router
          // window.location.href = '/login'; 
        },
      }),
      {
        name: USER_STORAGE_KEY, // Nome no localStorage
        storage: createJSONStorage(() => localStorage),
        // Persistimos o user completo para evitar flash de avatar sem foto após reload
        partialize: (state) => ({ 
          isLoggedIn: state.isLoggedIn,
          user: state.user 
        }),
        
        onRehydrateStorage: () => {
          return (hydratedState) => {
            // Se não existir token ao hidratar, limpa qualquer estado antigo persistido.
            if (!hasStoredToken()) {
              useUserStore.setState(
                {
                  user: null,
                  isLoading: false,
                  isUpdating: false,
                  isLoggedIn: false,
                  error: null,
                },
                false,
                'user/noTokenAfterHydration',
              );
              return;
            }

            // Ao recarregar a página:
            if (hydratedState?.isLoggedIn) {
              // Se estava logado, tenta buscar os dados atualizados do backend
              // Isso garante que os dados estejam sempre sincronizados
              useUserStore.getState().fetchUser();
            }
          };
        },
      }
    ),
    {
      name: 'UserStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
