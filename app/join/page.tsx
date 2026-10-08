'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Play, AlertCircle, Loader2, CheckCircle2, QrCode } from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPin = searchParams?.get('pin') || '';

  const [pin, setPin] = useState(initialPin.toUpperCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gamePreview, setGamePreview] = useState<{ title: string; host: string } | null>(null);
  const { playClick, playCorrect, playWrong } = useSound();

  // If pin came through QR code link, auto-check it
  useEffect(() => {
    if (initialPin && initialPin.length >= 4) {
      validateAndJoin(initialPin);
    }
  }, [initialPin]);

  const validateAndJoin = async (pinToValidate: string) => {
    const cleanPin = pinToValidate.trim().toUpperCase();
    if (!cleanPin) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/game/${cleanPin}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Bu PIN koduna ait aktif bir yarışma bulunamadı. Lütfen kodu kontrol ediniz.');
        playWrong();
        setLoading(false);
        return;
      }

      setGamePreview({
        title: data.quizTitle || 'Canlı Yarışma',
        host: data.hostName || 'Öğretmen',
      });
      playCorrect();

      // Smooth transition to play room
      setTimeout(() => {
        router.push(`/live/play/${cleanPin}`);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setError('Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol ediniz.');
      playWrong();
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || loading) return;
    playClick();
    validateAndJoin(pin);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
          <Zap className="w-8 h-8 text-white animate-pulse" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">Canlı Oyuna Katıl</h1>
          <p className="text-xs text-slate-400">
            {initialPin ? 'Karekod ile katıldınız. Giriş yapılıyor...' : 'Öğretmenin veya tahtadaki ekranda görünen 6 haneli PIN kodunu giriniz.'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 text-left flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Oyun Bulunamadı</div>
              <div className="opacity-90">{error}</div>
            </div>
          </div>
        )}

        {gamePreview && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 text-left flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">{gamePreview.title}</div>
              <div className="text-emerald-400/90 font-medium">Yönetici: {gamePreview.host} • Odaya bağlanılıyor...</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Oyun Kodu (PIN)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.toUpperCase());
                setError(null);
              }}
              maxLength={8}
              required
              disabled={loading}
              className="w-full bg-slate-800/90 border border-slate-700 text-white font-black text-center rounded-2xl py-4 text-3xl tracking-widest placeholder-slate-500 focus:outline-none focus:border-brand-500 transition shadow-inner disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-600/30 transition flex items-center justify-center gap-2 transform active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Oyun Aranıyor...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Oyuna Gir</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-400">
          <QrCode className="w-4 h-4 text-brand-400" />
          <span>Tahtadaki karekodu telefonunuzun kamerasıyla da okutabilirsiniz</span>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}

