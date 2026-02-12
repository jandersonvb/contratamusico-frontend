import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { ConditionalFooter } from "./components/Footer/ConditionalFooter";
import { Navbar } from "./components/Navbar/Navbar";
import { ChatProvider } from "./components/ChatProvider";
import { FloatingChat } from "./components/FloatingChat";
import { OrganizationSchema } from "./components/StructuredData/OrganizationSchema";
import { WebsiteSchema } from "./components/StructuredData/WebsiteSchema";
import GoogleTagManager from "./components/analytics/GoogleTagManager";
import MicrosoftClarity from "./components/analytics/MicrosoftClarity";
import AnalyticsEnvCheck from "./components/analytics/AnalyticsEnvCheck";
import { UtmTracker } from "./components/analytics/UtmTracker";

import { Toaster } from "sonner";



const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://contratamusico.com.br";
const gtmId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Contrata Músico - Encontre Músicos Profissionais para seu Evento",
    template: "%s | Contrata Músico",
  },
  description: 
    "Plataforma completa para contratar músicos profissionais. Encontre bandas, DJs, cantores e instrumentistas para casamentos, festas e eventos. Contrate de forma fácil e segura.",
  keywords: [
    "contratar músico",
    "músicos para eventos",
    "banda para casamento",
    "DJ para festa",
    "músicos profissionais",
    "show ao vivo",
    "entretenimento musical",
    "contratar banda",
    "músico para evento",
    "evento musical",
  ],
  authors: [{ name: "Contrata Músico" }],
  creator: "Contrata Músico",
  publisher: "Contrata Músico",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Contrata Músico",
  },
  applicationName: "Contrata Músico",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon", url: "/images/logo.svg", color: "#000000" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Contrata Músico",
    title: "Contrata Músico - Encontre Músicos Profissionais para seu Evento",
    description: 
      "Plataforma completa para contratar músicos profissionais. Encontre bandas, DJs, cantores e instrumentistas para casamentos, festas e eventos.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Contrata Músico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrata Músico - Encontre Músicos Profissionais para seu Evento",
    description: 
      "Plataforma completa para contratar músicos profissionais. Encontre bandas, DJs, cantores e instrumentistas para casamentos, festas e eventos.",
    images: [`${siteUrl}/og-image.jpg`],
    creator: "@contratamusico",
    site: "@contratamusico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "./",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "78iEsEjnf1W9mQAAp_AehgJj_qghDXctMF23nObHhqM",
    other: {
      "facebook-domain-verification": process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Contrata Músico" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Dados Estruturados */}
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className="antialiased overflow-x-hidden max-w-screen">
        <ChatProvider>
          <Navbar />
          <Suspense fallback={null}>
            <UtmTracker />
          </Suspense>
          {children}
          <ConditionalFooter />
          <FloatingChat />
        </ChatProvider>
        <Toaster richColors position="bottom-right" />

        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {clarityProjectId && <MicrosoftClarity projectId={clarityProjectId} />}
        <AnalyticsEnvCheck />
      </body>
    </html>
  );
}
