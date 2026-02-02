# 📱 Gerador de Favicons

Este script gera automaticamente todos os favicons necessários para o projeto Contrata Músico.

## 🚀 Como Usar

### 1. Prepare sua imagem

- Crie ou obtenha o logo do Contrata Músico
- A imagem deve ser:
  - **Formato:** PNG com fundo transparente
  - **Tamanho:** Quadrada (recomendado 1024x1024 ou no mínimo 512x512)
  - **Nome:** `logo.png`
  - **Local:** Coloque na pasta `scripts/`

### 2. Execute o script

```bash
npm run generate:favicons
```

### 3. Verifique os resultados

Os seguintes arquivos serão gerados na pasta `app/`:

- `favicon.ico` - Ícone padrão (32x32)
- `favicon-16x16.png` - Ícone pequeno
- `favicon-32x32.png` - Ícone médio
- `favicon-48x48.png` - Ícone grande
- `icon.png` - Ícone principal (512x512)
- `icon-192.png` - PWA ícone pequeno
- `icon-512.png` - PWA ícone grande
- `apple-touch-icon.png` - Ícone para dispositivos Apple (180x180)

## 🎨 Ferramentas para Criar o Logo

Se você ainda não tem um logo, pode usar:

- **[Canva](https://www.canva.com/)** - Editor online gratuito
- **[Figma](https://www.figma.com/)** - Design profissional
- **[Logo.com](https://logo.com/)** - Gerador de logos com IA
- **[Looka](https://looka.com/)** - Criador de logos automático

## 📋 Dicas

1. **Fundo transparente:** Use PNG com transparência para melhor resultado
2. **Simplicidade:** Logos simples funcionam melhor em tamanhos pequenos
3. **Contraste:** Certifique-se de que o logo tem bom contraste
4. **Teste:** Sempre teste os favicons em diferentes dispositivos e navegadores

## 🔧 Como Funciona

O script usa a biblioteca [Sharp](https://sharp.pixelplumbing.com/) para:

1. Ler a imagem fonte (`logo.png`)
2. Redimensionar para diferentes tamanhos
3. **Aplicar bordas arredondadas automaticamente (20% de border radius)**
4. Manter a transparência do fundo
5. Salvar em múltiplos formatos

### 🎨 Personalizando o Border Radius

Por padrão, o script aplica **20% de border radius** em todos os favicons. Para ajustar:

1. Abra `scripts/generate-favicons.js`
2. Na linha 8, altere o valor de `BORDER_RADIUS_PERCENT`:
   ```javascript
   const BORDER_RADIUS_PERCENT = 20; // Altere este valor
   ```
3. Valores sugeridos:
   - `10` → Pouco arredondado
   - `20` → Arredondado moderado (padrão)
   - `30` → Muito arredondado
   - `50` → Totalmente circular
4. Execute novamente: `npm run generate:favicons`

## 🐛 Solução de Problemas

### "Arquivo fonte não encontrado"
- Certifique-se de que existe um arquivo `logo.png` na pasta `scripts/`
- Verifique se o nome do arquivo está correto (case-sensitive)

### "Sharp não está instalado"
```bash
npm install sharp --save-dev
```

### Os ícones não aparecem
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Reinicie o servidor de desenvolvimento
3. Verifique se os arquivos foram gerados em `app/`

## 📦 Arquivos Gerados

O Next.js 13+ (App Router) detecta automaticamente os seguintes arquivos na pasta `app/`:

- `favicon.ico` → Navegadores antigos
- `icon.png` → Navegadores modernos
- `apple-touch-icon.png` → Safari iOS

Para PWA, os arquivos `icon-192.png` e `icon-512.png` devem ser referenciados no manifesto.

## 🔗 Referências

- [Next.js Metadata Files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Favicon Best Practices](https://web.dev/favicon/)
