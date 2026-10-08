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
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-950/40 via-slate-900/60 to-transparent border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Türkiye'nin En Gelişmiş Gerçek Zamanlı Eğitim & Yarışma Platformu</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Öğrenmeyi Canlandır,{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-accent-cyan bg-clip-text text-transparent">
              Zirveye Yarış!
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Canlı sınıf yarışmaları, tek başına solo modlar, MEB uyumlu soru bankası ve yapay zekâ ile saniyeler içinde quiz üretimi tek bir platformda.
          </p>

          {/* Quick PIN Join Box */}
          <div className="max-w-md mx-auto bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-700/80 shadow-2xl shadow-brand-900/40 backdrop-blur-lg">
            <form onSubmit={handleJoinPin} className="flex gap-2">
              <input
                type="text"
                placeholder="6 Haneli Oyun PIN Kodunu Gir"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 bg-slate-800/90 text-white placeholder-slate-400 text-center font-black tracking-widest text-lg sm:text-xl rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-brand-500 transition"
              />
              <button
                type="submit"
                onClick={playClick}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base rounded-xl shadow-lg shadow-brand-600/40 transition flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Katıl
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/creator"
              onClick={playClick}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 shadow-md transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-brand-400" />
              Quiz Oluştur
            </Link>

            <button
              onClick={() => {
                playClick();
                setAiModalOpen(true);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-brand-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4 text-purple-200" />
              AI ile Quiz Oluştur
            </button>

            <Link
              href="/study"
              onClick={playClick}
              className="px-6 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-sm border border-emerald-500/30 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              Solo Çalış & Flashcards
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS & MEB CURRICULUM HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl font-black text-brand-400">20+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">İnteraktif Soru Türü</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl font-black text-accent-cyan">%100</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">MEB Müfredat Uyumu</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl font-black text-amber-400">Realtime</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Ultra Düşük Gecikmeli Canlı Oyun</div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-3xl font-black text-emerald-400">AI Powered</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Otomatik Soru & Story Üretimi</div>
          </div>
        </div>
      </section>

      {/* 3. POPÜLER VE TREND QUİZLER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              Trend & Popüler Quizler
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">En çok oynanan ve öğretmenlerin önerdiği içerikler</p>
          </div>
          <Link
            href="/explore"
            onClick={playClick}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
          >
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizzes.slice(0, 6).map((quiz) => (
              <div
                key={quiz.id}
                className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-all p-5 flex flex-col justify-between shadow-lg hover:shadow-brand-900/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {quiz.subject?.name || 'Genel'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                      ⭐ {quiz.rating || 5.0}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition line-clamp-2">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Müfredata uyumlu bilgi yarışması ve değerlendirme testi.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
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

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Link
                    href={`/solo/${quiz.id}`}
                    onClick={playClick}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
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
                    className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-white" />
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
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" />
            Müfredat Dersleri
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Sınıf düzeyine ve derslere göre filtrelenmiş içerikler</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Türk Dili ve Edebiyatı', icon: '📖', color: 'from-blue-600/30 to-indigo-900/30' },
            { name: 'Matematik', icon: '📐', color: 'from-emerald-600/30 to-teal-900/30' },
            { name: 'Fizik & Fen', icon: '⚡', color: 'from-amber-600/30 to-orange-900/30' },
            { name: 'Kimya & Biyoloji', icon: '🧬', color: 'from-pink-600/30 to-rose-900/30' },
            { name: 'Tarih & Coğrafya', icon: '🌍', color: 'from-purple-600/30 to-violet-900/30' },
            { name: 'Bilişim & Kodlama', icon: '💻', color: 'from-cyan-600/30 to-blue-900/30' },
          ].map((subj, idx) => (
            <Link
              key={idx}
              href={`/explore?subject=${encodeURIComponent(subj.name)}`}
              onClick={playClick}
              className={`p-4 rounded-xl bg-gradient-to-b ${subj.color} border border-slate-800 hover:border-brand-500/50 transition text-center space-y-2 group`}
            >
              <div className="text-2xl group-hover:scale-110 transition transform">{subj.icon}</div>
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
