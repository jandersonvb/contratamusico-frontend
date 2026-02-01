import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/perfil/',
        '/mensagens',
        '/favoritos',
        '/login',
        '/cadastro',
        '/esqueci-senha',
        '/pagamento/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
