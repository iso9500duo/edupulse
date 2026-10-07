'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Users, Play, CheckCircle2, Crown, Sparkles, Plus } from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { useAuth } from '@/components/AuthProvider';

export default function CoursesPage() {
  const { playClick } = useSound();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New course modal
  const [modalOpen, setModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateCourse = async () => {
    if (!courseTitle.trim()) return;
    playClick();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDesc,
          modules: [
            { title: 'Bölüm 1: Giriş ve Kavramsal Çerçeve', type: 'LESSON', content: 'Temel kavramlar.' },
            { title: 'Bölüm 2: Uygulamalı Örnekler', type: 'LESSON', content: 'Detaylı anlatım.' },
            { title: 'Bölüm 3: Bölüm Değerlendirme Quizi', type: 'QUIZ' },
          ],
        }),
      });
      const data = await res.json();
      if (data.course) {
        setCourses([data.course, ...courses]);
        setModalOpen(false);
        setCourseTitle('');
        setCourseDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-emerald-400" />
            İnteraktif Kurslar & Modüller
          </h1>
          <p className="text-sm text-slate-400">
            Ders içerikleri, video dersler, slaytlar ve quizlerin birleştiği tam kapsamlı öğrenim yolları
          </p>
        </div>

        {user?.role === 'TEACHER' && (
          <button
            onClick={() => { playClick(); setModalOpen(true); }}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Yeni Kurs Oluştur
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all p-6 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {c.modules?.length || 0} Bölüm
                  </span>
                  {c.isPremium && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" /> PRO
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-lg line-clamp-2">{c.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {c.description || 'MEB müfredatı ile uyumlu modüler ders ve quiz kursu.'}
                </p>

                {/* Progress mock */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                    <span>Kurs İlerlemesi</span>
                    <span className="text-emerald-400 font-bold">%40</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[40%]" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Eğitmen: <span className="font-bold text-white">{c.creator?.name || 'Ayşe Öğretmen'}</span>
                </div>
                <Link
                  href={`/courses/${c.id}`}
                  onClick={playClick}
                  className="px-4 py-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Kursa Başla
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for new course */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">Yeni İnteraktif Kurs Oluştur</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Kurs Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: 10. Sınıf Hikâye ve Edebi Metinler"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Açıklama</label>
                <textarea
                  rows={3}
                  placeholder="Kurs hakkında detaylar..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300"
              >
                İptal
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-5 py-2 text-xs rounded-xl bg-emerald-600 text-white font-bold"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
