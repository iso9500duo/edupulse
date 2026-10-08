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
      <nav className="rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#340C24]/[0.08] shadow-lumina-level1 px-3 sm:px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-5">
            <Link
              href="/"
              onClick={playClick}
              className="flex items-center space-x-2.5 text-xl font-black tracking-tight group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#E83389] flex items-center justify-center shadow-md shadow-[#E83389]/25 group-hover:scale-105 transition transform">
                <Zap className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-display font-extrabold text-[#340C24]">
                Edu<span className="text-[#E83389]">Pulse</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 text-xs font-bold text-[#594048]">
              <Link
                href="/explore"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-[#340C24] hover:bg-[#F5F1E6] transition flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-[#0284C7]" />
                Keşfet
              </Link>
              <Link
                href="/courses"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-[#340C24] hover:bg-[#F5F1E6] transition flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-[#2E7D32]" />
                Kurslar
              </Link>
              <Link
                href="/study"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-[#340C24] hover:bg-[#F5F1E6] transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-[#D97706]" />
                Solo Çalış
              </Link>
              <Link
                href="/question-bank"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-[#340C24] hover:bg-[#F5F1E6] transition flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-[#6D28D9]" />
                Soru Bankası
              </Link>
              <Link
                href="/classes"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-[#340C24] hover:bg-[#F5F1E6] transition flex items-center gap-1.5"
              >
                <Gamepad2 className="w-4 h-4 text-[#712ae2]" />
                Sınıflar & Ödev
              </Link>
              <Link
                href="/premium"
                onClick={playClick}
                className="px-3 py-2 rounded-xl bg-[#FFE0EC] text-[#E83389] border border-[#E83389]/20 hover:bg-[#FFD8E8] transition flex items-center gap-1.5 font-bold"
              >
                <Crown className="w-4 h-4 text-[#E83389]" />
                Premium
              </Link>
              <Link
                href="/marketplace"
                onClick={playClick}
                className="px-3 py-2 rounded-xl hover:text-[#E83389] hover:bg-[#FFE0EC]/60 transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-[#E83389]" />
                Mağaza
              </Link>
            </div>
          </div>

          {/* Right Area Controls & User */}
          <div className="flex items-center space-x-3">
            {/* Quick Sound Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-[#F5F1E6] hover:bg-[#FFE0EC] text-[#594048] hover:text-[#340C24] transition"
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#2E7D32]" />}
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#FFF0F4] text-[#E83389] border border-[#E83389]/25 hover:bg-[#FFE0EC] transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E83389]" />
                <span className="hidden sm:inline">Hızlı Rol:</span> {user?.role || 'Demo Seç'}
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#340C24]/10 rounded-2xl shadow-lumina-level2 p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-[#8C6F78] font-bold">1-Tıkla Hesap Değiştir:</div>
                  <button
                    onClick={async () => {
                      playClick();
                      await loginAsDemo('TEACHER');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFF0F4] hover:text-[#E83389] font-medium transition"
                  >
                    👩‍🏫 Öğretmen (Tüm Yetkiler)
                  </button>
                  <button
                    onClick={async () => {
                      playClick();
                      await loginAsDemo('STUDENT');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFF0F4] hover:text-[#E83389] font-medium transition"
                  >
                    👨‍🎓 Öğrenci (Oyun & Solo)
                  </button>
                  <button
                    onClick={async () => {
                      playClick();
                      await loginAsDemo('ADMIN');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFF0F4] hover:text-[#E83389] font-medium transition"
                  >
                    👑 Yönetici (Admin Paneli)
                  </button>
                </div>
              )}
            </div>

            {/* User State */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/creator"
                  onClick={playClick}
                  className="hidden md:flex items-center space-x-1.5 btn-lumina-cta px-3 py-1.5 text-xs shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Quiz Oluştur</span>
                </Link>

                <div className="hidden sm:flex items-center space-x-2 text-xs">
                  <div className="flex items-center bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20 px-2 py-1 rounded-full font-bold">
                    <Flame className="w-3.5 h-3.5 mr-0.5 fill-[#D97706]" />
                    {user.streak || 0}
                  </div>
                  <div className="flex items-center bg-[#EDE9FE] text-[#6D28D9] border border-[#6D28D9]/20 px-2 py-1 rounded-full font-bold">
                    {user.xp || 0} XP
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="p-2 rounded-xl bg-[#FFE0EC] text-[#E83389] hover:bg-[#FFD8E8] transition"
                      title="Admin Paneli"
                    >
                      <Shield className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href="/reports"
                    className="p-2 rounded-xl bg-[#F5F1E6] text-[#340C24] hover:bg-[#FFE0EC] transition"
                    title="Raporlar & Analiz"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      playClick();
                      logout();
                    }}
                    className="p-2 rounded-xl bg-[#F5F1E6] text-[#8C6F78] hover:text-rose-600 transition"
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
                  className="px-3 py-1.5 text-xs font-semibold text-[#340C24] hover:bg-[#F5F1E6] rounded-xl transition"
                >
                  Giriş
                </Link>
                <Link
                  href="/register"
                  className="btn-lumina-cta px-3.5 py-1.5 text-xs text-white"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F5F1E6] text-[#340C24]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#340C24]/[0.08] px-4 pt-3 pb-5 space-y-1 text-sm font-semibold text-[#594048]">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#340C24]"
            >
              🔍 Keşfet
            </Link>
            <Link
              href="/creator"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#E83389]"
            >
              ✏️ Quiz Oluştur
            </Link>
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#340C24]"
            >
              📚 Kurslar
            </Link>
            <Link
              href="/study"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#340C24]"
            >
              🎯 Solo & Flashcards
            </Link>
            <Link
              href="/classes"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#340C24]"
            >
              👥 Sınıflar & Ödev
            </Link>
            <Link
              href="/question-bank"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#340C24]"
            >
              📦 Soru Bankası
            </Link>
            <Link
              href="/reports"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-[#340C24]"
            >
              📊 Raporlar & Analiz
            </Link>
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#E83389]"
            >
              🛍️ İçerik Mağazası
            </Link>
            <Link
              href="/premium"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#D97706]"
            >
              👑 Premium Üyelik
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
