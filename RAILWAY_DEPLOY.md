# Deploy no Railway - Guia Rápido

## ✅ Arquivos Criados

- ✅ `railway.json` - Configuração do Railway
- ✅ `nixpacks.toml` - Otimização de build

## 📝 Variáveis de Ambiente

### Para o Railway (Produção)

Configure estas variáveis no Railway Dashboard:

```bash
NEXT_PUBLIC_API_URL=https://contratamusico-backend-production.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51IrfkhDDbDr8nZhBuSmGiI
```

### Para Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# Backend local
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stripe - Mesma chave pública
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51IrfkhDDbDr8nZhBuSmGiI
```

## 🚀 Próximos Passos

### 1. Commit e Push para GitHub

```bash
git add railway.json nixpacks.toml RAILWAY_DEPLOY.md
git commit -m "feat: adicionar configuração para deploy no Railway"
git push origin main
```

### 2. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `contratamusico-frontend`
5. Railway detectará automaticamente que é Next.js

### 3. Configurar Variáveis de Ambiente

No dashboard do Railway:

1. Vá em "Variables"
2. Clique em "New Variable"
3. Adicione:
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valor: `https://contratamusico-backend-production.up.railway.app`
4. Adicione outra:
   - Nome: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
   - Valor: `pk_test_51IrfkhDDbDr8nZhBuSmGiI`
5. Railway fará redeploy automaticamente

### 4. Gerar Domínio

1. No Railway, vá em "Settings" → "Domains"
2. Clique em "Generate Domain"
3. Copie o domínio gerado (ex: `contratamusico-frontend.up.railway.app`)

### 5. Atualizar CORS no Backend

1. Acesse o projeto do backend no Railway
2. Vá em "Variables"
3. Edite `CORS_ORIGINS` e adicione o novo domínio:
   ```
   https://contratamusico.com.br,https://www.contratamusico.com.br,https://contratamusico-frontend.vercel.app,http://localhost:3000,https://SEU-DOMINIO-RAILWAY.up.railway.app
   ```
4. Salve (backend fará redeploy automático)

## ✅ Checklist de Verificação

Após o deploy, teste:

- [ ] Aplicação carrega no domínio Railway
- [ ] Login/cadastro funcionam
- [ ] Busca de músicos funciona
- [ ] Imagens do Unsplash carregam
- [ ] Não há erros de CORS no console
- [ ] Integração com Stripe funciona

## 🐛 Troubleshooting

### Erro: CORS blocked
**Solução**: Adicione o domínio Railway no `CORS_ORIGINS` do backend

### Erro: Failed to fetch
**Solução**: Verifique se `NEXT_PUBLIC_API_URL` está correto no Railway

### Erro: Build failed
**Solução**: Verifique os logs no Railway e certifique-se que `npm run build` funciona localmente

## 💰 Monitoramento de Custos

- Acesse "Usage" no Railway para ver consumo
- Plano $5/mês com $5 de crédito
- ~3-4GB RAM é suficiente para Next.js
- Monitore para não ultrapassar o crédito

## 📚 Recursos

- [Railway Docs](https://docs.railway.app/)
- [Next.js on Railway](https://docs.railway.app/guides/nextjs)
- [Nixpacks Docs](https://nixpacks.com/)
