'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function QuestionBankPage() {
  const router = useRouter();
  const { playClick, playCorrect } = useSound();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Excel Modal
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Excel Üzerinden Aktarılan Sınav');
  const [rawText, setRawText] = useState(`question,optionA,optionB,optionC,optionD,correctAnswer,time,points,difficulty,explanation
Amasya Genelgesi hangi tarihte ilan edilmiştir?,22 Haziran 1919,23 Nisan 1920,19 Mayıs 1919,29 Ekim 1923,A,20,1000,MEDIUM,Amasya Tamimi 22 Haziran 1919'da Mustafa Kemal ve silah arkadaşlarınca yayımlandı.
f(x) = 2x + 7 olduğuna göre f(3) kaçtır?,13,10,14,21,A,15,1000,EASY,f(3) = 2*3 + 7 = 13.
Hücrenin enerji santrali kabul edilen organel hangisidir?,Mitokondri,Ribozom,Golgi,Lizozom,A,20,1000,EASY,Mitokondri ATP üretim merkezidir.`);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch('/api/quizzes')
      .then((res) => res.json())
      .then((data) => setQuizzes(data.quizzes || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Extract all questions from quizzes
  const allQuestions: any[] = [];
  quizzes.forEach((quiz) => {
    (quiz.questions || []).forEach((q: any) => {
      allQuestions.push({
        ...q,
        quizTitle: quiz.title,
        subjectName: quiz.subject?.name || 'Genel',
        gradeLevel: quiz.gradeLevel || 10,
      });
    });
  });

  const filteredQuestions = allQuestions.filter((q) => {
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.explanation?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL' || q.subjectName === selectedSubject;
    const matchesGrade = selectedGrade === 'ALL' || String(q.gradeLevel) === selectedGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const handleImportSubmit = async () => {
    setImporting(true);
    setImportErrors([]);
    playClick();

    try {
      const lines = rawText.trim().split('\n');
      if (lines.length <= 1) {
        alert('En az bir veri satırı gereklidir.');
        setImporting(false);
        return;
      }

      // First line is header
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(',');
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = vals[idx]?.trim();
        });
        rows.push(rowObj);
      }

      const res = await fetch('/api/quizzes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle,
          rows,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playCorrect();
        alert(`🎉 ${data.importedCount} adet soru başarıyla aktarıldı ve '${quizTitle}' olarak kaydedildi!`);
        setExcelModalOpen(false);
        // Refresh quizzes
        const qRes = await fetch('/api/quizzes');
        const qData = await qRes.json();
        setQuizzes(qData.quizzes || []);
      } else {
        setImportErrors(data.errors || [{ reason: data.error }]);
      }
    } catch (err: any) {
      alert('İçe aktarma hatası: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Layers className="w-8 h-8 text-purple-400" />
            MEB Müfredatı Soru Bankası
          </h1>
          <p className="text-sm text-slate-400">
            Ders ve kazanımlara göre sınıflandırılmış binlerce özgün soru ve Excel/CSV aktarım merkezi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { playClick(); setExcelModalOpen(true); }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel / CSV Toplu Soru Aktar
          </button>
          <Link
            href="/creator"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Yeni Quiz Tasarla
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Soru metni veya kazanım ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
        >
          <option value="ALL">Tüm Dersler</option>
          <option value="Türk Dili ve Edebiyatı">Türk Dili ve Edebiyatı</option>
          <option value="Matematik">Matematik</option>
          <option value="Tarih">Tarih</option>
          <option value="Fizik">Fizik</option>
          <option value="Biyoloji">Biyoloji</option>
        </select>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
        >
          <option value="ALL">Tüm Sınıflar</option>
          <option value="9">9. Sınıf</option>
          <option value="10">10. Sınıf</option>
          <option value="11">11. Sınıf</option>
          <option value="12">12. Sınıf</option>
        </select>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Bulunan Sorular ({filteredQuestions.length})
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
            Filtrelere uygun soru bulunamadı. Excel ile yeni sorular yükleyebilirsiniz.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 transition space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {q.subjectName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {q.gradeLevel}. Sınıf
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {q.type}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 truncate max-w-xs">
                    Kaynak: {q.quizTitle}
                  </span>
                </div>

                <div className="font-bold text-white text-base">{q.title}</div>

                {/* Options preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {q.options?.map((opt: any, oIdx: number) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-xl border font-medium truncate ${
                        opt.isCorrect
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {opt.text} {opt.isCorrect && '✓'}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded-lg">
                    💡 <span className="font-semibold text-slate-300">Açıklama:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Excel / CSV Modal */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Excel / CSV Toplu Soru Yükleme
            </h3>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400">Oluşturulacak Quiz Başlığı</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white">Kolon Yapısı (Virgülle Ayrılmış):</div>
              <code className="text-emerald-400 text-[11px] block overflow-x-auto">
                question, optionA, optionB, optionC, optionD, correctAnswer, time, points, difficulty, explanation
              </code>
            </div>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none"
            />

            {/* Error Reporting */}
            {importErrors.length > 0 && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> Hatalı Satırlar:
                </div>
                {importErrors.map((err, i) => (
                  <div key={i}>
                    • Satır {err.rowNumber || '-'}: {err.reason}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setExcelModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-800 text-slate-300"
              >
                İptal
              </button>
              <button
                disabled={importing}
                onClick={handleImportSubmit}
                className="px-5 py-2 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50"
              >
                {importing ? 'Aktarılıyor...' : 'Soruları Aktar & Quizi Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
