'use client';

import Script from 'next/script';
import { getSiteUrl } from '@/lib/env';

const siteUrl = getSiteUrl();

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Contrata Músico',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description:
      'Plataforma completa para contratar músicos profissionais para eventos, festas, casamentos e shows.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Portuguese'],
      url: `${siteUrl}/contato`,
    },
    sameAs: [
      'https://facebook.com/contratamusico',
      'https://instagram.com/contratamusico',
      'https://twitter.com/contratamusico',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressLocality: 'Brasil',
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
