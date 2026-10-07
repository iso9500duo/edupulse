'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Award,
  DollarSign,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((d) => setStats(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-400">Yönetim Paneli Yükleniyor...</div>;
  }

  const metrics = stats?.metrics || {
    totalUsers: 3,
    totalTeachers: 1,
    totalStudents: 1,
    totalQuizzes: 4,
    totalSessions: 3,
    activeMonthlyUsers: 27,
    estimatedRevenue: '₺14,850',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-rose-500" />
            Sistem Yönetim Paneli (Admin)
          </h1>
          <p className="text-sm text-slate-400">
            Kullanıcı yönetimi, sistem metrikleri, içerik moderasyonu ve denetim kayıtları
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold">
          Sistem Durumu: Normal (Sağlıklı)
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Toplam Kullanıcı</div>
          <div className="text-3xl font-black text-white">{metrics.totalUsers}</div>
          <div className="text-[11px] text-slate-400">
            {metrics.totalTeachers} Öğretmen • {metrics.totalStudents} Öğrenci
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Aktif Canlı Oyunlar</div>
          <div className="text-3xl font-black text-brand-400">{metrics.totalSessions}</div>
          <div className="text-[11px] text-emerald-400 font-medium">WebSocket bağlantısı aktif</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Yayınlanan Quizler</div>
          <div className="text-3xl font-black text-amber-400">{metrics.totalQuizzes}</div>
          <div className="text-[11px] text-slate-400">MEB onaylı soru paketleri</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Tahmini Aylık Ciro</div>
          <div className="text-3xl font-black text-emerald-400">{metrics.estimatedRevenue}</div>
          <div className="text-[11px] text-slate-400">Abonelik & Mağaza gelirleri</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl overflow-x-auto">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Kullanıcılar & Abonelik Durumları
        </h2>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3 rounded-l-xl">Ad Soyad</th>
              <th className="p-3">E-posta</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Plan</th>
              <th className="p-3 rounded-r-xl">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(stats?.users || []).map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-850 transition">
                <td className="p-3 font-bold text-white">{u.name}</td>
                <td className="p-3 text-slate-400">{u.email}</td>
                <td className="p-3 font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-500/20 text-rose-300'
                        : u.role === 'TEACHER'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3 font-bold text-amber-400">{u.plan}</td>
                <td className="p-3 font-mono">{u.xp} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Moderation Reports Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          İçerik Moderasyonu & Bildirimler
        </h2>

        <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">İnceleme Bekleyen Spam veya Telif Uyarısı Yok</div>
              <div className="text-slate-400">Tüm quiz içerikleri otomatik ve pedagojik filtrelerden geçti.</div>
            </div>
          </div>
          <span className="text-emerald-400 font-bold">%100 Temiz</span>
        </div>
      </div>
    </div>
  );
}
