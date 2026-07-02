import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Inge — Smart Grids | NTC 2050 & RETIE",
  description: "Plataforma SaaS para ingenieros y electricistas en Colombia. Cálculos NTC 2050, motores, reactiva, presupuestos, clientes y reportes profesionales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0F172A] text-slate-100 font-sans">{children}</body>
    </html>
  );
}
