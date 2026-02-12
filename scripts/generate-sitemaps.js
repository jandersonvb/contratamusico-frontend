const fs = require('fs')
const path = require('path')

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://contratamusico.com.br').replace(/\/$/, '')
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '')
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

async function fetchDynamicMusicianUrls() {
  const entries = []
  const limit = 100
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await fetch(`${apiUrl}/musicians?page=${page}&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Falha ao buscar músicos para sitemap dinâmico (status ${response.status})`)
    }

    const payload = await response.json()
    const musicians = Array.isArray(payload) ? payload : payload?.data || []

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

    totalPages = Number(payload?.pagination?.totalPages || 1)
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

  const dynamicEntries = await fetchDynamicMusicianUrls().catch((error) => {
    console.warn(`[sitemap] Aviso: não foi possível gerar sitemap dinâmico via API: ${error.message}`)
    return []
  })

  const staticSitemapXml = buildSitemapXml(staticEntries)
  const dynamicSitemapXml = buildSitemapXml(dynamicEntries)
  const sitemapIndexXml = buildSitemapIndexXml([
    `${siteUrl}/sitemap.xml`,
    `${siteUrl}/sitemap-dinamico.xml`,
  ])

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), staticSitemapXml)
  fs.writeFileSync(path.join(publicDir, 'sitemap-dinamico.xml'), dynamicSitemapXml)
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndexXml)

  console.log(`[sitemap] Gerado com ${staticEntries.length} URLs estáticas e ${dynamicEntries.length} URLs dinâmicas.`)
}

generate().catch((error) => {
  console.error('[sitemap] Erro ao gerar sitemaps:', error)
  process.exit(1)
})
