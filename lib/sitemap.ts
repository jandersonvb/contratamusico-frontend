import type { MetadataRoute } from "next";
import { getApiBaseUrl, withSiteUrl } from "./env";

export const SITEMAP_REVALIDATE_SECONDS = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/busca", changeFrequency: "daily", priority: 0.9 },
  { path: "/como-funciona", changeFrequency: "monthly", priority: 0.8 },
  { path: "/planos", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contato", changeFrequency: "monthly", priority: 0.6 },
  {
    path: "/politica-de-privacidade",
    changeFrequency: "yearly",
    priority: 0.4,
  },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchJsonWithRetries(
  url: string,
  attempts = 3,
  delayMs = 1200,
) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Erro desconhecido ao consultar a API");

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Falha ao consultar ${url} após ${attempts} tentativas: ${lastError?.message || "erro desconhecido"}`,
  );
}

export function getStaticSitemapEntries(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_ROUTES.map((route) => ({
    url: withSiteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

export async function getDynamicMusicianSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const apiUrl = getApiBaseUrl();
  const entries: MetadataRoute.Sitemap = [];
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const lastModified = new Date();

  while (page <= totalPages) {
    const payload = await fetchJsonWithRetries(
      `${apiUrl}/musicians?page=${page}&limit=${limit}`,
    );

    const musicians = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    for (const musician of musicians) {
      if (!musician?.id) continue;

      entries.push({
        url: withSiteUrl(`/musico/${musician.id}`),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const parsedTotalPages = Number(payload?.pagination?.totalPages || 1);
    totalPages =
      Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
        ? parsedTotalPages
        : 1;
    page += 1;
  }

  return entries;
}

export async function getFullSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const dynamicEntries = await getDynamicMusicianSitemapEntries();
    return [...getStaticSitemapEntries(), ...dynamicEntries];
  } catch (error) {
    console.warn(
      "[sitemap] Aviso: não foi possível carregar URLs dinâmicas do sitemap.",
      error,
    );
    return getStaticSitemapEntries();
  }
}

export function buildSitemapXml(entries: MetadataRoute.Sitemap): string {
  const nodes = entries
    .map((entry) => {
      const lastModified =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : new Date(entry.lastModified || Date.now()).toISOString();
      const changeFrequency = entry.changeFrequency || "weekly";
      const priority =
        typeof entry.priority === "number" ? entry.priority.toFixed(1) : "0.5";

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</urlset>\n`;
}

export function buildSitemapIndexXml(sitemaps: string[]): string {
  const lastModified = new Date().toISOString();
  const nodes = sitemaps
    .map((sitemapUrl) =>
      [
        "  <sitemap>",
        `    <loc>${escapeXml(sitemapUrl)}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        "  </sitemap>",
      ].join("\n"),
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</sitemapindex>\n`;
}
