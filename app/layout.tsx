import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "./components/Footer/Footer";
import { Navbar } from "./components/Navbar/Navbar";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { OrganizationSchema } from "./components/StructuredData/OrganizationSchema";
import { WebsiteSchema } from "./components/StructuredData/WebsiteSchema";

import { Inter, Poppins } from "next/font/google";

import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratamusico.com.br';

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
    canonical: siteUrl,
  },
  verification: {
    google: "78iEsEjnf1W9mQAAp_AehgJj_qghDXctMF23nObHhqM",
    // Adicione após verificar no Google Search Console
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
        {/* Dados Estruturados */}
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
        <Toaster richColors position="bottom-right" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
