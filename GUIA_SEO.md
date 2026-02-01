# 🚀 Guia Completo de SEO - Contrata Músico

## ✅ O que foi implementado

### 1. **Pacotes NPM Instalados**
- ✅ `next-seo` - Gerenciamento simplificado de SEO
- ✅ `next-sitemap` - Geração automática de sitemap.xml e robots.txt

### 2. **Arquivos Criados**

#### Componentes de SEO:
- `app/components/SEO/SEO.tsx` - Componente reutilizável para SEO
- `app/components/StructuredData/OrganizationSchema.tsx` - Schema.org da organização
- `app/components/StructuredData/WebsiteSchema.tsx` - Schema.org do website
- `app/components/StructuredData/MusicianSchema.tsx` - Schema.org para perfis de músicos

#### Configurações:
- `next-sitemap.config.js` - Configuração do sitemap
- `.env` - Variável `NEXT_PUBLIC_SITE_URL` adicionada

### 3. **Melhorias Implementadas**

#### Layout Principal (`app/layout.tsx`):
- ✅ Metadata completa e estruturada
- ✅ Open Graph tags para redes sociais
- ✅ Twitter Cards
- ✅ Dados estruturados (Organization e Website Schema)
- ✅ Meta tags de robots para indexação

#### Páginas com SEO Otimizado:
- ✅ **Home** - Metadata global
- ✅ **Busca** (`/busca`) - SEO client-side com next-seo
- ✅ **Músico** (`/musico/[id]`) - Metadata dinâmica + Schema.org
- ✅ **Como Funciona** (`/como-funciona`) - SEO específico
- ✅ **Planos** (`/planos`) - SEO específico

### 4. **Sitemap e Robots.txt**
- ✅ Geração automática após build
- ✅ Prioridades customizadas por tipo de página
- ✅ Exclusão de páginas privadas (dashboard, login, etc.)

---

## 📋 Próximos Passos Importantes

### 1. **Google Search Console** (ESSENCIAL)

#### Como Configurar:

1. **Acesse**: https://search.google.com/search-console

2. **Adicione sua propriedade**:
   - Escolha "Prefixo de URL"
   - Digite: `https://contratamusico.com.br`

3. **Verifique a propriedade** (escolha um método):
   
   **Opção A - Meta Tag HTML** (RECOMENDADO para Next.js):
   - No Search Console, copie o código de verificação
   - Cole em `app/layout.tsx` na linha onde está escrito `seu-codigo-de-verificacao-aqui`:
   ```typescript
   verification: {
     google: "seu-codigo-aqui", // Substitua pelo código real
   },
   ```
   
   **Opção B - Arquivo HTML**:
   - Baixe o arquivo HTML fornecido
   - Coloque na pasta `public/`
   
   **Opção C - DNS** (Requer acesso ao domínio):
   - Adicione o registro TXT ao seu DNS

4. **Após verificação**:
   - Envie o sitemap: `https://contratamusico.com.br/sitemap.xml`
   - Aguarde 48-72h para começar a ver dados

#### O que monitorar no Search Console:
- **Desempenho**: Cliques, impressões, CTR, posição média
- **Cobertura**: Páginas indexadas vs. com erros
- **Core Web Vitals**: LCP, FID, CLS
- **Links**: Backlinks e links internos
- **Experiência em dispositivos móveis**

---

### 2. **Bing Webmaster Tools**

Repita o processo acima em: https://www.bing.com/webmasters

---

### 3. **Criar Imagens para Redes Sociais**

Crie imagens otimizadas para compartilhamento:

**Arquivo necessário**: `public/og-image.jpg`
- **Dimensões**: 1200x630px
- **Formato**: JPG ou PNG
- **Peso máximo**: 1MB
- **Design**: Inclua logo, slogan, e elementos visuais atraentes

**Opcional**:
- `public/logo.png` - Logo da empresa (512x512px)
- `public/favicon.ico` - Ícone do site
- `public/apple-touch-icon.png` - Ícone para iOS (180x180px)

---

### 4. **Variáveis de Ambiente em Produção**

No Railway (ou seu ambiente de produção), adicione:

```bash
NEXT_PUBLIC_SITE_URL=https://contratamusico.com.br
```

---

### 5. **Conteúdo e Blog (MUITO IMPORTANTE)**

Para ranquear bem, você precisa de conteúdo relevante. Considere criar:

#### Páginas Recomendadas:
1. **Blog** (`/blog`)
   - "Como escolher músico para casamento"
   - "Quanto custa contratar uma banda"
   - "Top 10 estilos musicais para festas"
   - "Músicos em [Cidade]" (páginas regionais)

2. **Páginas de Categorias/Instrumentos**:
   - `/instrumentos/violao`
   - `/instrumentos/bateria`
   - `/generos/mpb`
   - `/generos/samba`

3. **Páginas Regionais**:
   - `/musicos-sao-paulo`
   - `/musicos-rio-de-janeiro`
   - etc.

---

## 🔍 Como Testar o SEO

### 1. **Teste no Google**

Após deploy, teste como o Google vê seu site:
```
https://search.google.com/test/rich-results
```

Cole a URL de uma página e veja se os dados estruturados estão corretos.

### 2. **Teste Open Graph**

Veja como suas páginas aparecem nas redes sociais:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 3. **Lighthouse (Chrome DevTools)**

1. Abra Chrome DevTools (F12)
2. Aba "Lighthouse"
3. Selecione "SEO" e "Performance"
4. Clique "Generate report"

**Metas**:
- SEO: 90+
- Performance: 80+
- Accessibility: 90+
- Best Practices: 90+

---

## 📊 Monitoramento Contínuo

### Ferramentas Gratuitas:
1. **Google Search Console** - Obrigatório
2. **Google Analytics** - Já implementado ✅
3. **Google PageSpeed Insights** - https://pagespeed.web.dev/
4. **Bing Webmaster Tools**

### Ferramentas Pagas (Opcionais):
1. **Semrush** - Pesquisa de palavras-chave e análise de concorrentes
2. **Ahrefs** - Análise de backlinks
3. **Ubersuggest** - Alternativa mais barata

---

## 🎯 Checklist de Lançamento

Antes de considerar o SEO completo, certifique-se de:

- [ ] Domínio verificado no Google Search Console
- [ ] Sitemap enviado ao Google Search Console
- [ ] Código de verificação do Google adicionado
- [ ] Imagem OG (`og-image.jpg`) criada e adicionada
- [ ] Variável `NEXT_PUBLIC_SITE_URL` configurada em produção
- [ ] Testado dados estruturados no Rich Results Test
- [ ] Testado preview nas redes sociais (Facebook, Twitter)
- [ ] Score de Lighthouse acima de 80 em todas as categorias
- [ ] Robots.txt acessível em `/robots.txt`
- [ ] Sitemap acessível em `/sitemap.xml`

---

## 🚨 Problemas Comuns

### 1. "Sitemap não encontrado"
**Solução**: Execute `npm run build` localmente e verifique se `public/sitemap.xml` foi gerado.

### 2. "Imagem OG não aparece"
**Solução**: 
- Verifique se o arquivo existe em `public/og-image.jpg`
- Limpe o cache do Facebook Debugger
- Aguarde 24h para atualização

### 3. "Google não está indexando minhas páginas"
**Solução**:
- Verifique se não há `noindex` nas páginas
- Confirme que robots.txt não está bloqueando
- Use "Solicitar indexação" no Search Console

---

## 📈 Métricas de Sucesso

### Primeiros 30 dias:
- [ ] 50+ páginas indexadas
- [ ] 10+ impressões no Google/dia

### Primeiros 90 dias:
- [ ] 100+ páginas indexadas
- [ ] 100+ impressões no Google/dia
- [ ] 5+ cliques orgânicos/dia

### 6 meses:
- [ ] 500+ páginas indexadas
- [ ] 1000+ impressões no Google/dia
- [ ] 50+ cliques orgânicos/dia

---

## 💡 Dicas Extras

1. **Velocidade é crucial**: Otimize imagens, use CDN, minimize JavaScript
2. **Mobile-first**: 70% das buscas são mobile
3. **Conteúdo é rei**: Publique conteúdo novo regularmente
4. **Backlinks**: Parcerias com blogs, eventos, redes sociais
5. **Local SEO**: Se atender regiões específicas, crie Google My Business

---

## 📞 Suporte

Se tiver dúvidas sobre SEO:
- **Documentação Next.js**: https://nextjs.org/learn/seo/introduction-to-seo
- **Google SEO Starter Guide**: https://developers.google.com/search/docs/beginner/seo-starter-guide
- **next-seo Docs**: https://github.com/garmeeh/next-seo

---

**Última atualização**: 01/02/2026
