import {
  buildSitemapIndexXml,
  SITEMAP_REVALIDATE_SECONDS,
} from "@/lib/sitemap";
import { withSiteUrl } from "@/lib/env";

export const revalidate = 3600;

export async function GET() {
  const xml = buildSitemapIndexXml([withSiteUrl("/sitemap.xml")]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
