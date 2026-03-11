import type { NextConfig } from "next";
import nextPwa from "next-pwa";

type ImageRemotePattern = {
  protocol: "http" | "https";
  hostname: string;
};

function resolveRemotePatternFromUrl(value?: string): ImageRemotePattern[] {
  if (!value) return [];

  try {
    const parsed = new URL(value);
    const protocol = parsed.protocol.replace(":", "");

    if ((protocol !== "http" && protocol !== "https") || !parsed.hostname) {
      return [];
    }

    return [
      {
        protocol: protocol as "http" | "https",
        hostname: parsed.hostname,
      },
    ];
  } catch {
    return [];
  }
}

const apiRemotePatterns = [
  ...resolveRemotePatternFromUrl(process.env.NEXT_PUBLIC_API_URL),
  ...resolveRemotePatternFromUrl(process.env.PUBLIC_API_URL),
  ...resolveRemotePatternFromUrl(process.env.BACKEND_URL),
  ...resolveRemotePatternFromUrl(process.env.API_URL),
  {
    protocol: "https",
    hostname: "contratamusico-backend-production.up.railway.app",
  } satisfies ImageRemotePattern,
];

const uniqueApiRemotePatterns = apiRemotePatterns.filter(
  (pattern, index, allPatterns) =>
    allPatterns.findIndex(
      (item) =>
        item.protocol === pattern.protocol && item.hostname === pattern.hostname
    ) === index
);

const withPWA = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.railway.app",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "t3.storageapi.dev",
      },
      {
        protocol: "https",
        hostname: "*.storageapi.dev",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      ...uniqueApiRemotePatterns,
    ],
  },
};

export default withPWA(nextConfig as Parameters<typeof withPWA>[0]);
