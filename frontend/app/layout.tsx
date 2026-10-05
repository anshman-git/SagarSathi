import React from 'react';
import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'SagarMitra — Agentic AI Marine Intelligence Platform',
  description: 'Conversational multi-agent decision support platform for fishermen and marine authorities in Indian regional languages (ISRO / NRSC SIH 2026).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-ocean-950 text-slate-100 antialiased font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
