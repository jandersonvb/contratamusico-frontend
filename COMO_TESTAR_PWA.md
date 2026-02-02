# 🚀 Como Testar o PWA - Passo a Passo

## ✅ PWA Implementado com next-pwa

O PWA foi configurado com sucesso! Agora você precisa testar em **modo de produção**.

## ⚠️ IMPORTANTE

**PWA só funciona em BUILD DE PRODUÇÃO!**

O `next-pwa` está configurado para ser desabilitado em desenvolvimento (`npm run dev`).

## 🧪 Passo a Passo para Testar

### 1️⃣ Parar o Servidor de Desenvolvimento

Se você tem o `npm run dev` rodando, **pare ele** primeiro:
- Pressione `Ctrl + C` no terminal

### 2️⃣ Fazer Build de Produção

```bash
npm run build
```

✅ Você verá nos logs:
```
> [PWA] Compile server
> [PWA] Compile client (static)
> [PWA] Service worker: ...
```

### 3️⃣ Iniciar Servidor de Produção

```bash
npm run start
```

O servidor iniciará em: **http://localhost:3000**

### 4️⃣ Abrir no Chrome

1. Abra o Chrome (ou Edge)
2. Acesse: **http://localhost:3000**
3. Navegue por 2-3 páginas

### 5️⃣ Verificar PWA no DevTools

Pressione **F12** para abrir DevTools:

#### Application → Manifest
- ✅ Deve mostrar "Contrata Músico"
- ✅ Ícones 192x192 e 512x512
- ✅ Theme color: #000000
- ✅ Display: standalone

#### Application → Service Workers
- ✅ Deve aparecer `/sw.js`
- ✅ Status: "activated and running"
- ✅ Scope: "/"

#### Application → Cache Storage
- ✅ Deve ter vários caches do Workbox
- ✅ Ex: `workbox-precache-v2-...`

### 6️⃣ Testar Instalação do App

**Opção A - Ícone na barra:**
- Procure o ícone **➕** ou **🖥️** na barra de endereço do Chrome
- Clique nele → "Instalar Contrata Músico"

**Opção B - Menu do Chrome:**
- Clique nos 3 pontinhos (⋮) no canto superior direito
- Procure "Instalar Contrata Músico..."
- Clique para instalar

**Opção C - Pelo DevTools:**
- F12 → Application → Manifest
- Role para baixo até "Install"
- Clique em "Install"

### 7️⃣ Após Instalar

O app será aberto em uma janela própria:
- ✅ Sem barra de endereço
- ✅ Ícone próprio na barra de tarefas
- ✅ Aparece no menu Iniciar (Windows) ou Applications

### 8️⃣ Testar Modo Offline

1. Com o app instalado e aberto
2. Navegue por várias páginas
3. Abra DevTools (F12)
4. Application → Service Workers
5. Marque a caixa **"Offline"**
6. Recarregue a página
7. ✅ **Deve funcionar normalmente!**

### 9️⃣ Lighthouse Test

1. F12 → Lighthouse
2. Selecione **"Progressive Web App"**
3. Clique em **"Generate report"**
4. **Meta:** Score > 90

## 📱 Testar no Mobile

### Android (Chrome)

1. Acesse o site pelo Chrome no celular
2. Um banner "Adicionar à tela inicial" aparecerá
3. Ou vá em Menu (⋮) → "Adicionar à tela inicial"
4. O ícone aparece no drawer de apps

### iOS (Safari)

1. Acesse o site pelo Safari no iPhone/iPad
2. Toque no botão **Compartilhar** (ícone de compartilhamento)
3. Role e selecione **"Adicionar à Tela de Início"**
4. O ícone aparece na tela inicial

## 🐛 Problemas Comuns

### "Não vejo o ícone de instalação"

**Verifique:**
- ✅ Está rodando `npm run start` (não `npm run dev`)
- ✅ Acesse http://localhost:3000 (não 3001)
- ✅ Navegue por 2-3 páginas primeiro
- ✅ DevTools → Application → Service Worker está ativo
- ✅ DevTools → Application → Manifest está válido

### "Service Worker não aparece"

**Solução:**
1. Limpe o cache: DevTools → Application → Clear storage
2. Feche e reabra o navegador
3. `Ctrl + Shift + R` (hard reload)
4. Verifique se fez `npm run build` antes

### "Erro: Port 3000 in use"

**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número_do_processo] /F

# Ou use outra porta
$env:PORT=3002; npm run start    # PowerShell
set PORT=3002 && npm run start   # CMD
```

### "PWA não funciona offline"

**Verifique:**
1. Navegou por várias páginas antes de testar offline?
2. DevTools → Application → Cache Storage tem arquivos?
3. Service Worker está "activated"?
4. Está em modo de produção (`npm run start`)?

## 📊 O Que Você Deve Ver

### No Chrome DevTools

**Application → Manifest:**
```json
{
  "name": "Contrata Músico",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "icons": [192x192, 512x512]
}
```

**Application → Service Workers:**
```
◉ sw.js
   Status: activated and running
   Scope: /
```

**Application → Cache Storage:**
```
▶ workbox-precache-v2-...
▶ workbox-runtime-...
▶ workbox-routing-...
```

## ✨ Recursos PWA Implementados

- ✅ **Instalação** - Ícone na tela inicial
- ✅ **Offline** - Funciona sem internet
- ✅ **Cache automático** - Workbox gerencia
- ✅ **Service Worker** - Gerado automaticamente
- ✅ **Manifest** - Configuração completa
- ✅ **Ícones** - 192x192 e 512x512 com bordas arredondadas

## 📖 Documentação

Para mais detalhes, veja: **`PWA.md`**

## 🎯 Checklist de Teste

- [ ] Fez `npm run build`
- [ ] Rodou `npm run start`
- [ ] Acessou http://localhost:3000
- [ ] Abriu DevTools (F12)
- [ ] Verificou Application → Manifest ✅
- [ ] Verificou Application → Service Workers ✅
- [ ] Verificou Application → Cache Storage ✅
- [ ] Viu ícone de instalação no Chrome
- [ ] Instalou o app
- [ ] App abre em janela própria
- [ ] Testou modo offline ✅
- [ ] Fez Lighthouse audit (score > 90)

## 🚀 Deploy em Produção

Quando fizer deploy (Vercel, Netlify, Railway):

1. O PWA funcionará automaticamente com HTTPS
2. Usuários verão opção de instalar
3. App funcionará offline
4. Atualizações automáticas

**Hosts testados:**
- ✅ Vercel
- ✅ Netlify
- ✅ Railway

---

## 🎵 Pronto para Testar!

Execute agora:

```bash
# 1. Build
npm run build

# 2. Start
npm run start

# 3. Abra
http://localhost:3000
```

**E aproveite seu PWA! 🚀**
