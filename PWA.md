# 📱 PWA - Progressive Web App

## ✅ Implementado com next-pwa

O projeto agora é um PWA completo usando a biblioteca `next-pwa`.

## 🚀 Como Funciona

O `next-pwa` gera automaticamente:
- ✅ Service Worker (`sw.js`)
- ✅ Workbox para cache inteligente
- ✅ Manifest linkado automaticamente
- ✅ Suporte offline

## 📋 Configuração

### `next.config.ts`

```typescript
import withPWA from "next-pwa";

export default withPWA({
  dest: "public",                    // Service worker vai para /public
  register: true,                    // Registra automaticamente
  skipWaiting: true,                 // Atualiza imediatamente
  disable: process.env.NODE_ENV === "development", // Desabilita em dev
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);
```

### `public/manifest.json`

```json
{
  "name": "Contrata Músico",
  "short_name": "Contrata Músico",
  "description": "Encontre músicos profissionais para seu evento",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### `app/layout.tsx`

Meta tags PWA já configuradas:
- `manifest: "/manifest.json"`
- `appleWebApp` configurado
- `theme-color` definido

## 🧪 Como Testar

### 1. Build de Produção

⚠️ **IMPORTANTE:** PWA só funciona em build de produção!

```bash
npm run build
npm run start
```

### 2. Abrir no Chrome

Acesse: http://localhost:3000

### 3. Verificar PWA

**DevTools (F12) → Application:**
- **Manifest** → Deve mostrar todos os dados
- **Service Workers** → Deve estar "activated and running"
- **Cache Storage** → Deve ter caches do Workbox

### 4. Testar Instalação

**Desktop:**
- Procure o ícone **➕** na barra de endereço
- Ou Menu (⋮) → "Instalar Contrata Músico"

**Mobile (Android):**
- Banner "Adicionar à tela inicial" aparece
- Ou Menu → "Adicionar à tela inicial"

**iOS (Safari):**
- Botão Compartilhar → "Adicionar à Tela de Início"

### 5. Testar Offline

1. Navegue por 2-3 páginas
2. DevTools → Application → Service Workers → Marque "Offline"
3. Recarregue → Deve funcionar! ✅

## 🎯 Lighthouse Test

```bash
# 1. Build de produção
npm run build
npm run start

# 2. Abra DevTools (F12)
# 3. Lighthouse → Progressive Web App
# 4. Generate report
# Meta: Score > 90
```

## 📱 Ícones PWA

Os ícones já foram gerados com bordas arredondadas:
- ✅ `/icon-192.png` (192x192)
- ✅ `/icon-512.png` (512x512)
- ✅ `/apple-touch-icon.png` (180x180)

## ⚙️ Customização

### Alterar Cores

**`public/manifest.json`:**
```json
{
  "theme_color": "#000000",        // Cor da barra superior
  "background_color": "#ffffff"    // Cor de fundo ao abrir
}
```

**`app/layout.tsx`:**
```tsx
<meta name="theme-color" content="#000000" />
```

### Alterar Nome

**`public/manifest.json`:**
```json
{
  "name": "Nome Completo do App",
  "short_name": "Nome Curto"
}
```

### Desabilitar PWA em Desenvolvimento

Já está configurado! PWA só funciona em produção.

Para habilitar em dev (não recomendado):
```typescript
disable: false, // Em next.config.ts
```

## 🔍 Debugging

### Service Worker não aparece

**Soluções:**
1. Execute `npm run build` (não `npm run dev`)
2. Certifique-se de estar em http://localhost:3000
3. Limpe cache: DevTools → Application → Clear storage
4. Hard reload: Ctrl + Shift + R

### Botão de instalação não aparece

**Requisitos:**
- ✅ Build de produção rodando
- ✅ HTTPS (ou localhost)
- ✅ Manifest válido
- ✅ Service Worker ativo
- ✅ Ícones 192x192 e 512x512

### Cache não está funcionando

1. DevTools → Application → Service Workers
2. Clique em "Unregister"
3. Recarregue a página
4. Service Worker será re-registrado

## 📦 Arquivos Gerados no Build

Após `npm run build`, o next-pwa gera automaticamente:

```
public/
├── sw.js                    # Service Worker (gerado automaticamente)
├── sw.js.map               # Source map
├── workbox-*.js            # Workbox runtime (gerado automaticamente)
└── manifest.json           # Seu manifest (você criou)
```

⚠️ **Não edite sw.js** - É gerado automaticamente a cada build!

## 🚀 Deploy

### Produção

O PWA funciona automaticamente em produção com HTTPS:
- ✅ **Vercel** - HTTPS automático
- ✅ **Netlify** - HTTPS automático
- ✅ **Railway** - HTTPS automático

### .gitignore

Adicione ao `.gitignore`:

```
# PWA files
public/sw.js
public/sw.js.map
public/workbox-*.js
```

Esses arquivos são gerados no build, não devem ser versionados.

## 🎓 Recursos

- [next-pwa Docs](https://github.com/shadowwalker/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## ✅ Checklist

- [x] next-pwa instalado
- [x] next.config.ts configurado
- [x] manifest.json criado
- [x] Meta tags PWA no layout
- [x] Ícones 192x192 e 512x512
- [ ] Testar build de produção
- [ ] Testar instalação
- [ ] Testar offline
- [ ] Lighthouse audit > 90
- [ ] Deploy em produção

## 🎯 Resultado Esperado

Após `npm run build && npm run start`:

1. ✅ Service Worker registrado
2. ✅ Ícone ➕ aparece no Chrome
3. ✅ PWA pode ser instalado
4. ✅ Funciona offline
5. ✅ Cache automático

---

**🎵 Contrata Músico PWA** - Pronto para ser instalado!
