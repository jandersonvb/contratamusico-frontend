export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contratamusico.com.br";
  const canonicalUrl = `${siteUrl}/como-funciona`;
  const title = "Como Funciona | Contrata Músico";
  const description =
    "Descubra como funciona o Contrata Músico para contratar profissionais ou divulgar seu trabalho como músico.";
  const ogImage = `${siteUrl}/images/logo.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="como contratar músico, como funciona contrata músico, guia para contratar banda, trabalhar como músico"
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
