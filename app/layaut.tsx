import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne-var",   // coincide con @theme: var(--font-syne-var)
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-var",     // coincide con @theme: var(--font-dm-var)
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV.AI — Tu CV potenciado con inteligencia artificial",
  description:
    "Sube tu CV, la IA lo valida, corrige y traduce. Encuentra ofertas de empleo con afinidad real.",
  openGraph: {
    title: "CV.AI — Tu CV potenciado con IA",
    description: "Optimiza, traduce y valida tu CV con IA en minutos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="antialiased font-dm">{children}</body>
    </html>
  );
}