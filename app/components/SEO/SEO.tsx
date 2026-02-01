'use client';

import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  keywords?: string[];
}

const defaultTitle = 'Contrata Músico - Encontre Músicos Profissionais para seu Evento';
const defaultDescription = 
  'Plataforma completa para contratar músicos profissionais. Encontre bandas, DJs, cantores e instrumentistas para casamentos, festas e eventos. Contrate de forma fácil e segura.';
const siteUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br';

export function SEO({
  title,
  description = defaultDescription,
  canonical,
  ogImage = `${siteUrl}/og-image.jpg`,
  ogType = 'website',
  noindex = false,
  keywords = [],
}: SEOProps) {
  const fullTitle = title ? `${title} | Contrata Músico` : defaultTitle;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  const defaultKeywords = [
    'contratar músico',
    'músicos para eventos',
    'banda para casamento',
    'DJ para festa',
    'músicos profissionais',
    'show ao vivo',
    'entretenimento musical',
  ];

  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Contrata Músico" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@contratamusico" />
      <meta name="twitter:creator" content="@contratamusico" />
    </Head>
  );
}
