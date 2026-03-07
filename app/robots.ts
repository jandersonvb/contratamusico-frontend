import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/perfil",
        "/mensagens",
        "/favoritos",
        "/pagamento/sucesso",
      ],
    },
    sitemap: `${siteUrl}/sitemap-index.xml`,
  };
}
