'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  Zap,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Smile,
  Send,
  Trophy,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { useAuth } from '@/components/AuthProvider';

const SHAPES = [
  { shape: '▲', color: '#ef4444', label: 'Kırmızı Üçgen' },
  { shape: '◆', color: '#3b82f6', label: 'Mavi Baklava' },
  { shape: '●', color: '#f59e0b', label: 'Sarı Daire' },
  { shape: '■', color: '#10b981', label: 'Yeşil Kare' },
];

const AVATARS = ['🦊', '🐻', '🦁', '🦅', '🦉', '🐲', '🚀', '⚡'];

export default function PlayerGamePage() {
  const params = useParams();
  const router = useRouter();
  const pin = params.pin as string;
  const { playCorrect, playWrong, playClick } = useSound();
  const { user } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [joined, setJoined] = useState(false);
  const [nickname, setNickname] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [quizInfo, setQuizInfo] = useState<{ title: string; host: string } | null>(null);

  // Game States
  const [playerState, setPlayerState] = useState<'JOIN' | 'LOBBY' | 'QUESTION' | 'SUBMITTED' | 'RESULT' | 'PODIUM'>('JOIN');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; pointsEarned: number; streak: number; rank: number } | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myRank, setMyRank] = useState(1);

  const questionStartTimeRef = useRef<number>(Date.now());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentQIndexRef = useRef<number>(0);
  const playerStateRef = useRef<string>('JOIN');

  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  useEffect(() => {
    // 1. Validate PIN & fetch quiz title
    fetch(`/api/game/${pin}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.quizTitle) {
          setQuizInfo({ title: data.quizTitle, host: data.hostName || 'Öğretmen' });
        }
      })
      .catch((err) => console.error('Fetch game error:', err));

    // 2. Initialize Socket.io (if available)
    const s = io({
      transports: ['websocket', 'polling'],
      timeout: 3000,
    });

    s.on('game_started', () => {
      setPlayerState('QUESTION');
      setHasAnswered(false);
      setSelectedOptIndex(null);
      setCurrentQIndex(0);
      currentQIndexRef.current = 0;
      questionStartTimeRef.current = Date.now();
    });

    s.on('question_changed', ({ questionIndex }) => {
      setPlayerState('QUESTION');
      setHasAnswered(false);
      setSelectedOptIndex(null);
      const qIdx = questionIndex !== undefined ? questionIndex : currentQIndexRef.current + 1;
      setCurrentQIndex(qIdx);
      currentQIndexRef.current = qIdx;
      questionStartTimeRef.current = Date.now();
    });

    s.on('answer_processed', (data) => {
      setLastResult(data);
      setMyScore(data.currentScore);
      setMyStreak(data.streak);
      setMyRank(data.rank);
      if (data.isCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
    });

    s.on('question_results', () => {
      setPlayerState('RESULT');
    });

    s.on('podium_celebration', () => {
      setPlayerState('PODIUM');
    });

    setSocket(s);

    // 3. DUAL-TRANSPORT: Automatic REST polling sync for Serverless (Vercel) environments
    pollIntervalRef.current = setInterval(async () => {
      if (!pin) return;
      try {
        const res = await fetch(`/api/game/session?pin=${pin}`);
        if (!res.ok) return;
        const json = await res.json();
        const room = json.room;
        if (!room) return;

        // Sync participant stats
        if (nickname) {
          const me = room.participants?.find((p: any) => p.nickname === nickname);
          if (me) {
            setMyScore(me.score);
            setMyStreak(me.streak);
            setMyRank(me.rank);
          }
        }

        // Room state transitions
        const state = playerStateRef.current;
        if (state === 'LOBBY' && room.status === 'QUESTION_ACTIVE') {
          setPlayerState('QUESTION');
          setHasAnswered(false);
          setSelectedOptIndex(null);
          setCurrentQIndex(room.currentQuestionIndex || 0);
          currentQIndexRef.current = room.currentQuestionIndex || 0;
          questionStartTimeRef.current = Date.now();
        } else if ((state === 'QUESTION' || state === 'SUBMITTED' || state === 'RESULT') && room.status === 'QUESTION_ACTIVE') {
          if (room.currentQuestionIndex !== currentQIndexRef.current) {
            setPlayerState('QUESTION');
            setHasAnswered(false);
            setSelectedOptIndex(null);
            setCurrentQIndex(room.currentQuestionIndex);
            currentQIndexRef.current = room.currentQuestionIndex;
            questionStartTimeRef.current = Date.now();
          }
        } else if ((state === 'QUESTION' || state === 'SUBMITTED') && (room.status === 'QUESTION_RESULT' || room.status === 'RESULTS')) {
          setPlayerState('RESULT');
        } else if (state !== 'PODIUM' && room.status === 'PODIUM') {
          setPlayerState('PODIUM');
        }
      } catch (e) {
        // quiet polling error
      }
    }, 1200);

    return () => {
      s.disconnect();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pin, nickname]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    playClick();

    const cleanNick = nickname.trim();

    // 1. Socket emit if connected
    if (socket && socket.connected) {
      socket.emit('join_game', {
        pin,
        role: 'player',
        nickname: cleanNick,
        avatar: selectedAvatar,
        userId: user?.id,
      });
    }

    // 2. Serverless REST join
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'JOIN',
          pin,
          data: {
            nickname: cleanNick,
            avatar: selectedAvatar,
            userId: user?.id,
          },
        }),
      });
    } catch (e) {
      console.warn('REST join sync:', e);
    }

    setJoined(true);
    setPlayerState('LOBBY');
  };

  const handleAnswerClick = async (index: number) => {
    if (hasAnswered) return;
    playClick();
    setHasAnswered(true);
    setSelectedOptIndex(index);
    setPlayerState('SUBMITTED');

    const timeTaken = Date.now() - questionStartTimeRef.current;

    // 1. Socket emit if connected
    if (socket && socket.connected) {
      socket.emit('submit_answer', {
        pin,
        nickname,
        selectedOptionId: `opt_${index}`,
        selectedOptionIndex: index,
        timeTakenMs: timeTaken,
        isCorrect: true, // socket server will validate or fallback
        basePoints: 1000,
      });
    }

    // 2. Serverless REST answer submit with instant verification
    try {
      const res = await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_ANSWER',
          pin,
          data: {
            nickname,
            selectedOptionIndex: index,
            timeTakenMs: timeTaken,
            basePoints: 1000,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastResult(data);
        if (data.currentScore !== undefined) setMyScore(data.currentScore);
        if (data.streak !== undefined) setMyStreak(data.streak);
        if (data.rank !== undefined) setMyRank(data.rank);
        if (data.isCorrect) {
          playCorrect();
        } else {
          playWrong();
        }
      }
    } catch (e) {
      console.warn('REST submit error:', e);
    }
  };

  const sendReaction = async (emoji: string) => {
    playClick();
    if (socket && socket.connected) {
      socket.emit('send_reaction', { pin, emoji, nickname });
    }
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REACTION',
          pin,
          data: { emoji, nickname },
        }),
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-4 select-none">
      {/* -------------------- 1. JOIN SCREEN -------------------- */}
      {playerState === 'JOIN' && (
        <div className="max-w-md mx-auto w-full my-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-600 flex items-center justify-center mx-auto shadow-xl shadow-brand-600/30">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-white">Yarışmaya Katıl</h1>
            {quizInfo && (
              <div className="text-base font-bold text-brand-400 bg-brand-500/10 py-1 px-3 rounded-xl inline-block border border-brand-500/20">
                {quizInfo.title}
              </div>
            )}
            <p className="text-xs text-slate-400">
              {quizInfo?.host ? `Yönetici: ${quizInfo.host} • ` : ''}PIN Kodu: <span className="font-bold text-white font-mono tracking-wider">{pin}</span>
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Avatar Seç</label>
              <div className="flex justify-center gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      playClick();
                      setSelectedAvatar(av);
                    }}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition border ${
                      selectedAvatar === av
                        ? 'bg-brand-600/30 border-brand-500 scale-110 shadow-lg'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Takma Adını (Nickname) Gir"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-center rounded-2xl py-3.5 text-lg placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-600/30 transition transform active:scale-95"
            >
              Hadi Başlayalım! 🚀
            </button>
          </form>
        </div>
      )}

      {/* -------------------- 2. LOBBY WAITING SCREEN -------------------- */}
      {playerState === 'LOBBY' && (
        <div className="max-w-md mx-auto w-full my-auto space-y-6 text-center animate-in zoom-in-75">
          <div className="text-6xl animate-bounce">{selectedAvatar}</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Harikasın, {nickname}!</h2>
            <div className="inline-block px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
              Lobidesin • Öğretmenin oyunu başlatması bekleniyor...
            </div>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400">
            Ekranı kapatma! Yarışma başladığında cevap butonları doğrudan bu ekranda belirecek.
          </div>
        </div>
      )}

      {/* -------------------- 3. ACTIVE QUESTION SCREEN -------------------- */}
      {playerState === 'QUESTION' && (
        <div className="max-w-md mx-auto w-full my-auto flex flex-col justify-between h-[80vh] space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-2">
            <span>{nickname} ({selectedAvatar})</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">🔥 {myStreak}</span>
              <span className="text-brand-300">{myScore} P</span>
            </div>
          </div>

          {/* 4 Big Touch Buttons */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {SHAPES.map((shape, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerClick(idx)}
                className="rounded-3xl flex flex-col items-center justify-center font-black text-5xl text-white shadow-2xl active:scale-95 transition transform hover:opacity-95"
                style={{ backgroundColor: shape.color }}
              >
                <span>{shape.shape}</span>
              </button>
            ))}
          </div>

          {/* Bottom Floating Reaction Bar */}
          <div className="flex items-center justify-center gap-4 py-2">
            {['❤️', '🔥', '🎉', '👏', '🧠'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-xl flex items-center justify-center shadow transition active:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- 4. SUBMITTED WAITING SCREEN -------------------- */}
      {playerState === 'SUBMITTED' && (
        <div className="max-w-md mx-auto w-full my-auto space-y-6 text-center animate-in fade-in">
          <div className="w-20 h-20 rounded-full bg-brand-600/20 border-2 border-brand-500 flex items-center justify-center mx-auto text-3xl">
            ⏳
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Cevabın Alındı!</h2>
            <p className="text-xs text-slate-400">Diğer oyuncuların ve sürenin bitmesi bekleniyor...</p>
          </div>

          {/* Bottom Reactions */}
          <div className="flex items-center justify-center gap-4 pt-8">
            {['❤️', '🔥', '🎉', '👏', '🧠'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-11 h-11 rounded-full bg-slate-800 text-xl flex items-center justify-center shadow active:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- 5. QUESTION RESULT SCREEN -------------------- */}
      {playerState === 'RESULT' && lastResult && (
        <div className="max-w-md mx-auto w-full my-auto space-y-6 text-center animate-in zoom-in-75">
          {lastResult.isCorrect ? (
            <div className="space-y-3">
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
              <h2 className="text-3xl font-black text-emerald-400">Tebrikler! Doğru!</h2>
              <div className="text-xl font-bold text-white">+{lastResult.pointsEarned} Puan Kazandın!</div>
              {lastResult.streak > 1 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  {lastResult.streak} Soru Art Arda Doğru!
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <XCircle className="w-20 h-20 text-rose-500 mx-auto" />
              <h2 className="text-3xl font-black text-rose-400">Ah, Yanlış Cevap!</h2>
              <div className="text-sm text-slate-300">Bir sonraki soruda toparlayabilirsin! 💪</div>
            </div>
          )}

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Toplam Skorun:</span>
            <span className="font-black text-brand-400 text-base">{myScore} P</span>
          </div>
        </div>
      )}

      {/* -------------------- 6. PODIUM SCREEN -------------------- */}
      {playerState === 'PODIUM' && (
        <div className="max-w-md mx-auto w-full my-auto space-y-6 text-center animate-in zoom-in-75">
          <Trophy className="w-20 h-20 text-amber-400 mx-auto animate-bounce" />
          <h2 className="text-3xl font-black text-white">Oyun Sona Erdi!</h2>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
            <div className="text-xs text-slate-400">Harika Mücadele!</div>
            <div className="text-2xl font-black text-white">{nickname}</div>
            <div className="text-3xl font-black text-brand-400">{myScore} Puan</div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition"
          >
            Ana Ekrana Dön
          </button>
        </div>
      )}
    </div>
  );
}
