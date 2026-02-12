export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br'
  const canonicalUrl = siteUrl + '/contato'

  return (
    <>
      <title>Contato | Contrata Músico</title>
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <link rel="canonical" href={canonicalUrl} />
    </>
  )
}
