const DEFAULT_SITE_URL = "https://contratamusico.com.br";
const DEFAULT_DEV_API_URL = "http://localhost:3000";
const DEFAULT_PRODUCTION_API_URL =
  "https://contratamusico-backend-production.up.railway.app";

function normalizeUrl(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.replace(/\/+$/, "");
}

function isLocalUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0"
    );
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.SITE_URL) ||
    DEFAULT_SITE_URL
  );
}

export function withSiteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getCanonicalHost(): string {
  return new URL(getSiteUrl()).hostname;
}

export function getApiBaseUrl(): string {
  const publicApiUrl = normalizeUrl(process.env.NEXT_PUBLIC_API_URL);
  const isLocalPublicApiUrl = publicApiUrl ? isLocalUrl(publicApiUrl) : false;
  const hasInvalidPublicProductionUrl =
    process.env.NODE_ENV === "production" &&
    isLocalPublicApiUrl;

  if (typeof window !== "undefined") {
    return (
      (hasInvalidPublicProductionUrl ? null : publicApiUrl) ||
      (process.env.NODE_ENV === "production"
        ? DEFAULT_PRODUCTION_API_URL
        : DEFAULT_DEV_API_URL)
    );
  }

  const privateApiUrl = normalizeUrl(process.env.API_URL);

  if (privateApiUrl) {
    return privateApiUrl;
  }

  if (publicApiUrl && !isLocalPublicApiUrl) {
    return publicApiUrl;
  }

  return process.env.NODE_ENV === "production"
    ? DEFAULT_PRODUCTION_API_URL
    : publicApiUrl || DEFAULT_DEV_API_URL;
}
