import {
  buildSitemapXml,
  getDynamicMusicianSitemapEntries,
  SITEMAP_REVALIDATE_SECONDS,
} from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  try {
    const entries = await getDynamicMusicianSitemapEntries();

    return new Response(buildSitemapXml(entries), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": `s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.warn(
      "[sitemap] Aviso: não foi possível gerar sitemap dinâmico.",
      error,
    );

    return new Response(buildSitemapXml([]), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": `s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  }
}
