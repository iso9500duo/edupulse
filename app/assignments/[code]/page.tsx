'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Home,
  User,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { useAuth } from '@/components/AuthProvider';

export default function AssignmentPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { playClick, playCorrect, playWrong, playFanfare } = useSound();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [hasStarted, setHasStarted] = useState(false);

  // Solving states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/assignments/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.assignment) {
          setAssignment(data.assignment);
        } else {
          alert('Ödev bulunamadı.');
          router.push('/');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [code]);

  const questions = assignment?.quiz?.questions || [];
  const currentQ = questions[currentIdx];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    playClick();
    setHasStarted(true);
  };

  const handleSelectOption = (idx: number, isCorrect: boolean) => {
    if (isAnswered) return;
    playClick();
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (isCorrect) {
      playCorrect();
      setScore((prev) => prev + (currentQ?.points || 1000));
      setCorrectCount((prev) => prev + 1);
    } else {
      playWrong();
    }
  };

  const handleNext = () => {
    playClick();
    setSelectedOpt(null);
    setIsAnswered(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      playFanfare();
      confetti({ particleCount: 120, spread: 80 });

      // Submit attempt to backend
      fetch(`/api/assignments/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: guestName,
          score,
          correctCount,
          totalQuestions: questions.length,
          durationSeconds: 120,
        }),
      });
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-400">Ödev Yükleniyor...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* 1. Name Entry / Start Screen */}
      {!hasStarted && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
            📝
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">{assignment?.title}</h1>
            <p className="text-xs text-slate-400">
              Öğretmen: <span className="text-white font-semibold">{assignment?.teacher?.name}</span> • Kod:{' '}
              <span className="font-mono font-bold text-brand-400">{code}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-xs text-slate-300 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Kendi Hızında Çöz
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> {questions.length} Soru
            </span>
          </div>

          <form onSubmit={handleStart} className="space-y-4 max-w-sm mx-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 text-left">
                Adınız ve Soyadınız:
              </label>
              <input
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl px-4 py-3 text-center focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition"
            >
              Ödevi Başlat 🚀
            </button>
          </form>
        </div>
      )}

      {/* 2. Active Question Screen */}
      {hasStarted && !isCompleted && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Soru {currentIdx + 1} / {questions.length}</span>
            <span className="text-brand-400 font-bold">{score} Puan</span>
          </div>

          <h2 className="text-2xl font-black text-white text-center leading-snug">
            {currentQ.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options?.map((opt: any, optIdx: number) => {
              const isChosen = selectedOpt === optIdx;
              const showResult = isAnswered;

              let btnStyle = 'bg-slate-800 border-slate-700 text-white hover:border-emerald-500';
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
                  className={`p-5 rounded-2xl border text-left font-bold text-sm transition flex items-center justify-between shadow-lg ${btnStyle}`}
                >
                  <span>{opt.text}</span>
                  {showResult && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                  {showResult && isChosen && !opt.isCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              💡 <span className="font-bold text-white">Çözüm:</span> {currentQ.explanation || 'MEB müfredatı temel kavram analizi.'}
            </div>
          )}

          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30"
              >
                {currentIdx + 1 < questions.length ? 'Sıradaki Soru' : 'Ödevi Tamamla'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Completed Screen */}
      {isCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-6 shadow-2xl animate-in zoom-in-75">
          <div className="text-5xl">🎉</div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white">Ödev Başarıyla Teslim Edildi!</h2>
            <p className="text-xs text-slate-400">Sonuçlarınız öğretmeninizin raporlar paneline kaydedildi.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-2xl font-black text-brand-400">{score}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Kazanılan Puan</div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-2xl font-black text-emerald-400">
                {correctCount} / {questions.length}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Doğru Sayısı</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Ana Sayfaya Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
