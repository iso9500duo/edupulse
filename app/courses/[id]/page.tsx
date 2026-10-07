'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Play,
  ArrowRight,
  ArrowLeft,
  Award,
  Video,
  FileText,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function SingleCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { playClick, playCorrect } = useSound();

  const [course, setCourse] = useState<any>(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        const found = (data.courses || []).find((c: any) => c.id === courseId) || data.courses?.[0];
        setCourse(found);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const activeModule = course?.modules?.[activeModuleIdx];
  const progressPercent = course?.modules?.length
    ? Math.round((completedModules.length / course.modules.length) * 100)
    : 0;

  const handleCompleteStep = () => {
    playCorrect();
    if (!completedModules.includes(activeModuleIdx)) {
      setCompletedModules([...completedModules, activeModuleIdx]);
    }
    if (activeModuleIdx + 1 < (course?.modules?.length || 0)) {
      setActiveModuleIdx((prev) => prev + 1);
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-400">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Course Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <Link href="/courses" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Kurslara Dön
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">{course?.title}</h1>
            <p className="text-xs text-slate-400 mt-1">{course?.description}</p>
          </div>
          <div className="w-48 space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>İlerleme</span>
              <span className="text-emerald-400 font-bold">%{progressPercent}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Module List */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Kurs Bölümleri ({course?.modules?.length || 0})
          </h2>
          <div className="space-y-2">
            {course?.modules?.map((mod: any, idx: number) => {
              const isDone = completedModules.includes(idx);
              const isActive = activeModuleIdx === idx;
              return (
                <div
                  key={mod.id || idx}
                  onClick={() => { playClick(); setActiveModuleIdx(idx); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-800 border-brand-500 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold">{mod.title}</div>
                      <div className="text-[10px] text-slate-400">{mod.type}</div>
                    </div>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Module Content Player */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-2xl">
          {activeModule ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold border border-brand-500/20">
                  {activeModule.type}
                </span>
                <span className="text-xs text-slate-400">Bölüm {activeModuleIdx + 1}</span>
              </div>

              <h2 className="text-2xl font-black text-white">{activeModule.title}</h2>

              {/* Module Body Content */}
              <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-4">
                <p>{activeModule.content || 'Bu bölümde ders anlatımı ve pedagojik açıklamalar yer almaktadır.'}</p>

                {activeModule.type === 'QUIZ' && activeModule.quizId && (
                  <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-3">
                    <div className="text-lg font-bold text-white">İnteraktif Değerlendirme Quizi</div>
                    <p className="text-xs text-slate-400">Bu bölümü tamamlamak için hazırlanan quiz'i çözünüz.</p>
                    <Link
                      href={`/solo/${activeModule.quizId}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Quize Başla
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">Modül seçiniz.</div>
          )}

          <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
            <button
              disabled={activeModuleIdx === 0}
              onClick={() => { playClick(); setActiveModuleIdx((p) => p - 1); }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30"
            >
              Önceki Bölüm
            </button>
            <button
              onClick={handleCompleteStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              Tamamla & Devam Et <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
