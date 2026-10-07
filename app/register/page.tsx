'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSound } from '@/components/SoundProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { playClick, playCorrect } = useSound();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playClick();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        playCorrect();
        await refreshUser();
        router.push('/');
      } else {
        setError(data.error || 'Kayıt başarısız.');
      }
    } catch (err: any) {
      setError('Sunucu hatası: ' + err.message);
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
          <h1 className="text-2xl font-black text-white">Yeni Hesap Oluştur</h1>
          <p className="text-xs text-slate-400">EduPulse dünyasına katılın, eğlenerek öğrenin</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Hesap Türü</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  role === 'STUDENT'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                👨‍🎓 Öğrenci
              </button>
              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`py-2 rounded-xl text-xs font-bold transition border ${
                  role === 'TEACHER'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                👩‍🏫 Öğretmen
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Adınız ve Soyadınız</label>
            <input
              type="text"
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

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
            {loading ? 'Kayıt Olunuyor...' : 'Hesabı Oluştur'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-brand-400 font-bold hover:underline">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}
