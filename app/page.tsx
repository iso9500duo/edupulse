'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  Play,
  PlusCircle,
  BrainCircuit,
  Flame,
  Award,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Compass,
  Trophy,
  Target,
  QrCode,
  GraduationCap,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { useAuth } from '@/components/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { playClick, playFanfare } = useSound();
  const { user } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGrade, setAiGrade] = useState('10');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/quizzes')
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data.quizzes || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    playClick();
    router.push(`/join?pin=${encodeURIComponent(pinInput.trim())}`);
  };

  const handleQuickAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    playClick();
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          gradeLevel: parseInt(aiGrade, 10),
          questionCount: 5,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const saveRes = await fetch('/api/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.result.title,
            description: data.result.description,
            gradeLevel: data.result.gradeLevel,
            difficulty: data.result.difficulty,
            questions: data.result.questions,
          }),
        });
        const savedData = await saveRes.json();
        setAiModalOpen(false);
        playFanfare();
        if (savedData.quiz?.id) {
          router.push(`/creator?id=${savedData.quiz.id}`);
        } else {
          router.push('/explore');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION: WARM CANVAS & WAYGROUND LUMINA */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-lumina-canvas rounded-3xl border border-[#340C24]/[0.08] shadow-lumina-level1 mx-2 sm:mx-6 mt-4">
        {/* Subtle Warm Ambient Glow */}
        <div className="absolute inset-0 bg-lumina-dots opacity-40 pointer-events-none" />

        {/* Floating Educator Co-Presence Cursor Pills (Stitch Design Specification) */}
        <div className="hidden lg:flex copresence-cursor top-8 left-12">
          <span className="w-2 h-2 rounded-full bg-[#E83389] animate-ping" />
          <span>Gamze Öğretmen</span>
        </div>
        <div className="hidden lg:flex copresence-cursor top-12 right-16 border-[#FF7A00]">
          <Sparkles className="w-3 h-3 text-[#FF7A00]" />
          <span>✦ AI Pedagogik Asistan</span>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-7 relative z-10">
          {/* Warm Lumina Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#340C24]/10 text-[#340C24] text-xs font-bold shadow-lumina-pill backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#E83389] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#E83389]" />
            <span>Wayground Lumina • Türkiye'nin Yeni Nesil İnteraktif Eğitim Platformu</span>
          </div>

          {/* Display Prompt Headline with Stylistic Italics */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#340C24] leading-tight font-display">
            Bugün ne <span className="italic text-[#E83389]">öğretmek</span> istersiniz?
          </h1>

          <p className="max-w-2xl mx-auto text-[#594048] text-base sm:text-lg leading-relaxed font-normal">
            Eğitimi <span className="italic font-semibold text-[#340C24]">zahmetsiz</span>, öğrenmeyi <span className="italic font-semibold text-[#FF7A00]">eğlenceli</span> kılan yeni nesil sınıf platformu. MEB müfredatı, 20 soru türü ve anında AI quiz üretimi.
          </p>

          {/* Inset Search / AI Prompt Bar */}
          <div className="max-w-xl mx-auto bg-white p-2 sm:p-2.5 rounded-full border border-[#340C24]/12 shadow-lumina-level2 transition focus-within:border-[#E83389] focus-within:ring-4 focus-within:ring-[#E83389]/15">
            <div className="flex items-center gap-2">
              <div className="pl-3.5 text-[#8C6F78]">
                <Sparkles className="w-5 h-5 text-[#E83389]" />
              </div>
              <input
                type="text"
                placeholder="Örn: 10. Sınıf Biyoloji Mitoz Bölünme, 10 soru..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleQuickAiGenerate();
                  }
                }}
                className="flex-1 bg-transparent text-[#340C24] placeholder-[#8C6F78] text-xs sm:text-sm font-medium focus:outline-none px-1"
              />
              <button
                onClick={handleQuickAiGenerate}
                disabled={aiLoading}
                className="btn-lumina-cta px-5 py-3 text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {aiLoading ? (
                  <span>Üretiliyor...</span>
                ) : (
                  <>
                    <span>AI ile Oluştur</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick PIN Join Box */}
          <div className="max-w-md mx-auto bg-white p-4 rounded-2xl border border-[#340C24]/[0.08] shadow-lumina-level1">
            <div className="text-xs font-bold text-[#594048] mb-2 flex items-center justify-between">
              <span>🎮 Canlı Yarışmaya Katıl</span>
              <span className="text-[11px] text-[#8C6F78] font-normal">Öğrenci Girişi</span>
            </div>
            <form onSubmit={handleJoinPin} className="flex gap-2">
              <input
                type="text"
                placeholder="6 Haneli PIN Kodu"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 bg-[#F5F1E6] text-[#340C24] placeholder-[#8C6F78] text-center font-extrabold tracking-widest text-base sm:text-lg rounded-xl px-3 py-2.5 border border-[#340C24]/10 focus:outline-none focus:border-[#E83389] transition font-mono"
              />
              <button
                type="submit"
                onClick={playClick}
                className="btn-lumina-cta px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Katıl</span>
              </button>
            </form>
            <div className="pt-2 text-[11px] text-[#8C6F78] flex items-center justify-center gap-1 font-medium">
              <QrCode className="w-3.5 h-3.5 text-[#E83389]" />
              <span>Akıllı tahta karekodunu okutarak da doğrudan katılabilirsiniz</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/creator"
              onClick={playClick}
              className="btn-lumina-cta px-5 py-3 text-xs sm:text-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sıfırdan Quiz Tasarla</span>
            </Link>

            <button
              onClick={() => {
                playClick();
                setAiModalOpen(true);
              }}
              className="btn-lumina-secondary px-5 py-3 text-xs sm:text-sm flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4 text-[#E83389]" />
              <span>AI Quiz Sihirbazı</span>
            </button>

            <Link
              href="/study"
              onClick={playClick}
              className="px-5 py-3 rounded-full bg-white hover:bg-[#F5F1E6] text-[#340C24] font-bold text-xs sm:text-sm border border-[#340C24]/12 shadow-sm transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-[#D97706]" />
              <span>Solo Modlar & Flashcards</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SUBJECT & RESOURCE SQUIRCLE TILES (Stitch Design Specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#340C24] font-display">
              Müfredat & Ders Alanları
            </h2>
            <p className="text-xs text-[#594048]">Pedagojik kazanımlara göre yapılandırılmış interaktif içerikler</p>
          </div>
          <Link
            href="/explore"
            onClick={playClick}
            className="text-xs font-bold text-[#E83389] hover:text-[#B40064] flex items-center gap-1 transition"
          >
            Tüm Dersler <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { name: 'Matematik', icon: '📐', bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', desc: 'Sayılar & Geometri' },
            { name: 'Fen Bilimleri', icon: '🔬', bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', desc: 'Fizik, Kimya, Biyo' },
            { name: 'Edebiyat', icon: '📖', bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', desc: 'Dil Bilgisi & Metin' },
            { name: 'Tarih & Sosyal', icon: '🏛️', bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', desc: 'Tarih & Coğrafya' },
            { name: 'Yabancı Dil', icon: '🌍', bg: 'bg-[#FFE0EC]', text: 'text-[#E83389]', desc: 'İngilizce & Almanca' },
            { name: 'Kodlama & AI', icon: '💻', bg: 'bg-[#EADDFF]', text: 'text-[#712ae2]', desc: 'Bilişim & Yazılım' },
          ].map((subj, idx) => (
            <Link
              key={idx}
              href={`/explore?subject=${encodeURIComponent(subj.name)}`}
              onClick={playClick}
              className="lumina-card p-4 text-center space-y-2.5 hover:scale-105 transition-all group flex flex-col items-center justify-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${subj.bg} ${subj.text} flex items-center justify-center text-2xl shadow-sm group-hover:rotate-6 transition transform`}>
                {subj.icon}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#340C24] group-hover:text-[#E83389] transition">
                  {subj.name}
                </div>
                <div className="text-[10px] text-[#8C6F78] mt-0.5">
                  {subj.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. STRUCTURAL BENTO GRID & AI "ANALYZE" SHEET (Stitch Specification) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Canlı Sınıf Yarışması Arenası (Span 2) */}
          <div className="md:col-span-2 lumina-card p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE0EC] text-[#E83389] text-xs font-bold border border-[#E83389]/20">
                <span className="w-2 h-2 rounded-full bg-[#E83389] animate-ping" />
                CANLI SINIF YARIŞMASI
              </div>
              <h3 className="text-2xl font-bold text-[#340C24]">
                Akıllı Tahta & Çok Oyunculu Gerçek Zamanlı Arena
              </h3>
              <p className="text-xs text-[#594048] max-w-xl leading-relaxed">
                Her oturum için otomatik oluşturulan benzersiz karekod (QR Code), anlık soru geri sayımı, hız bonusu, canlı podyum ve reaksiyon emojileriyle tüm sınıfı yarışmaya dahil edin.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-[#340C24]/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {['🦊 Ayşe', '🚀 Emre', '⚡ Can', '🦉 Zeynep'].map((name, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-[#F5F1E6] text-[#340C24] text-xs font-bold border border-[#340C24]/10 shadow-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>

              <Link
                href="/explore"
                onClick={playClick}
                className="btn-lumina-cta px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <span>Hemen Canlı Oyun Başlat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Floating AI "Analyze" Sheet (DESIGN.md line 232-235) */}
          <div className="lumina-card p-7 flex flex-col justify-between relative overflow-hidden border-[#E83389]/30 bg-gradient-to-b from-white to-[#FFF8F8]">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold border border-[#6D28D9]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#6D28D9]" />
                ✦ ANALİZ ET & ÖNER
              </div>
              <h3 className="text-xl font-bold text-[#340C24]">
                Akıllı Pedagojik Tanı
              </h3>
              <div className="space-y-2 text-xs text-[#594048] bg-[#FDFBF7] p-3 rounded-xl border border-[#340C24]/[0.08]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Kazanım: 10. Sınıf Edebiyat Hikâye</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E83389]" />
                  <span>Öneri: 8 soruluk pekiştirme yarışması</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Çeldiriciler MEB kazanımına uygun</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                setAiModalOpen(true);
              }}
              className="mt-5 w-full btn-lumina-cta py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <span>Alıştırma Kaynaklarını Bul →</span>
            </button>
          </div>

          {/* Card 3: 20 Soru Türü */}
          <div className="lumina-card p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] text-xs font-bold border border-[#0284C7]/20">
                20 FARKLI SORU TÜRÜ
              </div>
              <h3 className="text-xl font-bold text-[#340C24]">
                Zengin ve İnteraktif Değerlendirme
              </h3>
              <p className="text-xs text-[#594048] leading-relaxed">
                Çoktan seçmeli, Doğru/Yanlış, Metin Yanıtı, Slider, Puzzle/Sıralama ve Eşleştirme türleri.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                { name: 'Quiz', cls: 'bg-[#FEF3C7] text-[#D97706]' },
                { name: 'Doğru/Yanlış', cls: 'bg-[#E8F5E9] text-[#2E7D32]' },
                { name: 'Açık Uçlu', cls: 'bg-[#E0F2FE] text-[#0284C7]' },
                { name: 'Sıralama', cls: 'bg-[#EDE9FE] text-[#6D28D9]' },
                { name: 'Eşleştirme', cls: 'bg-[#FFE0EC] text-[#E83389]' },
              ].map((t, idx) => (
                <span key={idx} className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${t.cls}`}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Gamification & Tabular Educational Data (DESIGN.md 228-231) */}
          <div className="md:col-span-2 lumina-card p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-bold border border-[#D97706]/20">
                <Flame className="w-3.5 h-3.5 fill-[#D97706]" />
                OYUNLAŞTIRMA & ANALİTİK VERİLER
              </div>
              <h3 className="text-2xl font-bold text-[#340C24]">
                Doğruluk Oranı, Seri Rozetleri ve XP Liderlik Tablosu
              </h3>
              <p className="text-xs text-[#594048] max-w-xl leading-relaxed">
                Öğretmenler sınıf başarı eğrisini saniyeler içinde tarar; öğrenciler her doğru cevapla seri bonuslarını katlayarak rozet toplar.
              </p>
            </div>

            {/* Modular Data Metric Containers (DESIGN.md 229) */}
            <div className="mt-6 pt-5 border-t border-[#340C24]/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3.5 py-2 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold border border-[#2E7D32]/20 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#2E7D32]" />
                  <span>Doğruluk: %88</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-[#FEF3C7] text-[#D97706] text-xs font-bold border border-[#D97706]/20 flex items-center gap-2">
                  <Flame className="w-4 h-4 fill-[#D97706]" />
                  <span>7 Günlük Seri 🔥</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold border border-[#6D28D9]/20 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#6D28D9]" />
                  <span>2,450 XP ⚡</span>
                </div>
              </div>

              <Link
                href="/study"
                onClick={playClick}
                className="btn-lumina-secondary px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <span>Solo Modları Keşfet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPÜLER VE TREND QUİZLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#340C24] flex items-center gap-2 font-display">
              <Flame className="w-6 h-6 text-[#FF7A00] fill-[#FF7A00]" />
              <span>Trend & Popüler Quizler</span>
            </h2>
            <p className="text-xs text-[#594048] mt-0.5">En çok oynanan ve öğretmenlerin önerdiği interaktif içerikler</p>
          </div>
          <Link
            href="/explore"
            onClick={playClick}
            className="text-xs font-bold text-[#E83389] hover:text-[#B40064] flex items-center gap-1 transition"
          >
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white border border-[#340C24]/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizzes.slice(0, 6).map((quiz) => (
              <div
                key={quiz.id}
                className="lumina-card p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFE0EC] text-[#E83389] border border-[#E83389]/20">
                      {quiz.subject?.name || 'Müfredat'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#D97706]/20">
                      ⭐ {quiz.rating || 5.0}
                    </div>
                  </div>

                  <h3 className="font-bold text-[#340C24] text-base group-hover:text-[#E83389] transition line-clamp-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-[#594048] line-clamp-2 leading-relaxed">
                    {quiz.description || 'Müfredata uyumlu bilgi yarışması ve değerlendirme testi.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#8C6F78] pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8C6F78]" />
                      {quiz._count?.questions || quiz.questions?.length || 0} Soru
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#8C6F78]" />
                      {quiz.playCount || 0} Oynanma
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#340C24]/[0.08] flex items-center justify-between gap-2.5">
                  <Link
                    href={`/solo/${quiz.id}`}
                    onClick={playClick}
                    className="flex-1 py-2.5 text-center text-xs font-bold rounded-full bg-[#F5F1E6] hover:bg-[#FFE0EC] text-[#340C24] transition border border-[#340C24]/10"
                  >
                    Bireysel Oyna
                  </Link>

                  <button
                    onClick={async () => {
                      playClick();
                      const res = await fetch('/api/game/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quizId: quiz.id, mode: 'CLASSIC' }),
                      });
                      const data = await res.json();
                      if (data.pin) {
                        router.push(`/live/host/${data.pin}`);
                      }
                    }}
                    className="flex-1 py-2.5 text-center text-xs font-bold btn-lumina-cta flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Canlı Başlat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. AI GENERATOR MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#340C24]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-[#E83389]/25 rounded-3xl p-6 shadow-lumina-level2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#E83389] flex items-center justify-center shadow-md">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#340C24] text-lg">AI Quiz Sihirbazı</h3>
                  <p className="text-xs text-[#594048]">Konu girin, yapay zekâ müfredata uygun sorular hazırlasın</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-[#8C6F78] hover:text-[#340C24] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#340C24] mb-1">
                  Ders / Konu Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 10. Sınıf Hikâyenin Yapı Unsurları veya Fizik Basınç..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#340C24]/12 rounded-xl px-4 py-2.5 text-sm text-[#340C24] focus:outline-none focus:border-[#E83389] focus:ring-2 focus:ring-[#E83389]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#340C24] mb-1">
                  Sınıf Seviyesi
                </label>
                <select
                  value={aiGrade}
                  onChange={(e) => setAiGrade(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#340C24]/12 rounded-xl px-4 py-2.5 text-sm text-[#340C24] focus:outline-none focus:border-[#E83389]"
                >
                  <option value="9">9. Sınıf</option>
                  <option value="10">10. Sınıf</option>
                  <option value="11">11. Sınıf</option>
                  <option value="12">12. Sınıf & YKS Hazırlık</option>
                  <option value="8">8. Sınıf & LGS Hazırlık</option>
                </select>
              </div>

              <div className="p-3 bg-[#FFE0EC]/60 border border-[#E83389]/25 rounded-2xl text-xs text-[#B40064] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E83389] shrink-0" />
                <span>MEB kazanımlarına uygun, cevap açıklamaları ve çeldiricilerle birlikte üretilir.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-full bg-[#F5F1E6] hover:bg-[#FFE0EC] text-[#340C24] transition"
              >
                İptal
              </button>
              <button
                disabled={aiLoading || !aiTopic.trim()}
                onClick={handleQuickAiGenerate}
                className="btn-lumina-cta px-5 py-2.5 text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Üretiliyor...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>Hemen Quiz Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
