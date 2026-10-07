'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  Gem,
  Building,
  Coffee,
  RotateCcw,
  Home,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function SoloGamePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { playCorrect, playWrong, playFanfare, playClick } = useSound();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'CLASSIC' | 'CHILL' | 'TREASURE' | 'TOWER'>('CLASSIC');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Tower & Treasure stats
  const [towerFloors, setTowerFloors] = useState(0);
  const [treasureChests, setTreasureChests] = useState(0);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.quiz) {
          setQuiz(data.quiz);
        } else {
          // Fallback to list
          fetch('/api/quizzes')
            .then((r) => r.json())
            .then((d) => setQuiz(d.quizzes?.[0]));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [quizId]);

  const currentQ = quiz?.questions?.[currentIdx];

  const handleSelectOption = (idx: number, isCorrect: boolean) => {
    if (isAnswered) return;
    playClick();
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (isCorrect) {
      playCorrect();
      setScore((prev) => prev + (currentQ?.points || 1000) + streak * 50);
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);

      if (mode === 'TOWER') {
        setTowerFloors((prev) => prev + 1);
      }
      if (mode === 'TREASURE') {
        setTreasureChests((prev) => prev + 1);
      }
    } else {
      playWrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    playClick();
    setSelectedOpt(null);
    setIsAnswered(false);

    if (currentIdx + 1 < (quiz?.questions?.length || 0)) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      playFanfare();
      confetti({ particleCount: 120, spread: 80 });
      // Record progress to API
      fetch('/api/solo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          mode,
          score,
          totalItems: quiz?.questions?.length || 1,
          correctItems: correctCount + (selectedOpt !== null && currentQ?.options?.[selectedOpt]?.isCorrect ? 1 : 0),
        }),
      });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setTowerFloors(0);
    setTreasureChests(0);
    setIsCompleted(false);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Mode Selector Header */}
      {!isCompleted && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div>
            <h1 className="text-xl font-black text-white">{quiz?.title}</h1>
            <p className="text-xs text-slate-400">Soru {currentIdx + 1} / {quiz?.questions?.length || 1}</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { playClick(); setMode('CLASSIC'); }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                mode === 'CLASSIC' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Klasik
            </button>
            <button
              onClick={() => { playClick(); setMode('CHILL'); }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                mode === 'CHILL' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Chill
            </button>
            <button
              onClick={() => { playClick(); setMode('TREASURE'); }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                mode === 'TREASURE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gem className="w-3.5 h-3.5" /> Hazine
            </button>
            <button
              onClick={() => { playClick(); setMode('TOWER'); }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                mode === 'TOWER' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Kule
            </button>
          </div>
        </div>
      )}

      {/* Mode Special Status Elements */}
      {mode === 'TOWER' && !isCompleted && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <span>Kule İnşası: <strong className="text-white text-sm">{towerFloors} Kat</strong> yükseldiniz!</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: towerFloors }).map((_, i) => (
              <span key={i} className="text-base">🏢</span>
            ))}
          </div>
        </div>
      )}

      {mode === 'TREASURE' && !isCompleted && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-400" />
            <span>Açılan Hazine Sandıkları: <strong className="text-white text-sm">{treasureChests} Sandık</strong></span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: treasureChests }).map((_, i) => (
              <span key={i} className="text-base">💎</span>
            ))}
          </div>
        </div>
      )}

      {/* Solo Question Card */}
      {!isCompleted && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="bg-slate-800 px-3 py-1 rounded-full">{currentQ.type}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" /> {streak} Seri
              </span>
              <span className="font-bold text-brand-400 text-sm">{score} Puan</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white text-center leading-snug">
            {currentQ.title}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options?.map((opt: any, optIdx: number) => {
              const isChosen = selectedOpt === optIdx;
              const showResult = isAnswered;

              let btnStyle = 'bg-slate-800 border-slate-700 text-white hover:border-brand-500';
              if (showResult) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white';
                } else if (isChosen && !opt.isCorrect) {
                  btnStyle = 'bg-rose-600/90 border-rose-400 text-white';
                } else {
                  btnStyle = 'bg-slate-850 border-slate-800 text-slate-500 opacity-40';
                }
              }

              return (
                <button
                  key={opt.id || optIdx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(optIdx, opt.isCorrect)}
                  className={`p-5 rounded-2xl border text-left font-bold text-base transition flex items-center justify-between shadow-lg ${btnStyle}`}
                >
                  <span>{opt.text}</span>
                  {showResult && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                  {showResult && isChosen && !opt.isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation if Answered */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1">
                💡 Çözüm Açıklaması:
              </div>
              <p>{currentQ.explanation || 'Bu soru MEB kazanımlarına uygun temel kavramı ölçmektedir.'}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-brand-600/30"
              >
                {currentIdx + 1 < (quiz?.questions?.length || 0) ? 'Sıradaki Soru' : 'Sonuçları Gör'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Summary */}
      {isCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-6 shadow-2xl animate-in zoom-in-75">
          <div className="text-5xl">🏆</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white">Tebrikler! Quiz Tamamlandı</h2>
            <p className="text-xs text-slate-400">{quiz?.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-2xl font-black text-brand-400">{score}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Toplam Puan</div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-2xl font-black text-emerald-400">
                {correctCount} / {quiz?.questions?.length || 0}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Doğru Sayısı</div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-2xl font-black text-amber-400">
                +{Math.round((correctCount / (quiz?.questions?.length || 1)) * 150) + 30}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Kazanılan XP</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Tekrar Oyna
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Keşfete Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
