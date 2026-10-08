'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useSound } from './SoundProvider';
import {
  Sparkles,
  Gamepad2,
  Compass,
  BookOpen,
  GraduationCap,
  Layers,
  Crown,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Flame,
  Zap,
  Menu,
  X,
  ShoppingBag,
  Shield,
  PlusCircle,
} from 'lucide-react';

export default function Navbar() {
  const { user, loginAsDemo, logout } = useAuth();
  const { isMuted, toggleMute, playClick } = useSound();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-2 sm:top-3 z-50 px-2 sm:px-6 max-w-7xl mx-auto transition-all">
      <nav className="rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 px-3 sm:px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-5">
            <Link
              href="/"
              onClick={playClick}
              className="flex items-center space-x-2.5 text-xl font-black tracking-tight group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 group-hover:shadow-brand-500/50 transition transform">
                <Zap className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-white via-indigo-100 to-brand-300 bg-clip-text text-transparent font-display">
                Edu<span className="text-brand-400">Pulse</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 text-xs font-bold text-slate-300">
              <Link
                href="/explore"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-accent-cyan" />
                Keşfet
              </Link>
              <Link
                href="/courses"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Kurslar
              </Link>
              <Link
                href="/study"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-accent-amber" />
                Solo Çalış
              </Link>
              <Link
                href="/question-bank"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                Soru Bankası
              </Link>
              <Link
                href="/classes"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                Sınıflar & Ödev
              </Link>
              <Link
                href="/premium"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white bg-amber-500/10 text-amber-300 border border-amber-500/20 transition flex items-center gap-1.5"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Premium
              </Link>
              <Link
                href="/marketplace"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-pink-400" />
                Mağaza
              </Link>
            </div>
          </div>

          {/* Right Area Controls & User */}
          <div className="flex items-center space-x-3">
            {/* Quick Sound Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Hızlı Rol:</span> {user?.role || 'Demo Seç'}
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-slate-400 font-medium">1-Tıkla Hesap Değiştir:</div>
                  <button
                    onClick={async () => {
                      playClick();
                      await loginAsDemo('TEACHER');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-600/30 text-slate-200 flex items-center justify-between"
                  >
                    <span>👩‍🏫 Öğretmen (Ayşe)</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">PRO</span>
                  </button>
                  <button
                    onClick={async () => {
                      playClick();
                      await loginAsDemo('STUDENT');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-600/30 text-slate-200 flex items-center justify-between"
                  >
                    <span>👨‍🎓 Öğrenci (Emre)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">LVL 4</span>
                  </button>
                  <button
                    onClick={async () => {
                      playClick();
                      await loginAsDemo('ADMIN');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-600/30 text-slate-200 flex items-center justify-between"
                  >
                    <span>👑 Yönetici (Admin)</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">ALL</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick PIN Join Shortcut */}
            <Link
              href="/join"
              onClick={playClick}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/80 transition"
            >
              <Zap className="w-3.5 h-3.5 text-accent-cyan" />
              <span>PIN Gir</span>
            </Link>

            {/* Create Quiz Shortcut with 3D tactile button */}
            <Link
              href="/creator"
              onClick={playClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-tactile-brand btn-tactile transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Quiz Oluştur</span>
            </Link>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs">
                  <div className="flex items-center text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5 mr-0.5 text-amber-500 fill-amber-500" />
                    {user.streak || 0}
                  </div>
                  <div className="text-slate-500">|</div>
                  <div className="text-indigo-300 font-medium">{user.xp || 0} XP</div>
                </div>

                <div className="flex items-center space-x-1">
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition"
                      title="Admin Paneli"
                    >
                      <Shield className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href="/reports"
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                    title="Raporlar & Analiz"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      playClick();
                      logout();
                    }}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                    title="Çıkış Yap"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Giriş
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 text-sm">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            🔍 Keşfet
          </Link>
          <Link
            href="/creator"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-brand-400 font-semibold"
          >
            ✏️ Quiz Oluştur
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            📚 Kurslar
          </Link>
          <Link
            href="/study"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            🎯 Solo & Flashcards
          </Link>
          <Link
            href="/classes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            👥 Sınıflar & Ödev
          </Link>
          <Link
            href="/question-bank"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            📦 Soru Bankası
          </Link>
          <Link
            href="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            📊 Raporlar & Analiz
          </Link>
          <Link
            href="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-pink-400 font-medium"
          >
            🛍️ İçerik Mağazası
          </Link>
          <Link
            href="/premium"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-amber-400 font-medium"
          >
            👑 Premium Üyelik
          </Link>
        </div>
      )}
    </nav>
  </header>
  );
}
