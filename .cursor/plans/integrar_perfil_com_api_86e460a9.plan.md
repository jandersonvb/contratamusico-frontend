---
name: Integrar Perfil com API
overview: Implementar integração da página de perfil com a API do backend, criando os endpoints, tipos e store necessários para buscar e atualizar dados do usuário logado.
todos:
  - id: fix-api-url
    content: Corrigir URL da API de /user/me para /users/me no auth.ts
    status: completed
  - id: expand-types
    content: Expandir interface MusicianProfile com todos os campos do backend
    status: completed
  - id: create-update-api
    content: Criar funcao updateUserApi no api/user.ts
    status: completed
  - id: add-store-action
    content: Adicionar action updateUser no userStore
    status: completed
  - id: refactor-profile-page
    content: Refatorar pagina de perfil para usar userStore e chamar API
    status: completed
---

# Integrar Pagina de Perfil com API do Backend

## Situacao Atual

A pagina de perfil (`app/perfil/page.tsx`) usa dados mockados de `musicianDetails[0]`. Ja existe um `userStore` funcional com login/logout, mas falta:

- Endpoint de update do usuario
- Types completos do `MusicianProfile`
- Action `updateUser` no store
- Integracao da pagina com o store

## Arquitetura da Solucao

```mermaid
sequenceDiagram
    participant Page as PerfilPage
    participant Store as userStore
    participant API as api/user.ts
    participant Backend as Backend API
    
    Page->>Store: useUserStore
    Store->>Page: user data
    Page->>Page: preencher formularios
    
    Note over Page: Usuario edita e salva
    Page->>Store: updateUser(data)
    Store->>API: updateUserApi(data)
    API->>Backend: PATCH /users/me
    Backend->>API: user atualizado
    API->>Store: return user
    Store->>Page: atualiza estado
```

## Alteracoes Necessarias

### 1. Corrigir URL da API (Bug)

No arquivo [`api/auth.ts`](api/auth.ts), a URL esta incorreta:

- Atual: `/user/me`
- Correto: `/users/me` (com "s", conforme backend)

### 2. Expandir Types do MusicianProfile

Atualizar [`lib/types/user.ts`](lib/types/user.ts) para incluir todos os campos retornados pelo backend:

```typescript
export interface MusicianProfile {
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
  genres: Array<{ id: number; name: string; slug: string }>;
  instruments: Array<{ id: number; name: string; slug: string }>;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Criar Funcao de Update na API

Adicionar no [`api/user.ts`](api/user.ts) a funcao `updateUserApi`:

```typescript
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
}

export async function updateUserApi(data: UpdateUserData): Promise<User>
```

### 4. Adicionar Action no Store

Atualizar [`lib/stores/userStore.ts`](lib/stores/userStore.ts):

- Adicionar action `updateUser(data)` que chama a API e atualiza o estado

### 5. Refatorar Pagina de Perfil

Atualizar [`app/perfil/page.tsx`](app/perfil/page.tsx):

- Importar e usar `useUserStore` para obter dados do usuario
- Substituir dados mock pelos dados reais do store
- Chamar `updateUser` ao salvar formulario
- Adicionar estados de loading durante salvamento
- Redirecionar para login se nao estiver logado