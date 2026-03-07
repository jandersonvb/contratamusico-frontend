import type { Metadata } from "next";
import { withSiteUrl } from "./env";

const SITE_NAME = "Contrata Músico";
const DEFAULT_IMAGE_PATH = "/images/logo.png";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
  follow?: boolean;
  type?: "website" | "profile";
  image?: string;
};

function getRobots(index: boolean, follow: boolean): Metadata["robots"] {
  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

function resolveImageUrl(imagePath: string): string {
  return imagePath.startsWith("http") ? imagePath : withSiteUrl(imagePath);
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
  follow = true,
  type = "website",
  image = DEFAULT_IMAGE_PATH,
}: PageMetadataOptions): Metadata {
  const canonical = withSiteUrl(path);
  const socialTitle = `${title} | ${SITE_NAME}`;
  const imageUrl = resolveImageUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: getRobots(index, follow),
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: imageUrl,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function buildNoIndexMetadata({
  title,
  description,
  path,
}: Pick<PageMetadataOptions, "title" | "description" | "path">): Metadata {
  return buildPageMetadata({
    title,
    description,
    path,
    index: false,
    follow: false,
  });
}
