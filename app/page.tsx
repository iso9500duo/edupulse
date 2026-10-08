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
        // Automatically save to database as quiz
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
      {/* 1. HERO SECTION WITH COSMIC AURORA MESH */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-6 lg:px-8 bg-aurora-mesh rounded-3xl border border-white/10 shadow-2xl mx-2 sm:mx-6 mt-4">
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-brand-500/30 text-brand-300 text-xs font-bold shadow-lg shadow-brand-500/20 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Türkiye'nin Yeni Nesil İnteraktif Eğitim & Canlı Yarışma Platformu</span>
          </div>

          {/* High-Impact Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight font-display">
            Öğrenmeyi Canlandır,{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-cyan bg-clip-text text-transparent">
              Zirveye Yarış!
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-lg leading-relaxed font-normal">
            Canlı sınıf yarışmaları, tek başına solo modlar, MEB uyumlu 20 soru türü ve yapay zekâ ile saniyeler içinde quiz üretimi tek bir platformda.
          </p>

          {/* Quick PIN Join Box with 3D tactile styling */}
          <div className="max-w-md mx-auto bg-slate-900/90 p-3 sm:p-4 rounded-3xl border border-white/15 shadow-2xl backdrop-blur-xl transition hover:border-brand-500/50">
            <form onSubmit={handleJoinPin} className="flex gap-2.5">
              <input
                type="text"
                placeholder="6 Haneli Oyun PIN Kodunu Gir"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 bg-slate-800/90 text-white placeholder-slate-400 text-center font-black tracking-widest text-lg sm:text-xl rounded-2xl px-4 py-3.5 border border-slate-700/80 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition shadow-inner font-mono"
              />
              <button
                type="submit"
                onClick={playClick}
                className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-base rounded-2xl shadow-tactile-brand btn-tactile transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Katıl</span>
              </button>
            </form>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <span>Akıllı tahta veya öğretmenin paylaştığı karekodu da okutabilirsiniz</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/creator"
              onClick={playClick}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan text-white font-black text-sm shadow-tactile-brand btn-tactile transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Yeni Quiz Oluştur</span>
            </Link>

            <button
              onClick={() => {
                playClick();
                setAiModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold text-sm border border-purple-500/40 shadow-lg shadow-purple-900/20 hover:border-purple-400 transition flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>AI ile Quiz Üret</span>
            </button>

            <Link
              href="/study"
              onClick={playClick}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-emerald-300 font-bold text-sm border border-emerald-500/30 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Solo Modlar & Flashcards</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID FEATURE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Live Multiplayer Game (Span 2) */}
          <div className="md:col-span-2 bento-card bento-card-interactive p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                CANLI SINIF YARIŞMASI
              </div>
              <h3 className="text-2xl font-black text-white">
                Akıllı Tahta & Gerçek Zamanlı Çok Oyunculu Yarışma
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Her oyun için benzersiz karekod (QR Code), anlık soru geri sayımı, hız bonusu, canlı podyum ve reaksiyon emojileriyle tüm sınıfı yarışmaya dahil edin.
              </p>
            </div>

            {/* Interactive simulation preview inside card */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {['🦊 Ayşe', '🚀 Emre', '⚡ Can', '🦉 Zeynep'].map((name, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-white shadow-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>

              <Link
                href="/explore"
                onClick={playClick}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Hemen Canlı Oyun Başlat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: AI Quiz Studio */}
          <div className="bento-card bento-card-interactive p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                <BrainCircuit className="w-3.5 h-3.5" />
                AI QUESTION STUDIO
              </div>
              <h3 className="text-2xl font-black text-white">
                Yapay Zekâ ile Anında Soru Üretimi
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ders ve kazanım belirleyin; yapay zekâ MEB formatında çeldiricileri, cevap açıklamalarını ve süreleri otomatik hazırlasın.
              </p>
            </div>

            <button
              onClick={() => {
                playClick();
                setAiModalOpen(true);
              }}
              className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI Quiz Sihirbazını Aç</span>
            </button>
          </div>

          {/* Bento Card 3: 20 Question Types */}
          <div className="bento-card bento-card-interactive p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                20 FARKLI SORU TÜRÜ
              </div>
              <h3 className="text-xl font-black text-white">
                Zengin ve İnteraktif Değerlendirme
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Çoktan seçmeli, Doğru/Yanlış, Metin Yanıtı, Slider, Puzzle/Sıralama ve Eşleştirme türleri.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Quiz', 'Doğru/Yanlış', 'Metin', 'Sıralama', 'Slider', 'Eşleştirme'].map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-semibold text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Card 4: Gamification & Rewards (Span 2) */}
          <div className="md:col-span-2 bento-card bento-card-interactive p-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                OYUNLAŞTIRMA & ÖDÜLLER
              </div>
              <h3 className="text-2xl font-black text-white">
                XP Seviyeleri, Rozetler & Liderlik Tablosu
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Öğrenciler tamamladıkları quizlerle XP kazanır, seri (streak) bonuslarını katlar ve okul/sınıf sıralamasında zirveye yarışır.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>7 Günlük Seri 🔥</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold">
                  <span>Level 4 • 2,450 XP ⚡</span>
                </div>
              </div>

              <Link
                href="/study"
                onClick={playClick}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>Solo Modları Keşfet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPÜLER VE TREND QUİZLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 font-display">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>Trend & Popüler Quizler</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">En çok oynanan ve öğretmenlerin önerdiği içerikler</p>
          </div>
          <Link
            href="/explore"
            onClick={playClick}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
          >
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizzes.slice(0, 6).map((quiz) => (
              <div
                key={quiz.id}
                className="bento-card p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      {quiz.subject?.name || 'Müfredat'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      ⭐ {quiz.rating || 5.0}
                    </div>
                  </div>

                  <h3 className="font-black text-white text-base group-hover:text-brand-300 transition line-clamp-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Müfredata uyumlu bilgi yarışması ve değerlendirme testi.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {quiz._count?.questions || quiz.questions?.length || 0} Soru
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {quiz.playCount || 0} Oynanma
                    </span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between gap-2.5">
                  <Link
                    href={`/solo/${quiz.id}`}
                    onClick={playClick}
                    className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700/80"
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
                    className="flex-1 py-2.5 text-center text-xs font-black rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-tactile-brand btn-tactile transition flex items-center justify-center gap-1.5"
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

      {/* 4. DERSLER & KATEGORİLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-display">
            <BookOpen className="w-6 h-6 text-brand-400" />
            <span>Müfredat Dersleri</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Sınıf düzeyine ve derslere göre filtrelenmiş içerikler</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { name: 'Türk Dili ve Edebiyatı', icon: '📖', color: 'from-blue-600/25 to-indigo-900/30', border: 'border-blue-500/30' },
            { name: 'Matematik', icon: '📐', color: 'from-emerald-600/25 to-teal-900/30', border: 'border-emerald-500/30' },
            { name: 'Fizik & Fen', icon: '⚡', color: 'from-amber-600/25 to-orange-900/30', border: 'border-amber-500/30' },
            { name: 'Kimya & Biyoloji', icon: '🧬', color: 'from-pink-600/25 to-rose-900/30', border: 'border-pink-500/30' },
            { name: 'Tarih & Coğrafya', icon: '🌍', color: 'from-purple-600/25 to-violet-900/30', border: 'border-purple-500/30' },
            { name: 'Bilişim & Kodlama', icon: '💻', color: 'from-cyan-600/25 to-blue-900/30', border: 'border-cyan-500/30' },
          ].map((subj, idx) => (
            <Link
              key={idx}
              href={`/explore?subject=${encodeURIComponent(subj.name)}`}
              onClick={playClick}
              className={`p-4 rounded-2xl bg-gradient-to-b ${subj.color} border ${subj.border} hover:scale-105 transition-all text-center space-y-2 group shadow-lg backdrop-blur-md`}
            >
              <div className="text-3xl group-hover:scale-125 transition transform duration-300">{subj.icon}</div>
              <div className="font-bold text-xs text-slate-200 group-hover:text-white transition">
                {subj.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. AI GENERATOR MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">AI Quiz Üreticisi</h3>
                  <p className="text-xs text-slate-400">Konu girin, yapay zekâ müfredata uygun sorular hazırlasın</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ders / Konu Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 10. Sınıf Hikâyenin Yapı Unsurları veya Fizik Basınç..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sınıf Seviyesi
                </label>
                <select
                  value={aiGrade}
                  onChange={(e) => setAiGrade(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="9">9. Sınıf</option>
                  <option value="10">10. Sınıf</option>
                  <option value="11">11. Sınıf</option>
                  <option value="12">12. Sınıf & YKS Hazırlık</option>
                  <option value="8">8. Sınıf & LGS Hazırlık</option>
                </select>
              </div>

              <div className="p-3 bg-brand-950/40 border border-brand-800/40 rounded-xl text-xs text-brand-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>MEB kazanımlarına uygun, cevap açıklamaları ve çeldiricilerle birlikte üretilir.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                İptal
              </button>
              <button
                disabled={aiLoading || !aiTopic.trim()}
                onClick={handleQuickAiGenerate}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
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
