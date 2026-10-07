'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSound } from '@/components/SoundProvider';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsDemo, refreshUser } = useAuth();
  const { playClick, playCorrect } = useSound();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playClick();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        playCorrect();
        await refreshUser();
        router.push('/');
      } else {
        setError(data.error || 'Giriş yapılamadı.');
      }
    } catch (err: any) {
      setError('Sunucu hatası: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: 'TEACHER' | 'STUDENT' | 'ADMIN') => {
    playClick();
    setLoading(true);
    try {
      await loginAsDemo(role);
      playCorrect();
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">EduPulse'a Giriş Yap</h1>
          <p className="text-xs text-slate-400">Eğitim ve canlı quiz platformuna hoş geldiniz</p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
          <div className="text-[11px] font-bold text-brand-300 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Hızlı Demo Girişi (1-Tıkla):
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('TEACHER')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600/30 border border-indigo-500/30 text-[11px] font-bold text-indigo-200 transition text-center"
            >
              👩‍🏫 Öğretmen
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('STUDENT')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold text-emerald-200 transition text-center"
            >
              👨‍🎓 Öğrenci
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('ADMIN')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 border border-rose-500/30 text-[11px] font-bold text-rose-200 transition text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">E-posta Adresi</label>
            <input
              type="email"
              placeholder="adiniz@okul.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="text-brand-400 font-bold hover:underline">
            Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
}
