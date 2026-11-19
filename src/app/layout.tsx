import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nocaute Hub — Sites de Alta Conversão para Academias de Luta",
  description:
    "Plataforma SaaS multi-tenant que transforma academias de Jiu-Jitsu, Muay Thai, Boxe e MMA em máquinas de agendamento de aulas experimentais pelo WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#0C0C0C] text-neutral-100 antialiased selection:bg-rose-600/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
