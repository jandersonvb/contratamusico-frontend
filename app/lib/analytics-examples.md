# 📊 Google Analytics - Exemplos de Uso

## Como Usar os Eventos Personalizados

### 1. Import
```typescript
import { event } from '@/app/lib/analytics'
```

### 2. Exemplos de Eventos

#### Rastrear clique em botão de contratar músico
```typescript
event({
  action: 'click',
  category: 'engagement',
  label: 'contratar_musico',
})
```

#### Rastrear busca realizada
```typescript
event({
  action: 'search',
  category: 'engagement',
  label: 'busca_musico',
  value: resultados.length,
})
```

#### Rastrear cadastro completado
```typescript
event({
  action: 'sign_up',
  category: 'conversion',
  label: 'cadastro_musico',
})
```

#### Rastrear visualização de perfil
```typescript
event({
  action: 'view_profile',
  category: 'engagement',
  label: `musico_${musicoId}`,
})
```

#### Rastrear envio de mensagem
```typescript
event({
  action: 'send_message',
  category: 'engagement',
  label: 'contato_musico',
})
```

#### Rastrear plano selecionado
```typescript
event({
  action: 'select_plan',
  category: 'conversion',
  label: planoNome,
  value: planoValor,
})
```

#### Rastrear favoritar músico
```typescript
event({
  action: 'add_to_favorites',
  category: 'engagement',
  label: `musico_${musicoId}`,
})
```

## Categorias Recomendadas

- **engagement**: Interações gerais do usuário
- **conversion**: Ações de conversão (cadastros, pagamentos)
- **navigation**: Navegação entre páginas
- **social**: Compartilhamentos em redes sociais
- **error**: Erros ou problemas encontrados

## Verificar se está Funcionando

1. Abra o DevTools (F12)
2. Vá na aba **Network**
3. Filtre por `google-analytics` ou `gtag`
4. Você verá as requisições sendo enviadas ao GA
