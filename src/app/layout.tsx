import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radar Digital - Plan de Gobierno Perú 2026",
  description: "Análisis de las propuestas tecnológicas de los partidos políticos para las elecciones generales del Perú 2026. Plataforma de transparencia y análisis de políticas públicas.",
  keywords: ["Radar Digital", "Perú 2026", "Elecciones Perú", "Análisis Político", "Propuestas Tecnológicas", "Plan de Gobierno", "Gestión Pública", "Tecnología y Estado"],
  authors: [{ name: "Equipo Radar Digital" }],
  icons: {
    icon: "/radar-icon.svg",
  },
  openGraph: {
    title: "Radar Digital - Plan de Gobierno Perú 2026",
    description: "Análisis de las propuestas tecnológicas de los partidos políticos para las elecciones generales del Perú 2026",
    url: "https://radardigital.pe",
    siteName: "Radar Digital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Radar Digital - Plan de Gobierno Perú 2026",
    description: "Análisis de las propuestas tecnológicas de los partidos políticos para las elecciones generales del Perú 2026",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
