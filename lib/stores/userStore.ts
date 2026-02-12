import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { fetchUserDataFromApi, loginRequest } from '@/api/auth';
import { updateUserApi } from '@/api/user';
import { sendStoredUtmAfterAuth } from '@/lib/utm';
import { LoginCredentials, User, UserState, UpdateUserData } from '../types/user';

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
            localStorage.setItem('token', data.access_token);

            // O backend já retorna o usuário no login, então já setamos aqui
            set({ 
              user: data.user, 
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

          const token = localStorage.getItem('token');

          if (!token) {
            // Se não tem token, garante que está deslogado
            if (get().isLoggedIn) {
               set({ user: null, isLoggedIn: false, isLoading: false }, false, 'user/noTokenFound');
            }
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
          localStorage.removeItem('token');
          set({ user: null, error: null, isLoggedIn: false, isLoading: false, isUpdating: false }, false, 'user/logout');
          
          // Opcional: Redirecionar via window ou router
          // window.location.href = '/login'; 
        },
      }),
      {
        name: 'user-storage', // Nome no localStorage
        storage: createJSONStorage(() => localStorage),
        // Persistimos o user completo para evitar flash de avatar sem foto após reload
        partialize: (state) => ({ 
          isLoggedIn: state.isLoggedIn,
          user: state.user 
        }),
        
        onRehydrateStorage: () => {
          return (hydratedState) => {
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
