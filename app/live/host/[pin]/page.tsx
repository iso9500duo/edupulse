'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import {
  Users,
  Play,
  ArrowRight,
  Trophy,
  Volume2,
  VolumeX,
  Flame,
  Award,
  Crown,
  Sparkles,
  QrCode,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

const SHAPES = [
  { shape: '▲', color: '#ef4444', bg: 'bg-red-500', name: 'Üçgen' },
  { shape: '◆', color: '#3b82f6', bg: 'bg-blue-500', name: 'Baklava' },
  { shape: '●', color: '#f59e0b', bg: 'bg-amber-500', name: 'Daire' },
  { shape: '■', color: '#10b981', bg: 'bg-emerald-500', name: 'Kare' },
];

export default function HostGamePage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { playCorrect, playTick, playFanfare, playWrong } = useSound();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'LOBBY' | 'QUESTION' | 'RESULTS' | 'LEADERBOARD' | 'PODIUM'>('LOBBY');
  const [quiz, setQuiz] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answersData, setAnswersData] = useState<any>({});
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Quiz Info & Initialize Socket
  useEffect(() => {
    // Fetch quiz data
    fetch(`/api/game/${pin}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          router.push('/');
        }
      });

    // Also fetch full quiz details
    fetch(`/api/quizzes`)
      .then((res) => res.json())
      .then((data) => {
        if (data.quizzes && data.quizzes.length > 0) {
          // Fallback or find matching
          setQuiz(data.quizzes[0]);
        }
      });

    const s = io({
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('join_game', { pin, role: 'host' });
    });

    s.on('player_joined', ({ participant, participants: allParts }) => {
      setParticipants(allParts || []);
    });

    s.on('player_left', ({ totalPlayers }) => {
      setParticipants((prev) => prev.filter((p) => p.isOnline));
    });

    s.on('answer_count_update', ({ answeredCount: count }) => {
      setAnsweredCount(count);
    });

    s.on('reaction_received', ({ emoji, id }) => {
      setReactions((prev) => [...prev.slice(-15), { id, emoji }]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pin]);

  const currentQuestion = quiz?.questions?.[currentQIndex];

  // 2. Start Game
  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('start_game', { pin });
    setGameState('QUESTION');
    startQuestionTimer(currentQuestion?.timeLimit || 20);
  };

  // 3. Question Countdown
  const startQuestionTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setAnsweredCount(0);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleShowResults();
          return 0;
        }
        if (prev <= 5) {
          playTick();
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 4. Show Question Results
  const handleShowResults = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const correctOpt = currentQuestion?.options?.find((o: any) => o.isCorrect);
    if (socket) {
      socket.emit('show_question_results', {
        pin,
        correctOptionId: correctOpt?.id,
      });
    }
    setGameState('RESULTS');
    playCorrect();
  };

  // 5. Show Leaderboard
  const handleShowLeaderboard = () => {
    if (socket) {
      socket.emit('show_leaderboard', { pin });
    }
    setGameState('LEADERBOARD');
    playFanfare();
  };

  // 6. Next Question or Finish to Podium
  const handleNextStep = () => {
    if (currentQIndex + 1 < (quiz?.questions?.length || 0)) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = quiz.questions[nextIdx];
      if (socket) {
        socket.emit('next_question', { pin, questionIndex: nextIdx });
      }
      setGameState('QUESTION');
      startQuestionTimer(nextQ?.timeLimit || 20);
    } else {
      // Game ended -> Show Podium!
      if (socket) {
        socket.emit('show_podium', { pin });
      }
      setGameState('PODIUM');
      playFanfare();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  // Top Ranked
  const rankedPlayers = [...participants].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-6 relative overflow-hidden select-none">
      {/* Floating Reaction Bubbles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="reaction-bubble absolute text-4xl"
            style={{
              left: `${15 + Math.random() * 70}%`,
              bottom: '50px',
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* -------------------- 1. LOBBY SCREEN -------------------- */}
      {gameState === 'LOBBY' && (
        <div className="max-w-6xl mx-auto w-full my-auto space-y-10 text-center">
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="text-left space-y-1">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
                OYUN KODU İLE KATILIN:
              </span>
              <div className="text-slate-300 text-sm">
                Öğrenciler cihazlarından <span className="font-bold text-white underline">edupulse.app</span> adresine girsin.
              </div>
            </div>

            {/* Huge PIN */}
            <div className="my-4 sm:my-0 flex items-center gap-4">
              <div className="bg-slate-950 border-2 border-brand-500 px-8 py-3 rounded-2xl shadow-xl shadow-brand-500/20">
                <span className="text-5xl sm:text-6xl font-black tracking-widest text-white animate-pulse">
                  {pin}
                </span>
              </div>
            </div>

            {/* QR Mock / Join info */}
            <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
              <QrCode className="w-10 h-10 text-brand-400" />
              <div className="text-left text-xs">
                <div className="font-bold text-white">QR ile Katıl</div>
                <div className="text-slate-400">Kamera ile tara</div>
              </div>
            </div>
          </div>

          {/* Participant count & Launch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-white">{participants.length}</div>
                <div className="text-xs text-slate-400 font-medium">Katılımcı Lobide</div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:opacity-95 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-600/40 transition transform hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              Oyunu Başlat ({participants.length} Oyuncu)
            </button>
          </div>

          {/* Participant Avatars Grid */}
          <div className="min-h-[280px] bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 flex flex-wrap items-center justify-center gap-4">
            {participants.length === 0 ? (
              <div className="text-slate-500 text-sm font-medium animate-pulse flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-brand-500" />
                Öğrencilerin PIN kodu ile katılması bekleniyor...
              </div>
            ) : (
              participants.map((p, idx) => (
                <div
                  key={idx}
                  className="px-5 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white font-bold text-base shadow-lg animate-in zoom-in-50 duration-300 flex items-center gap-2"
                >
                  <span className="text-xl">🦊</span>
                  <span>{p.nickname}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* -------------------- 2. QUESTION SCREEN -------------------- */}
      {gameState === 'QUESTION' && currentQuestion && (
        <div className="max-w-5xl mx-auto w-full my-auto space-y-8 text-center">
          {/* Top Info Bar */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Soru {currentQIndex + 1} / {quiz?.questions?.length || 1}
            </span>

            {/* Countdown Circle */}
            <div className="w-16 h-16 rounded-full border-4 border-brand-500 flex items-center justify-center bg-slate-900 font-black text-2xl shadow-lg">
              {timeLeft}
            </div>

            {/* Answered counter */}
            <div className="text-right">
              <div className="text-xl font-black text-emerald-400">
                {answeredCount} / {participants.length || 1}
              </div>
              <div className="text-xs text-slate-400 font-medium">Cevap Geldi</div>
            </div>
          </div>

          {/* Question Title */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-snug">
              {currentQuestion.title}
            </h2>
          </div>

          {/* 4 Answers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options?.map((opt: any, optIdx: number) => {
              const shapeInfo = SHAPES[optIdx % 4];
              return (
                <div
                  key={opt.id || optIdx}
                  className="p-6 rounded-2xl font-black text-xl text-white shadow-xl flex items-center gap-4 transition text-left"
                  style={{ backgroundColor: shapeInfo.color }}
                >
                  <span className="text-3xl opacity-80">{shapeInfo.shape}</span>
                  <span className="flex-1">{opt.text}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleShowResults}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition"
            >
              Süreyi Bitir & Cevapları Gör
            </button>
          </div>
        </div>
      )}

      {/* -------------------- 3. RESULTS SCREEN -------------------- */}
      {gameState === 'RESULTS' && currentQuestion && (
        <div className="max-w-4xl mx-auto w-full my-auto space-y-8 text-center">
          <h2 className="text-3xl font-black text-white">Soru Sonuçları</h2>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <div className="text-sm text-slate-400 font-medium">Soru: {currentQuestion.title}</div>
            {currentQuestion.explanation && (
              <div className="p-4 bg-brand-950/40 border border-brand-800/40 rounded-xl text-xs text-brand-300">
                💡 <span className="font-bold">Pedagojik Çözüm:</span> {currentQuestion.explanation}
              </div>
            )}
          </div>

          {/* Options with correctness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options?.map((opt: any, optIdx: number) => {
              const shapeInfo = SHAPES[optIdx % 4];
              return (
                <div
                  key={opt.id || optIdx}
                  className={`p-6 rounded-2xl font-black text-lg text-white shadow-xl flex items-center justify-between border-2 ${
                    opt.isCorrect
                      ? 'border-emerald-400 bg-emerald-600/90'
                      : 'border-slate-800 bg-slate-850 opacity-40'
                  }`}
                  style={{ backgroundColor: opt.isCorrect ? '#10b981' : shapeInfo.color }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{shapeInfo.shape}</span>
                    <span>{opt.text}</span>
                  </div>
                  {opt.isCorrect && <span className="text-2xl">✓</span>}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleShowLeaderboard}
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-brand-600/40 transition flex items-center gap-2"
            >
              Lider Tablosunu Göster <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- 4. LEADERBOARD SCREEN -------------------- */}
      {gameState === 'LEADERBOARD' && (
        <div className="max-w-3xl mx-auto w-full my-auto space-y-8 text-center">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-amber-400" />
              Lider Tablosu
            </h2>
            <p className="text-xs text-slate-400">Soruların ardından güncel sıralama</p>
          </div>

          <div className="space-y-3">
            {rankedPlayers.slice(0, 5).map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg text-left"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                      idx === 0
                        ? 'bg-amber-500 text-black'
                        : idx === 1
                        ? 'bg-slate-300 text-black'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-base flex items-center gap-2">
                      <span>{player.nickname}</span>
                      {player.streak > 1 && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
                          <Flame className="w-3 h-3 fill-amber-400" /> {player.streak} Seri
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xl font-black text-brand-400">
                  {player.score.toLocaleString()} P
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextStep}
              className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl transition flex items-center gap-2"
            >
              {currentQIndex + 1 < (quiz?.questions?.length || 0)
                ? 'Sıradaki Soruya Geç'
                : 'Sonuçları & Podyumu Aç'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------- 5. PODIUM SCREEN -------------------- */}
      {gameState === 'PODIUM' && (
        <div className="max-w-4xl mx-auto w-full my-auto space-y-12 text-center animate-in zoom-in-75 duration-500">
          <div className="space-y-2">
            <div className="text-5xl">🏆</div>
            <h2 className="text-4xl font-black text-white">Yarışma Şampiyonları!</h2>
            <p className="text-slate-400 text-sm">Tebrikler! Muazzam bir yarışma tamamlandı.</p>
          </div>

          {/* 3 Steps Podium */}
          <div className="flex items-end justify-center gap-4 sm:gap-8 pt-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-white mb-2">
                {rankedPlayers[1]?.nickname || '2. Oyuncu'}
              </div>
              <div className="text-xs text-slate-400 mb-2">
                {rankedPlayers[1]?.score || 0} Puan
              </div>
              <div className="w-24 sm:w-36 h-40 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-3xl flex items-center justify-center font-black text-4xl text-white shadow-2xl">
                2
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Crown className="w-10 h-10 text-amber-400 animate-bounce mb-2" />
              <div className="text-2xl font-black text-amber-300 mb-2">
                {rankedPlayers[0]?.nickname || 'Şampiyon'}
              </div>
              <div className="text-xs text-amber-200/80 mb-2 font-bold">
                {rankedPlayers[0]?.score || 0} Puan
              </div>
              <div className="w-28 sm:w-44 h-56 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-3xl flex items-center justify-center font-black text-5xl text-black shadow-2xl">
                1
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold text-white mb-2">
                {rankedPlayers[2]?.nickname || '3. Oyuncu'}
              </div>
              <div className="text-xs text-slate-400 mb-2">
                {rankedPlayers[2]?.score || 0} Puan
              </div>
              <div className="w-24 sm:w-36 h-28 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-3xl flex items-center justify-center font-black text-3xl text-white shadow-2xl">
                3
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={() => router.push('/reports')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition"
            >
              Ayrıntılı Raporu İncele
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
