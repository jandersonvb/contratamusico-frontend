import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "./components/Footer/Footer";
import { Navbar } from "./components/Navbar/Navbar";

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

export const metadata: Metadata = {
  title: "Contrata Músico",
  description: "Encontre músicos para seu evento de forma fácil e rápida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
        <Toaster richColors />
      </body>
    </html>
  );
}
