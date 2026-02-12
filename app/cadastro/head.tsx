export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br'
  const canonicalUrl = siteUrl + '/cadastro'

  return (
    <>
      <title>Cadastro | Contrata Músico</title>
      <meta name="robots" content="noindex,nofollow" />
      <meta name="googlebot" content="noindex,nofollow" />
      <link rel="canonical" href={canonicalUrl} />
    </>
  )
}
