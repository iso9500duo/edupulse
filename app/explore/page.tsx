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
          <h1 className="text-3xl font-bold text-[#340C24] font-display">
            Quiz ve İçerik Keşfi
          </h1>
          <p className="text-sm text-[#594048]">MEB müfredatına ve sınıf düzeyine uygun binlerce özgün quiz ve değerlendirme testi</p>
        </div>

        {/* Search Bar with Inset Capsule */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#8C6F78]" />
            <input
              type="text"
              placeholder="Quiz adı, konu, ders, öğretmen veya etiket ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#340C24]/12 rounded-full text-[#340C24] placeholder-[#8C6F78] focus:outline-none focus:border-[#E83389] focus:ring-4 focus:ring-[#E83389]/15 shadow-lumina-level1 text-sm font-medium transition"
            />
          </div>
          <button
            type="submit"
            onClick={playClick}
            className="btn-lumina-cta px-7 py-3.5 text-sm"
          >
            Ara
          </button>
        </form>
      </div>

      {/* Filter Bar with Wayground Lumina styling */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-[#340C24]/[0.08] text-xs shadow-lumina-level1">
        <div className="flex items-center gap-1.5 text-[#340C24] font-bold mr-2">
          <Filter className="w-4 h-4 text-[#E83389]" />
          Filtrele:
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-[#F5F1E6] border border-[#340C24]/10 text-[#340C24] rounded-xl px-3 py-2 focus:outline-none focus:border-[#E83389] font-bold"
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
          className="bg-[#F5F1E6] border border-[#340C24]/10 text-[#340C24] rounded-xl px-3 py-2 focus:outline-none focus:border-[#E83389] font-bold"
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
          className="bg-[#F5F1E6] border border-[#340C24]/10 text-[#340C24] rounded-xl px-3 py-2 focus:outline-none focus:border-[#E83389] font-bold"
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
              ? 'bg-[#FFE0EC] text-[#E83389] border-[#E83389]/40'
              : 'bg-[#F5F1E6] text-[#594048] border-[#340C24]/10 hover:text-[#340C24]'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-[#D97706]" />
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
            className="text-[#8C6F78] hover:text-rose-600 ml-auto font-bold transition"
          >
            Filtreleri Temizle ✕
          </button>
        )}
      </div>

      {/* Quizzes Grid with Lumina Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white border border-[#340C24]/10 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#340C24]/[0.08] space-y-3">
          <BookOpen className="w-10 h-10 text-[#8C6F78] mx-auto" />
          <h3 className="text-lg font-bold text-[#340C24]">Aradığınız kriterlere uygun quiz bulunamadı</h3>
          <p className="text-xs text-[#594048]">Filtreleri değiştirmeyi deneyebilir veya kendi quizinizi oluşturabilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isFav = favorites.includes(quiz.id);
            return (
              <div
                key={quiz.id}
                className="lumina-card p-6 flex flex-col justify-between relative group"
              >
                {/* Favorite Icon */}
                <button
                  onClick={() => toggleFavorite(quiz.id)}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-[#F5F1E6] hover:bg-[#FFE0EC] text-[#8C6F78] transition"
                  title="Favorilere Ekle"
                >
                  <Heart
                    className={`w-4 h-4 ${isFav ? 'text-[#E83389] fill-[#E83389]' : 'text-[#8C6F78]'}`}
                  />
                </button>

                <div className="space-y-3 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFE0EC] text-[#E83389] border border-[#E83389]/20">
                      {quiz.subject?.name || 'Müfredat'}
                    </span>
                    {quiz.isPremium && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 flex items-center gap-1">
                        <Crown className="w-3 h-3" /> PRO
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-[#340C24] text-base group-hover:text-[#E83389] transition line-clamp-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-[#594048] line-clamp-2 leading-relaxed">
                    {quiz.description || 'MEB müfredatına uygun interaktif değerlendirme quizi.'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#8C6F78] pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8C6F78]" />
                      {quiz._count?.questions || 0} Soru
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#8C6F78]" />
                      {quiz.playCount || 0} Oynanma
                    </span>
                    <span>•</span>
                    <span className="text-[#D97706] font-bold">⭐ {quiz.rating || 5.0}</span>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-[#8C6F78]">Yükleniyor...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
