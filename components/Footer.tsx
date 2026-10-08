import React from 'react';
import Link from 'next/link';
import { Zap, Heart, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#340C24] text-[#E0BEC7] text-sm mt-24 border-t border-[#4D213A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 text-xl font-extrabold text-white">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#E83389] flex items-center justify-center shadow-md shadow-[#E83389]/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display">
                Edu<span className="text-[#FFB0CA]">Pulse</span>
              </span>
            </div>
            <p className="text-xs text-[#E0BEC7] leading-relaxed">
              Öğretmenler için zahmetsiz içerik orkestrasyonu, öğrenciler için eğlenceli ve etkileşimli oyunlaştırılmış öğrenme ortamı. Soft Neomorphic sıcaklık ve dinamik sınıf pedagojisi.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#A7F3D0] font-semibold bg-[#2E7D32]/20 border border-[#2E7D32]/30 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>Wayground Lumina Tasarım Sistemi</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-bold mb-3.5 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/explore" className="hover:text-white transition">Quiz Keşfet</Link></li>
              <li><Link href="/creator" className="hover:text-white transition">Quiz Oluşturucu</Link></li>
              <li><Link href="/courses" className="hover:text-white transition">İnteraktif Kurslar</Link></li>
              <li><Link href="/stories" className="hover:text-white transition">Microlearning Hikâyeleri</Link></li>
              <li><Link href="/study" className="hover:text-white transition">Flashcards & Solo</Link></li>
            </ul>
          </div>

          {/* Eğitimci & Okul */}
          <div>
            <h4 className="text-white font-bold mb-3.5 text-xs uppercase tracking-wider">Eğitimci & Okul</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/classes" className="hover:text-white transition">Sınıf Yönetimi (9/A, 10/B)</Link></li>
              <li><Link href="/question-bank" className="hover:text-white transition">Soru Bankası & Excel Aktarım</Link></li>
              <li><Link href="/reports" className="hover:text-white transition">Ayrıntılı Raporlama & Export</Link></li>
              <li><Link href="/marketplace" className="hover:text-white transition">İçerik Pazaryeri</Link></li>
              <li><Link href="/premium" className="hover:text-white transition">Okul & Kurumsal Planlar</Link></li>
            </ul>
          </div>

          {/* AI & Güvenlik */}
          <div>
            <h4 className="text-white font-bold mb-3.5 text-xs uppercase tracking-wider">Yapay Zekâ & Güvenlik</h4>
            <p className="text-xs text-[#E0BEC7] mb-3 leading-relaxed">
              Konudan, PDF'ten ve ders notlarından saniyeler içinde MEB müfredatına tam uyumlu 20 soru türünde içerik üretin.
            </p>
            <div className="p-3 bg-[#4D213A]/60 rounded-2xl border border-[#E83389]/30 text-xs text-[#FFECF2] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FF7A00] shrink-0" />
              <span>WCAG 2.2 AAA & PWA Uyumlu</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#4D213A] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E0BEC7]">
          <div>
            © {new Date().getFullYear()} EduPulse. Wayground Lumina Pedagogical Design System.
          </div>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span>Türkçe & İngilizce Desteği</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-white font-medium">
              Eğitim için tasarlandı <Heart className="w-3.5 h-3.5 text-[#E83389] fill-[#E83389]" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
