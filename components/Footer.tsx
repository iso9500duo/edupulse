import React from 'react';
import Link from 'next/link';
import { Zap, Heart, ShieldCheck, Globe, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080c14] border-t border-slate-800 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-black text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span>EduPulse</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern, ölçeklenebilir ve gerçek zamanlı yeni nesil eğitim ve canlı yarışma platformu. MEB müfredatı, yapay zekâ entegrasyonu ve zengin oyunlaştırma mekanikleriyle öğrenmeyi eğlenceli hale getirin.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Özgün Tasarım & Lisanslı İçerik Sistemi</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/explore" className="hover:text-white transition">Quiz Keşfet</Link></li>
              <li><Link href="/creator" className="hover:text-white transition">Quiz Oluşturucu</Link></li>
              <li><Link href="/courses" className="hover:text-white transition">İnteraktif Kurslar</Link></li>
              <li><Link href="/stories" className="hover:text-white transition">Microlearning Hikâyeleri</Link></li>
              <li><Link href="/study" className="hover:text-white transition">Flashcards & Solo</Link></li>
            </ul>
          </div>

          {/* Öğretmen & Okul */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Eğitimci & Okul</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/classes" className="hover:text-white transition">Sınıf Yönetimi (9/A, 10/B)</Link></li>
              <li><Link href="/question-bank" className="hover:text-white transition">Soru Bankası & Excel Aktarım</Link></li>
              <li><Link href="/reports" className="hover:text-white transition">Ayrıntılı Raporlama & Export</Link></li>
              <li><Link href="/marketplace" className="hover:text-white transition">İçerik Pazaryeri</Link></li>
              <li><Link href="/premium" className="hover:text-white transition">Okul & Kurumsal Planlar</Link></li>
            </ul>
          </div>

          {/* AI & Uyumluluk */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Yapay Zekâ & Güvenlik</h4>
            <p className="text-xs text-slate-400 mb-3">
              Google Gemini ve OpenAI mimarisiyle konudan, PDF'ten ve ders notlarından saniyeler içinde müfredat uyumlu sorular üretin.
            </p>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>WCAG 2.2 AA ve PWA Mobil Uyumlu</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} EduPulse Platformu. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>Türkçe & İngilizce Desteği</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Eğitim için tasarlandı <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
