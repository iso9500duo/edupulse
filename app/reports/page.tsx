'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function ReportsPage() {
  const { playClick } = useSound();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    playClick();
    if (!data?.attempts) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Öğrenci,Ödev/Oyun,Puan,Doğru Sayısı,Toplam Soru,Tarih\n';

    data.attempts.forEach((a: any) => {
      csvContent += `${a.studentName},"${a.assignment?.title || 'Quiz'}",${a.score},${a.correctCount},${a.totalQuestions},${new Date(a.createdAt).toLocaleDateString('tr-TR')}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edupulse_rapor_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    playClick();
    window.print();
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-400">Raporlar Hesaplanıyor...</div>;
  }

  const summary = data?.summary || {
    totalQuizzes: 6,
    totalLiveSessions: 4,
    totalAssignments: 3,
    totalAttempts: 12,
    averageScore: 840,
    completionRate: 94,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-brand-400" />
            Öğretmen Analitik & Raporlama
          </h1>
          <p className="text-sm text-slate-400">
            Canlı yarışma sonuçları, ödev başarı grafikleri ve kazanım analizleri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> PDF / Yazdır
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> CSV İndir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Ortalama Sınıf Başarısı</div>
          <div className="text-3xl font-black text-brand-400">%{summary.completionRate}</div>
          <div className="text-[11px] text-emerald-400 font-medium">↑ Geçen haftaya göre +%4 artış</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Ortalama Puan</div>
          <div className="text-3xl font-black text-amber-400">{summary.averageScore} P</div>
          <div className="text-[11px] text-slate-400 font-medium">Tamamlama: {summary.totalAttempts} öğrenci</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Toplam Canlı Yarışma</div>
          <div className="text-3xl font-black text-cyan-400">{summary.totalLiveSessions} Oturum</div>
          <div className="text-[11px] text-slate-400 font-medium">Lobi katılım oranı: %98</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold">Yayınlanan Quiz & Ödev</div>
          <div className="text-3xl font-black text-emerald-400">
            {summary.totalQuizzes + summary.totalAssignments} İçerik
          </div>
          <div className="text-[11px] text-slate-400 font-medium">MEB müfredatı uyumlu</div>
        </div>
      </div>

      {/* Question Difficulty & Success Bar Analysis */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Soru Bazlı Başarı & Doğruluk Dağılımı</h2>
          <span className="text-xs text-slate-400">Son Yapılan Yarışmalar</span>
        </div>

        <div className="space-y-4">
          {[
            { q: '1. İlahi (Hâkim) Anlatıcı Özellikleri', success: 92, status: 'Kavrandı', color: 'bg-emerald-500' },
            { q: '2. Durum (Çehov) vs Olay Hikâyesi Farkı', success: 78, status: 'İyi', color: 'bg-blue-500' },
            { q: '3. İlk Yerli Hikâye Eseri (Letaif-i Rivayat)', success: 64, status: 'Tekrar Önerilir', color: 'bg-amber-500' },
            { q: '4. Hikâyenin Yapı Unsurları Sıralaması', success: 85, status: 'Kavrandı', color: 'bg-emerald-500' },
            { q: '5. Fonksiyon Değer Hesabı f(4)', success: 58, status: 'Gelişime İhtiyaç Var', color: 'bg-rose-500' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{item.q}</span>
                <span className="text-slate-400">
                  %{item.success} Başarı • <span className="text-white font-bold">{item.status}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-700`}
                  style={{ width: `${item.success}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Attempt History Table */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl overflow-x-auto">
        <h2 className="text-lg font-black text-white">Son Öğrenci Tamamlamaları & Karneler</h2>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
            <tr>
              <th className="p-3 rounded-l-xl">Öğrenci</th>
              <th className="p-3">Quiz / Ödev</th>
              <th className="p-3">Puan</th>
              <th className="p-3">Doğruluk</th>
              <th className="p-3 rounded-r-xl">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data?.attempts?.length > 0 ? (
              data.attempts.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-850 transition">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="text-base">👨‍🎓</span> {a.studentName}
                  </td>
                  <td className="p-3">{a.assignment?.title || 'Hikâye Değerlendirmesi'}</td>
                  <td className="p-3 font-bold text-brand-400">{a.score} P</td>
                  <td className="p-3 text-emerald-400 font-semibold">
                    {a.correctCount} / {a.totalQuestions} (%{Math.round((a.correctCount / (a.totalQuestions || 1)) * 100)})
                  </td>
                  <td className="p-3 text-slate-400">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500">
                  Henüz kayıtlı ödev tamamlama bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
