import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { SoundProvider } from '@/components/SoundProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'EduPulse | Yeni Nesil Gerçek Zamanlı Eğitim & Canlı Yarışma Platformu',
  description: 'Canlı sınıf yarışmaları, solo çalışma, yapay zekâ destekli soru üretimi, MEB müfredatı soru bankası, kurslar ve oyunlaştırma sistemi.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <SoundProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </SoundProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
