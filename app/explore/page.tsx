'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Flame,
  Clock,
  Users,
  Play,
  Heart,
  BookOpen,
  Crown,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playClick } = useSound();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedSubject, selectedGrade, selectedDifficulty, onlyPremium]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSubject !== 'ALL') params.append('subject', selectedSubject);
      if (selectedGrade !== 'ALL') params.append('grade', selectedGrade);
      if (selectedDifficulty !== 'ALL') params.append('difficulty', selectedDifficulty);
      if (onlyPremium) params.append('isPremium', 'true');

      const res = await fetch(`/api/quizzes?${params.toString()}`);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuizzes();
  };

  const toggleFavorite = (id: string) => {
    playClick();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black text-white">Quiz ve İçerik Keşfi</h1>
          <p className="text-sm text-slate-400">MEB müfredatına ve sınıf düzeyine uygun binlerce özgün quiz ve soru</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Quiz adı, konu, ders, öğretmen veya etiket ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 shadow-inner text-sm transition"
            />
          </div>
          <button
            type="submit"
            onClick={playClick}
            className="px-7 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-tactile-brand btn-tactile transition"
          >
            Ara
          </button>
        </form>
      </div>

      {/* Filter Bar with Bento Glass styling */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 text-xs shadow-lg">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold mr-2">
          <Filter className="w-4 h-4 text-brand-400" />
          Filtrele:
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 font-semibold"
        >
          <option value="ALL">Tüm Dersler</option>
          <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
          <option value="Matematik">Matematik</option>
          <option value="Fizik">Fizik</option>
          <option value="Kimya">Kimya</option>
          <option value="Biyoloji">Biyoloji</option>
          <option value="Tarih">Tarih</option>
          <option value="Coğrafya">Coğrafya</option>
        </select>

        {/* Grade Filter */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 font-semibold"
        >
          <option value="ALL">Tüm Sınıflar</option>
          <option value="9">9. Sınıf</option>
          <option value="10">10. Sınıf</option>
          <option value="11">11. Sınıf</option>
          <option value="12">12. Sınıf & YKS</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-slate-800/90 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 font-semibold"
        >
          <option value="ALL">Tüm Zorluklar</option>
          <option value="EASY">Kolay</option>
          <option value="MEDIUM">Orta</option>
          <option value="HARD">Zor</option>
        </select>

        {/* Premium Only Toggle */}
        <button
          type="button"
          onClick={() => setOnlyPremium(!onlyPremium)}
          className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition font-bold ${
            onlyPremium
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          Sadece Premium
        </button>

        {/* Clear filters */}
        {(selectedSubject !== 'ALL' || selectedGrade !== 'ALL' || selectedDifficulty !== 'ALL' || onlyPremium) && (
          <button
            onClick={() => {
              setSelectedSubject('ALL');
              setSelectedGrade('ALL');
              setSelectedDifficulty('ALL');
              setOnlyPremium(false);
            }}
            className="text-slate-400 hover:text-rose-400 ml-auto font-bold transition"
          >
            Filtreleri Temizle ✕
          </button>
        )}
      </div>

      {/* Quizzes Grid with Bento Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Aradığınız kriterlere uygun quiz bulunamadı</h3>
          <p className="text-xs text-slate-400">Filtreleri değiştirmeyi deneyebilir veya kendi quizinizi oluşturabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isFav = favorites.includes(quiz.id);
            return (
              <div
                key={quiz.id}
                className="bento-card p-6 flex flex-col justify-between relative group"
              >
                {/* Favorite Icon */}
                <button
                  onClick={() => toggleFavorite(quiz.id)}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 transition"
                  title="Favorilere Ekle"
                >
                  <Heart
                    className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`}
                  />
                </button>

                <div className="space-y-3.5 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      {quiz.subject?.name || 'Müfredat'}
                    </span>
                    {quiz.isPremium && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> PRO
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-white text-base group-hover:text-brand-300 transition line-clamp-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {quiz.description || 'MEB müfredatına uygun interaktif değerlendirme quizi.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {quiz._count?.questions || 0} Soru
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {quiz.playCount || 0} Oynanma
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">⭐ {quiz.rating || 5.0}</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-slate-400">Yükleniyor...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
