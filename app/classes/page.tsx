'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  BookOpen,
  Calendar,
  Award,
  Share2,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { useAuth } from '@/components/AuthProvider';

export default function ClassesPage() {
  const { playClick, playCorrect } = useSound();
  const { user } = useAuth();

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Class Modal
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('10');

  // New Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [quizzes, setQuizzes] = useState<any[]>([]);

  // Student Join Modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data.classes || []);

      const qRes = await fetch('/api/quizzes');
      const qData = await qRes.json();
      setQuizzes(qData.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!className.trim()) return;
    playClick();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className, gradeLevel: parseInt(classGrade, 10) }),
      });
      const data = await res.json();
      if (data.class) {
        setClasses([data.class, ...classes]);
        setClassModalOpen(false);
        setClassName('');
        playCorrect();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim() || !selectedQuizId) return;
    playClick();
    try {
      const deadline = new Date(Date.now() + parseInt(deadlineDays, 10) * 24 * 60 * 60 * 1000);
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignTitle,
          quizId: selectedQuizId,
          classId: selectedClassId || null,
          deadline,
        }),
      });
      const data = await res.json();
      if (data.assignment) {
        alert(`🎉 Ödev oluşturuldu! Ödev Kodu: ${data.assignment.code}`);
        setAssignModalOpen(false);
        setAssignTitle('');
        playCorrect();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    playClick();
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setJoinModalOpen(false);
        setJoinCode('');
        playCorrect();
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-400" />
            Sınıf Yönetimi & Ödev Dağıtımı
          </h1>
          <p className="text-sm text-slate-400">
            Sınıflar oluşturun, öğrencileri davet edin ve zaman ayarlı ödevler tanımlayın
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'STUDENT' ? (
            <button
              onClick={() => { playClick(); setJoinModalOpen(true); }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Sınıf Koduna Katıl
            </button>
          ) : (
            <>
              <button
                onClick={() => { playClick(); setAssignModalOpen(true); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-emerald-400" /> Yeni Ödev Tanımla
              </button>
              <button
                onClick={() => { playClick(); setClassModalOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Sınıf Ekle (9/A, 10/B)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Class Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
          Henüz kayıtlı sınıf bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition p-6 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {c.gradeLevel}. Sınıf
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Kod: {c.code}
                  </span>
                </div>

                <h3 className="font-bold text-white text-xl">{c.name}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {c.members?.length || 0} Öğrenci Kayıtlı
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {c.assignments?.length || 0} Aktif Ödev
                  </span>
                </div>

                {/* Assignment list preview */}
                {c.assignments && c.assignments.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Son Ödevler:</div>
                    {c.assignments.slice(0, 2).map((a: any) => (
                      <Link
                        key={a.id}
                        href={`/assignments/${a.code}`}
                        className="block p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-xs text-slate-300 truncate transition"
                      >
                        📌 {a.title} ({a.code})
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(c.code);
                    alert(`Sınıf katılım kodu kopyalandı: ${c.code}`);
                  }}
                  className="hover:text-white flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" /> Kodu Kopyala
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Modal */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Yeni Sınıf Oluştur</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Sınıf Adı</label>
                <input
                  type="text"
                  placeholder="Örn: 10/A veya 9/B Şubesi"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Sınıf Seviyesi</label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="9">9. Sınıf</option>
                  <option value="10">10. Sınıf</option>
                  <option value="11">11. Sınıf</option>
                  <option value="12">12. Sınıf</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setClassModalOpen(false)} className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300">
                İptal
              </button>
              <button onClick={handleCreateClass} className="px-5 py-2 text-xs rounded-xl bg-brand-600 text-white font-bold">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Öğrencilere Ödev Gönder</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ödev Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Hafta 3: Hikâye Yapı Unsurları Tekrarı"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Gönderilecek Quiz</label>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">Quiz Seçiniz...</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Sınıf (Opsiyonel)</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">Tüm Öğrenciler / Misafir Katılım</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Tamamlama Süresi (Gün)</label>
                <select
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="3">3 Gün</option>
                  <option value="7">7 Gün (1 Hafta)</option>
                  <option value="14">14 Gün (2 Hafta)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300">
                İptal
              </button>
              <button onClick={handleCreateAssignment} className="px-5 py-2 text-xs rounded-xl bg-emerald-600 text-white font-bold">
                Ödevi Yayınla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Sınıf Koduna Katıl</h3>
            <p className="text-xs text-slate-400">Öğretmeninizin size verdiği sınıf kodunu giriniz (Örn: CLS-10A)</p>
            <input
              type="text"
              placeholder="CLS-..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setJoinModalOpen(false)} className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300">
                İptal
              </button>
              <button onClick={handleJoinClass} className="px-5 py-2 text-xs rounded-xl bg-indigo-600 text-white font-bold">
                Katıl
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
