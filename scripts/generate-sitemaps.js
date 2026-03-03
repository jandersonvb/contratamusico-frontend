/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://contratamusico.com.br').replace(/\/$/, '')
const defaultApiUrl = process.env.NODE_ENV === 'production' ? siteUrl : 'http://localhost:3000'
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || defaultApiUrl).replace(/\/$/, '')
const allowEmptyDynamicSitemap = process.env.ALLOW_EMPTY_DYNAMIC_SITEMAP === 'true'
const publicDir = path.join(process.cwd(), 'public')

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/busca', changefreq: 'daily', priority: '0.9' },
  { path: '/como-funciona', changefreq: 'monthly', priority: '0.8' },
  { path: '/planos', changefreq: 'monthly', priority: '0.8' },
  { path: '/contato', changefreq: 'monthly', priority: '0.6' },
]

function buildSitemapXml(entries) {
  const urlNodes = entries
    .map((entry) => {
      return [
        '  <url>',
        `    <loc>${entry.loc}</loc>`,
        `    <lastmod>${entry.lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>\n`
}

function buildSitemapIndexXml(sitemaps) {
  const now = new Date().toISOString()
  const nodes = sitemaps
    .map((sitemapUrl) => {
      return [
        '  <sitemap>',
        `    <loc>${sitemapUrl}</loc>`,
        `    <lastmod>${now}</lastmod>`,
        '  </sitemap>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</sitemapindex>\n`
}

function countUrlNodes(xml) {
  return (xml.match(/<url>/g) || []).length
}

function readExistingDynamicSitemap(filePath) {
  if (!fs.existsSync(filePath)) return null

  const currentXml = fs.readFileSync(filePath, 'utf8')
  if (countUrlNodes(currentXml) === 0) return null

  return currentXml
}

async function fetchWithRetries(url, attempts = 3, delayMs = 1200) {
  let lastError = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`status ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido ao consultar API')

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  throw new Error(`Falha ao consultar ${url} após ${attempts} tentativas: ${lastError?.message || 'erro desconhecido'}`)
}

async function fetchDynamicMusicianUrls() {
  const entries = []
  const limit = 100
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await fetchWithRetries(`${apiUrl}/musicians?page=${page}&limit=${limit}`)

    const payload = await response.json()
    const musicians = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []

    if (!Array.isArray(musicians)) {
      throw new Error('Formato inesperado da API de músicos para sitemap dinâmico')
    }

    const now = new Date().toISOString()

    for (const musician of musicians) {
      if (!musician?.id) continue
      entries.push({
        loc: `${siteUrl}/musico/${musician.id}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.8',
      })
    }

    const parsedTotalPages = Number(payload?.pagination?.totalPages || 1)
    totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1
    page += 1
  }

  return entries
}

async function generate() {
  fs.mkdirSync(publicDir, { recursive: true })

  const now = new Date().toISOString()
  const staticEntries = STATIC_ROUTES.map((route) => ({
    loc: `${siteUrl}${route.path}`,
    lastmod: now,
    changefreq: route.changefreq,
    priority: route.priority,
  }))

  const dynamicSitemapPath = path.join(publicDir, 'sitemap-dinamico.xml')

  let dynamicEntries = []
  let dynamicFetchError = null

  try {
    dynamicEntries = await fetchDynamicMusicianUrls()
  } catch (error) {
    dynamicFetchError = error instanceof Error ? error : new Error('Erro desconhecido ao gerar sitemap dinâmico')
    console.warn(`[sitemap] Aviso: não foi possível gerar sitemap dinâmico via API: ${dynamicFetchError.message}`)
  }

  const staticSitemapXml = buildSitemapXml(staticEntries)

  let dynamicSitemapXml = ''

  if (dynamicEntries.length > 0) {
    dynamicSitemapXml = buildSitemapXml(dynamicEntries)
  } else {
    const existingDynamicSitemapXml = readExistingDynamicSitemap(dynamicSitemapPath)

    if (existingDynamicSitemapXml) {
      dynamicSitemapXml = existingDynamicSitemapXml
      console.warn('[sitemap] Aviso: reutilizando sitemap dinâmico existente porque a API não retornou URLs.')
    } else {
      if (process.env.NODE_ENV === 'production' && !allowEmptyDynamicSitemap && dynamicFetchError) {
        const reason = dynamicFetchError.message
        throw new Error(
          `[sitemap] Em produção, sitemap dinâmico vazio não é permitido (${reason}). Configure NEXT_PUBLIC_API_URL/API_URL ou ALLOW_EMPTY_DYNAMIC_SITEMAP=true.`
        )
      }

      dynamicSitemapXml = buildSitemapXml([])
    }
  }

  const sitemapIndexXml = buildSitemapIndexXml([
    `${siteUrl}/sitemap.xml`,
    `${siteUrl}/sitemap-dinamico.xml`,
  ])

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), staticSitemapXml)
  fs.writeFileSync(dynamicSitemapPath, dynamicSitemapXml)
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndexXml)

  console.log(`[sitemap] Gerado com ${staticEntries.length} URLs estáticas e ${countUrlNodes(dynamicSitemapXml)} URLs dinâmicas.`)
}

generate().catch((error) => {
  console.error('[sitemap] Erro ao gerar sitemaps:', error)
  process.exit(1)
})
