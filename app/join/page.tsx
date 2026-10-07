'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Play } from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function JoinPage() {
  const [pin, setPin] = useState('');
  const router = useRouter();
  const { playClick } = useSound();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    playClick();
    router.push(`/live/play/${pin.trim()}`);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
          <Zap className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white">Canlı Oyuna Katıl</h1>
          <p className="text-xs text-slate-400">Öğretmenin paylaştığı 6 haneli PIN kodunu giriniz</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Oyun Kodu (PIN)"
            value={pin}
            onChange={(e) => setPin(e.target.value.toUpperCase())}
            maxLength={8}
            required
            className="w-full bg-slate-800 border border-slate-700 text-white font-black text-center rounded-2xl py-3.5 text-2xl tracking-widest placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-600/30 transition flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            Oyuna Gir
          </button>
        </form>
      </div>
    </div>
  );
}
