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
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#E83389" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#340C24] font-sans antialiased selection:bg-[#E83389] selection:text-white">
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
