'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
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
  Copy,
  Check,
  Maximize2,
  X,
  ExternalLink,
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
  const { playCorrect, playTick, playFanfare, playWrong, playClick } = useSound();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'LOBBY' | 'QUESTION' | 'RESULTS' | 'LEADERBOARD' | 'PODIUM'>('LOBBY');
  const [quiz, setQuiz] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [answersData, setAnswersData] = useState<any>({});
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);

  // QR Code & Join Link States
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinUrl, setJoinUrl] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Generate unique dynamic QR Code and fetch Quiz info
  useEffect(() => {
    if (typeof window !== 'undefined' && pin) {
      const url = `${window.location.origin}/join?pin=${pin}`;
      setJoinUrl(url);

      QRCode.toDataURL(url, {
        width: 480,
        margin: 2,
        color: {
          dark: '#090d16',
          light: '#ffffff',
        },
      })
        .then((dataUrl) => {
          setQrCodeDataUrl(dataUrl);
        })
        .catch((err) => console.error('QR code error:', err));
    }

    // Fetch quiz data from backend API
    fetch(`/api/game/${pin}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error && !data.quiz) {
          alert(data.error);
          router.push('/');
          return;
        }
        if (data.quiz) {
          setQuiz(data.quiz);
        }
      })
      .catch((err) => console.error('Game fetch error:', err));

    // Initialize Socket.io (for local Node.js WebSocket engine)
    const s = io({
      transports: ['websocket', 'polling'],
      timeout: 3000,
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

    // DUAL-TRANSPORT: Automatic REST polling sync for Serverless (Vercel) environments
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/game/session?pin=${pin}`);
        if (res.ok) {
          const json = await res.json();
          if (json.room) {
            if (json.room.participants) {
              setParticipants((prev) => {
                // If more participants in serverless state, update
                if (json.room.participants.length !== prev.length) {
                  return json.room.participants;
                }
                return prev;
              });
            }
            if (json.room.answers) {
              const answersCount = Object.keys(json.room.answers).length;
              setAnsweredCount(answersCount);
            }
            if (json.room.quiz && !quiz) {
              setQuiz(json.room.quiz);
            }
          }
        }
      } catch (e) {
        // quiet polling error
      }
    }, 1500);

    return () => {
      s.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pin]);

  const copyJoinLink = () => {
    if (!joinUrl) return;
    playClick();
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentQuestion = quiz?.questions?.[currentQIndex];

  // 2. Start Game
  const handleStartGame = async () => {
    playClick();
    if (socket && socket.connected) {
      socket.emit('start_game', { pin });
    }
    // Also broadcast to serverless session endpoint
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_GAME', pin }),
      });
    } catch (e) {}

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
  const handleShowResults = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const correctOpt = currentQuestion?.options?.find((o: any) => o.isCorrect);
    if (socket && socket.connected) {
      socket.emit('show_question_results', {
        pin,
        correctOptionId: correctOpt?.id,
      });
    }
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SHOW_RESULTS', pin }),
      });
    } catch (e) {}

    setGameState('RESULTS');
    playCorrect();
  };

  // 5. Show Leaderboard
  const handleShowLeaderboard = async () => {
    if (socket && socket.connected) {
      socket.emit('show_leaderboard', { pin });
    }
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SHOW_LEADERBOARD', pin }),
      });
    } catch (e) {}

    setGameState('LEADERBOARD');
    playFanfare();
  };

  // 6. Next Question or Finish to Podium
  const handleNextStep = async () => {
    if (currentQIndex + 1 < (quiz?.questions?.length || 0)) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      const nextQ = quiz.questions[nextIdx];
      if (socket && socket.connected) {
        socket.emit('next_question', { pin, questionIndex: nextIdx });
      }
      try {
        await fetch('/api/game/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'NEXT_QUESTION', pin, data: { questionIndex: nextIdx } }),
        });
      } catch (e) {}

      setGameState('QUESTION');
      startQuestionTimer(nextQ?.timeLimit || 20);
    } else {
      // Game ended -> Show Podium!
      if (socket && socket.connected) {
        socket.emit('show_podium', { pin });
      }
      try {
        await fetch('/api/game/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SHOW_PODIUM', pin }),
        });
      } catch (e) {}

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

      {/* FULLSCREEN QR PROJECTOR MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-brand-500/50 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold text-xs">
                PROJEKSİYON / AKILLI TAHTA MODU
              </span>
              <h2 className="text-3xl font-black text-white pt-2">Kameranızla Karekodu Okutun</h2>
              <p className="text-sm text-slate-400">Telefonunuzun kamerasını karekoda tutarak anında oyuna bağlanın</p>
            </div>

            {qrCodeDataUrl ? (
              <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl mx-auto">
                <img
                  src={qrCodeDataUrl}
                  alt={`EduPulse Oyun Katılım Karekodu PIN: ${pin}`}
                  className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-72 h-72 bg-slate-800 rounded-3xl animate-pulse mx-auto flex items-center justify-center">
                <QrCode className="w-16 h-16 text-slate-500" />
              </div>
            )}

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Veya Web Üzerinden PIN Girin:</div>
              <div className="text-5xl font-black tracking-widest text-brand-400 font-mono">{pin}</div>
              <div className="text-xs text-slate-400 font-medium">edupulse.app/join</div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={copyJoinLink}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 border border-slate-700"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-400" />}
                <span>{copiedLink ? 'Link Kopyalandı!' : 'Katılım Linkini Kopyala'}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition shadow-lg"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 1. LOBBY SCREEN -------------------- */}
      {gameState === 'LOBBY' && (
        <div className="max-w-6xl mx-auto w-full my-auto space-y-8 text-center">
          {/* Top Info Banner with Dynamic QR Code and PIN */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            
            {/* Left Col: Instructions & Join info */}
            <div className="md:col-span-4 text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CANLI YARIŞMA LOBİSİ</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{quiz?.title || 'Canlı Yarışma'}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Öğrencileriniz cihazlarından aşağıdaki kodu veya karekodu kullanarak katılsın.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={copyJoinLink}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-brand-400" />}
                  <span>{copiedLink ? 'Kopyalandı' : 'Katılım Linkini Kopyala'}</span>
                </button>

                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 border border-brand-500/40 text-xs text-brand-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Projeksiyon Modu</span>
                </button>
              </div>
            </div>

            {/* Center Col: Big PIN Display */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                OYUN KODU (PIN)
              </span>
              <div className="bg-slate-950 border-2 border-brand-500 px-8 py-3.5 rounded-2xl shadow-2xl shadow-brand-500/20 w-full max-w-xs text-center">
                <span className="text-4xl sm:text-5xl font-black tracking-widest text-white font-mono animate-pulse">
                  {pin}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                Katıl: <span className="text-white underline font-bold">edupulse.app/join</span>
              </span>
            </div>

            {/* Right Col: Unique Scannable Dynamic QR Code */}
            <div className="md:col-span-3 flex flex-col items-center justify-center">
              <div
                onClick={() => setIsQrModalOpen(true)}
                className="cursor-pointer group relative bg-white p-3 rounded-2xl shadow-xl transition transform hover:scale-105 border-2 border-brand-400/50"
                title="Büyütmek için tıklayın"
              >
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`PIN ${pin} Karekod`}
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center bg-slate-200 rounded-xl">
                    <QrCode className="w-10 h-10 text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                  <Maximize2 className="w-5 h-5 text-brand-400" />
                  <span>Büyüt</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-brand-400" />
                <span>Kamerayla Okut Katıl</span>
              </span>
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
                <div className="text-xs text-slate-400 font-medium">Katılımcı Lobide Hazır</div>
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
          <div className="min-h-[260px] bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 flex flex-wrap items-center justify-center gap-4">
            {participants.length === 0 ? (
              <div className="text-slate-500 text-sm font-medium animate-pulse flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-brand-500" />
                <span>Öğrencilerin PIN ({pin}) veya Karekod ile katılması bekleniyor...</span>
              </div>
            ) : (
              participants.map((p, idx) => (
                <div
                  key={idx}
                  className="px-5 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white font-bold text-base shadow-lg animate-in zoom-in-50 duration-300 flex items-center gap-2"
                >
                  <span className="text-xl">{p.avatar || '🦊'}</span>
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
