export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contratamusico.com.br";
  const canonicalUrl = `${siteUrl}/busca`;
  const title = "Buscar Músicos | Contrata Músico";
  const description =
    "Encontre os melhores músicos profissionais para seu evento. Filtre por instrumento, estilo musical, localização e mais.";
  const ogImage = `${siteUrl}/images/logo.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="buscar músico, encontrar banda, contratar DJ, músicos disponíveis, busca de músicos"
      />
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Contrata Músico" />
      <meta property="og:locale" content="pt_BR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
