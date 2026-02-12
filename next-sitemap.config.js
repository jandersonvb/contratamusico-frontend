/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://contratamusico.com.br',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/dashboard',
    '/dashboard/*',
    '/perfil',
    '/perfil/*',
    '/perfil/pagamentos',
    '/mensagens',
    '/favoritos',
    '/login',
    '/cadastro',
    '/esqueci-senha',
    '/pagamento/sucesso',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/perfil',
          '/perfil/pagamentos',
          '/mensagens',
          '/favoritos',
          '/login',
          '/cadastro',
          '/esqueci-senha',
          '/pagamento/sucesso',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://contratamusico.com.br'}/sitemap-index.xml`,
    ],
  },
  transform: async (config, path) => {
    // Prioridades personalizadas para diferentes tipos de página
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/musico/')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/busca') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path === '/como-funciona' || path === '/planos') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path === '/contato') {
      priority = 0.6;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
