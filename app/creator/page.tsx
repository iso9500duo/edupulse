'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Play,
  BrainCircuit,
  FileSpreadsheet,
  Clock,
  Award,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  CheckSquare,
  Sparkles,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  MoveUp,
  MoveDown,
  Layers,
  Link as LinkIcon,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { useAuth } from '@/components/AuthProvider';

interface QuestionDraft {
  id: string;
  type: string;
  title: string;
  explanation: string;
  timeLimit: number;
  points: number;
  allowMultiple: boolean;
  difficulty: string;
  mediaUrl?: string;
  configJson?: any;
  options: {
    text: string;
    isCorrect: boolean;
    color?: string;
    matchTarget?: string;
    orderIndex?: number;
  }[];
}

// 20 Soru Türü - 3 Ana Kategoride
const ALL_QUESTION_TYPES = [
  // 1. Bilgi Testi
  { value: 'MULTIPLE_CHOICE', label: 'Çoktan Seçmeli (Quiz)', icon: '🔘', category: 'Bilgi Testi', desc: '4 seçenekli standart test sorusu' },
  { value: 'TRUE_FALSE', label: 'Doğru / Yanlış', icon: '⚖️', category: 'Bilgi Testi', desc: 'Hızlı 2 seçenekli doğruluk sorusu' },
  { value: 'TYPE_ANSWER', label: 'Metin Yanıtı', icon: '⌨️', category: 'Bilgi Testi', desc: 'Öğrencinin cevabı klavyeden yazdığı soru' },
  { value: 'PUZZLE', label: 'Sıralama (Puzzle)', icon: '🧩', category: 'Bilgi Testi', desc: 'Adımları doğru sıraya dizme sorusu' },
  { value: 'SLIDER', label: 'Sayı Cetveli (Slider)', icon: '📏', category: 'Bilgi Testi', desc: 'Sayı aralığında cetvel kaydırarak cevaplama' },
  { value: 'PIN_ANSWER', label: 'Nokta İşaretleme', icon: '📍', category: 'Bilgi Testi', desc: 'Harita veya görselde doğru konumu seçme' },
  { value: 'DROP_PIN', label: 'Görsel Üzeri Pin', icon: '🎯', category: 'Bilgi Testi', desc: 'Görsel üzerinde hedef alanı pinleme' },

  // 2. Görüş / Etkileşim
  { value: 'POLL', label: 'Anket / Oylama', icon: '📊', category: 'Görüş & Etkileşim', desc: 'Doğru cevabı olmayan sınıf oylaması' },
  { value: 'SCALE', label: 'Derecelendirme Ölçeği', icon: '⭐', category: 'Görüş & Etkileşim', desc: '1-5 arası katılım düzeyi ölçme' },
  { value: 'NPS_SCALE', label: 'NPS Skalası (0-10)', icon: '📈', category: 'Görüş & Etkileşim', desc: '0 ile 10 arası net tavsiye skoru' },
  { value: 'WORD_CLOUD', label: 'Kelime Bulutu', icon: '☁️', category: 'Görüş & Etkileşim', desc: 'Öğrenci yanıtlarından dinamik bulut' },
  { value: 'OPEN_ENDED', label: 'Açık Uçlu Düşünce', icon: '💬', category: 'Görüş & Etkileşim', desc: 'Serbest metin ile fikir toplama' },
  { value: 'BRAINSTORM', label: 'Beyin Fırtınası', icon: '💡', category: 'Görüş & Etkileşim', desc: 'Fikir paylaşımı ve sınıf tartışması' },

  // 3. Gelişmiş & Medya
  { value: 'MATCHING', label: 'Eşleştirme Kartları', icon: '🔄', category: 'Gelişmiş & Medya', desc: 'Kavram ve tanımları eşleştirme' },
  { value: 'ORDERING', label: 'Adım Sıralama', icon: '🔢', category: 'Gelişmiş & Medya', desc: 'Olay veya işlem basamaklarını sıralama' },
  { value: 'SHORT_ANSWER', label: 'Kısa Cevap', icon: '✏️', category: 'Gelişmiş & Medya', desc: 'Kısa sözcük veya formül yanıtı' },
  { value: 'MULTIPLE_SELECT', label: 'Çoklu Seçim', icon: '☑️', category: 'Gelişmiş & Medya', desc: 'Birden fazla doğru şıkkın olduğu soru' },
  { value: 'IMAGE_QUESTION', label: 'Görsel Soru', icon: '🖼️', category: 'Gelişmiş & Medya', desc: 'Resim veya şema odaklı analiz sorusu' },
  { value: 'AUDIO_QUESTION', label: 'Sesli Dinleme Sorusu', icon: '🎧', category: 'Gelişmiş & Medya', desc: 'Ses kaydı dinleyerek cevaplanan soru' },
  { value: 'VIDEO_QUESTION', label: 'Videolu Soru', icon: '🎬', category: 'Gelişmiş & Medya', desc: 'Video kesiti izlenerek cevaplanan soru' },
];

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

// Her soru türüne özel varsayılan seçenek ve yapı oluşturucu
function createDefaultOptionsForType(type: string): { options: any[]; allowMultiple: boolean; points: number; configJson?: any } {
  switch (type) {
    case 'TRUE_FALSE':
      return {
        options: [
          { text: 'Doğru', isCorrect: true, color: '#10b981' },
          { text: 'Yanlış', isCorrect: false, color: '#ef4444' },
        ],
        allowMultiple: false,
        points: 800,
      };

    case 'TYPE_ANSWER':
    case 'SHORT_ANSWER':
      return {
        options: [
          { text: 'Doğru Yanıt', isCorrect: true, color: '#3b82f6' },
        ],
        allowMultiple: false,
        points: 1000,
        configJson: { acceptedAlternatives: ['Alternatif 1', 'Alternatif 2'], caseSensitive: false },
      };

    case 'PUZZLE':
    case 'ORDERING':
      return {
        options: [
          { text: '1. Adım (Başlangıç)', isCorrect: true, orderIndex: 0, color: '#ef4444' },
          { text: '2. Adım (Gelişme)', isCorrect: true, orderIndex: 1, color: '#3b82f6' },
          { text: '3. Adım (Düğüm)', isCorrect: true, orderIndex: 2, color: '#f59e0b' },
          { text: '4. Adım (Sonuç)', isCorrect: true, orderIndex: 3, color: '#10b981' },
        ],
        allowMultiple: false,
        points: 1200,
      };

    case 'SLIDER':
      return {
        options: [
          { text: '50', isCorrect: true, color: '#3b82f6' },
        ],
        allowMultiple: false,
        points: 1000,
        configJson: { min: 0, max: 100, step: 1, correctValue: 50, tolerance: 0 },
      };

    case 'MATCHING':
      return {
        options: [
          { text: 'Kavram 1 (Sol)', matchTarget: 'Tanım 1 (Sağ)', isCorrect: true, color: '#ef4444' },
          { text: 'Kavram 2 (Sol)', matchTarget: 'Tanım 2 (Sağ)', isCorrect: true, color: '#3b82f6' },
          { text: 'Kavram 3 (Sol)', matchTarget: 'Tanım 3 (Sağ)', isCorrect: true, color: '#f59e0b' },
        ],
        allowMultiple: false,
        points: 1200,
      };

    case 'POLL':
      return {
        options: [
          { text: 'Katılıyorum', isCorrect: true, color: '#10b981' },
          { text: 'Kararsızım', isCorrect: true, color: '#f59e0b' },
          { text: 'Katılmıyorum', isCorrect: true, color: '#ef4444' },
        ],
        allowMultiple: false,
        points: 0,
      };

    case 'SCALE':
      return {
        options: [
          { text: '1 - Hiç Katılmıyorum', isCorrect: true, color: '#ef4444' },
          { text: '2 - Az Katılıyorum', isCorrect: true, color: '#f97316' },
          { text: '3 - Orta / Kararsız', isCorrect: true, color: '#f59e0b' },
          { text: '4 - Katılıyorum', isCorrect: true, color: '#3b82f6' },
          { text: '5 - Tamamen Katılıyorum', isCorrect: true, color: '#10b981' },
        ],
        allowMultiple: false,
        points: 0,
      };

    case 'NPS_SCALE':
      return {
        options: Array.from({ length: 11 }, (_, i) => ({
          text: String(i),
          isCorrect: true,
          color: i <= 6 ? '#ef4444' : i <= 8 ? '#f59e0b' : '#10b981',
        })),
        allowMultiple: false,
        points: 0,
      };

    case 'WORD_CLOUD':
    case 'OPEN_ENDED':
    case 'BRAINSTORM':
      return {
        options: [
          { text: 'Örnek Anahtar Kelime 1', isCorrect: true, color: '#3b82f6' },
          { text: 'Örnek Anahtar Kelime 2', isCorrect: true, color: '#10b981' },
        ],
        allowMultiple: false,
        points: 0,
      };

    case 'MULTIPLE_SELECT':
      return {
        options: [
          { text: 'Doğru Seçenek 1', isCorrect: true, color: '#ef4444' },
          { text: 'Doğru Seçenek 2', isCorrect: true, color: '#3b82f6' },
          { text: 'Çeldirici Seçenek 3', isCorrect: false, color: '#f59e0b' },
          { text: 'Çeldirici Seçenek 4', isCorrect: false, color: '#10b981' },
        ],
        allowMultiple: true,
        points: 1000,
      };

    case 'PIN_ANSWER':
    case 'DROP_PIN':
      return {
        options: [
          { text: 'Hedef Bölge', isCorrect: true, color: '#ef4444' },
        ],
        allowMultiple: false,
        points: 1000,
        configJson: { targetX: 50, targetY: 50, radius: 10 },
      };

    case 'MULTIPLE_CHOICE':
    case 'IMAGE_QUESTION':
    case 'AUDIO_QUESTION':
    case 'VIDEO_QUESTION':
    default:
      return {
        options: [
          { text: 'Seçenek 1', isCorrect: true, color: '#ef4444' },
          { text: 'Seçenek 2', isCorrect: false, color: '#3b82f6' },
          { text: 'Seçenek 3', isCorrect: false, color: '#f59e0b' },
          { text: 'Seçenek 4', isCorrect: false, color: '#10b981' },
        ],
        allowMultiple: false,
        points: 1000,
      };
  }
}

export default function CreatorPage() {
  const router = useRouter();
  const { playClick, playCorrect } = useSound();
  const { user } = useAuth();

  const [quizTitle, setQuizTitle] = useState('Yeni Özgün Bilgi Quizi');
  const [quizDesc, setQuizDesc] = useState('');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [isSaving, setIsSaving] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Soru Türü Seçme Modalı
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Excel Modal
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q1',
      type: 'MULTIPLE_CHOICE',
      title: 'Sorunuzu buraya yazınız...',
      explanation: 'Doğru cevabın pedagojik açıklaması...',
      timeLimit: 20,
      points: 1000,
      allowMultiple: false,
      difficulty: 'MEDIUM',
      options: [
        { text: 'Seçenek 1', isCorrect: true, color: '#ef4444' },
        { text: 'Seçenek 2', isCorrect: false, color: '#3b82f6' },
        { text: 'Seçenek 3', isCorrect: false, color: '#f59e0b' },
        { text: 'Seçenek 4', isCorrect: false, color: '#10b981' },
      ],
    },
  ]);

  const currentQ = questions[activeQuestionIdx] || questions[0];

  // Soru Ekleme (Seçilen Türe Göre)
  const handleAddNewQuestionOfType = (chosenType: string) => {
    playClick();
    const defaults = createDefaultOptionsForType(chosenType);
    const typeObj = ALL_QUESTION_TYPES.find((t) => t.value === chosenType);

    const newQ: QuestionDraft = {
      id: `q_${Date.now()}`,
      type: chosenType,
      title: `${typeObj?.label || 'Yeni Soru'} Başlığı`,
      explanation: '',
      timeLimit: chosenType === 'TRUE_FALSE' ? 15 : 20,
      points: defaults.points,
      allowMultiple: defaults.allowMultiple,
      difficulty: 'MEDIUM',
      options: defaults.options,
      configJson: defaults.configJson || null,
    };

    setQuestions([...questions, newQ]);
    setActiveQuestionIdx(questions.length);
    setTypeModalOpen(false);
    playCorrect();
  };

  // Mevcut Sorunun Türünü Değiştirme
  const handleChangeCurrentQuestionType = (newType: string) => {
    playClick();
    const defaults = createDefaultOptionsForType(newType);
    updateCurrentQuestion({
      type: newType,
      options: defaults.options,
      allowMultiple: defaults.allowMultiple,
      points: defaults.points,
      configJson: defaults.configJson || null,
    });
  };

  const handleDuplicateQuestion = (idx: number) => {
    playClick();
    const cloned = JSON.parse(JSON.stringify(questions[idx]));
    cloned.id = `q_${Date.now()}`;
    const next = [...questions];
    next.splice(idx + 1, 0, cloned);
    setQuestions(next);
    setActiveQuestionIdx(idx + 1);
  };

  const handleDeleteQuestion = (idx: number) => {
    playClick();
    if (questions.length <= 1) return;
    const next = questions.filter((_, i) => i !== idx);
    setQuestions(next);
    setActiveQuestionIdx(Math.max(0, idx - 1));
  };

  const updateCurrentQuestion = (fields: Partial<QuestionDraft>) => {
    const next = [...questions];
    next[activeQuestionIdx] = { ...next[activeQuestionIdx], ...fields };
    setQuestions(next);
  };

  const updateOptionText = (optIdx: number, text: string) => {
    const nextOpts = [...currentQ.options];
    nextOpts[optIdx].text = text;
    updateCurrentQuestion({ options: nextOpts });
  };

  const updateOptionMatchTarget = (optIdx: number, target: string) => {
    const nextOpts = [...currentQ.options];
    nextOpts[optIdx].matchTarget = target;
    updateCurrentQuestion({ options: nextOpts });
  };

  const toggleOptionCorrect = (optIdx: number) => {
    playClick();
    const nextOpts = [...currentQ.options];
    if (currentQ.allowMultiple) {
      nextOpts[optIdx].isCorrect = !nextOpts[optIdx].isCorrect;
    } else {
      nextOpts.forEach((o, i) => {
        o.isCorrect = i === optIdx;
      });
    }
    updateCurrentQuestion({ options: nextOpts });
  };

  const moveOrderingOption = (optIdx: number, direction: 'UP' | 'DOWN') => {
    playClick();
    const targetIdx = direction === 'UP' ? optIdx - 1 : optIdx + 1;
    if (targetIdx < 0 || targetIdx >= currentQ.options.length) return;

    const nextOpts = [...currentQ.options];
    const temp = nextOpts[optIdx];
    nextOpts[optIdx] = nextOpts[targetIdx];
    nextOpts[targetIdx] = temp;
    updateCurrentQuestion({ options: nextOpts });
  };

  const handleAddOption = () => {
    playClick();
    const newIdx = currentQ.options.length;
    const newOpt = {
      text: `Seçenek ${newIdx + 1}`,
      isCorrect: false,
      color: DEFAULT_COLORS[newIdx % DEFAULT_COLORS.length],
      matchTarget: `Eşleşme ${newIdx + 1}`,
      orderIndex: newIdx,
    };
    updateCurrentQuestion({ options: [...currentQ.options, newOpt] });
  };

  const handleRemoveOption = (optIdx: number) => {
    playClick();
    if (currentQ.options.length <= 2) return;
    const nextOpts = currentQ.options.filter((_, i) => i !== optIdx);
    updateCurrentQuestion({ options: nextOpts });
  };

  const handleSaveQuiz = async () => {
    playClick();
    setIsSaving(true);
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          description: quizDesc,
          gradeLevel,
          difficulty,
          questions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        playCorrect();
        alert('🎉 Quiz başarıyla kaydedildi ve yayınlandı!');
        router.push('/explore');
      } else {
        alert('Hata: ' + data.error);
      }
    } catch (err: any) {
      alert('Kayıt hatası: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    playClick();
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          gradeLevel,
          questionCount: 5,
        }),
      });
      const data = await res.json();
      if (data.success && data.result?.questions) {
        setQuestions([...questions, ...data.result.questions]);
        setAiModalOpen(false);
        playCorrect();
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleCsvImport = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const newQs: QuestionDraft[] = [];

    lines.forEach((line, i) => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        newQs.push({
          id: `csv_${Date.now()}_${i}`,
          type: 'MULTIPLE_CHOICE',
          title: parts[0]?.trim() || `Soru ${i + 1}`,
          explanation: '',
          timeLimit: 20,
          points: 1000,
          allowMultiple: false,
          difficulty: 'MEDIUM',
          options: [
            { text: parts[1]?.trim() || 'A', isCorrect: true, color: '#ef4444' },
            { text: parts[2]?.trim() || 'B', isCorrect: false, color: '#3b82f6' },
            { text: parts[3]?.trim() || 'C', isCorrect: false, color: '#f59e0b' },
            { text: parts[4]?.trim() || 'D', isCorrect: false, color: '#10b981' },
          ],
        });
      }
    });

    if (newQs.length > 0) {
      setQuestions([...questions, ...newQs]);
      setExcelModalOpen(false);
      playCorrect();
    }
  };

  const currentTypeInfo = ALL_QUESTION_TYPES.find((t) => t.value === currentQ.type) || ALL_QUESTION_TYPES[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#0b0f19]">
      {/* Top Header Controls */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white font-black text-lg px-3 py-1.5 rounded-xl w-full focus:outline-none focus:border-brand-500"
            placeholder="Quiz Başlığı..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            AI ile Soru Ekle
          </button>

          <button
            onClick={() => setExcelModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            CSV / Excel İçe Aktar
          </button>

          <button
            disabled={isSaving}
            onClick={handleSaveQuiz}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : 'Kaydet & Yayınla'}
          </button>
        </div>
      </header>

      {/* Editor Body: 3 Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Question list & Add */}
        <aside className="w-72 bg-slate-950/70 border-r border-slate-800 flex flex-col justify-between overflow-y-auto p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>SORULAR ({questions.length})</span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const qType = ALL_QUESTION_TYPES.find((t) => t.value === q.type);
                return (
                  <div
                    key={q.id || idx}
                    onClick={() => {
                      playClick();
                      setActiveQuestionIdx(idx);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between group ${
                      activeQuestionIdx === idx
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{q.title || `Soru ${idx + 1}`}</div>
                        <div className="text-[10px] text-brand-300 flex items-center gap-1">
                          <span>{qType?.icon || '🔘'}</span>
                          <span className="truncate">{qType?.label || q.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateQuestion(idx);
                        }}
                        title="Kopyala"
                        className="p-1 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {questions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(idx);
                          }}
                          title="Sil"
                          className="p-1 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Soru Türü Seçerek Yeni Soru Ekle Butonu */}
          <button
            onClick={() => {
              playClick();
              setTypeModalOpen(true);
            }}
            className="w-full py-3 rounded-xl border border-dashed border-brand-500/80 hover:border-brand-400 text-brand-300 hover:text-white text-xs font-black transition flex items-center justify-center gap-2 bg-brand-600/10 hover:bg-brand-600/20 shadow-md"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            Yeni Soru Türü Ekle (20 Tip)
          </button>
        </aside>

        {/* Center Panel: Question Editor Canvas */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start space-y-6">
          {/* Question Type Banner */}
          <div className="w-full max-w-3xl flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentTypeInfo.icon}</span>
              <div>
                <span className="font-bold text-white">{currentTypeInfo.label}</span>
                <span className="text-slate-400 ml-2">({currentTypeInfo.desc})</span>
              </div>
            </div>
            <button
              onClick={() => setTypeModalOpen(true)}
              className="text-xs text-brand-400 hover:text-brand-300 font-bold underline"
            >
              Türü Değiştir
            </button>
          </div>

          {/* Question Title Box */}
          <div className="w-full max-w-3xl">
            <textarea
              rows={3}
              value={currentQ.title}
              onChange={(e) => updateCurrentQuestion({ title: e.target.value })}
              placeholder="Sorunuzu buraya yazınız..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-lg font-bold text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-xl text-center resize-none"
            />
          </div>

          {/* Media preview/upload placeholder */}
          <div className="w-full max-w-3xl p-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-400">
            <ImageIcon className="w-5 h-5 text-slate-500" />
            <span>Medya Eklemek İster misiniz? (Görsel URL veya Video Linki)</span>
            <input
              type="text"
              placeholder="Görsel / Video URL (Opsiyonel)"
              value={currentQ.mediaUrl || ''}
              onChange={(e) => updateCurrentQuestion({ mediaUrl: e.target.value })}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs w-64 focus:outline-none"
            />
          </div>

          {/* DİNAMİK SEÇENEK EDİTÖRÜ - SEÇİLEN SORU TÜRÜNE GÖRE ÖZELLEŞMİŞ */}
          <div className="w-full max-w-3xl">
            {/* 1. DOĞRU / YANLIŞ GÖRÜNÜMÜ */}
            {currentQ.type === 'TRUE_FALSE' && (
              <div className="grid grid-cols-2 gap-4">
                {currentQ.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    onClick={() => toggleOptionCorrect(optIdx)}
                    className={`p-8 rounded-3xl border-2 cursor-pointer transition flex flex-col items-center justify-center gap-3 text-center shadow-2xl ${
                      opt.isCorrect
                        ? optIdx === 0
                          ? 'bg-emerald-600/30 border-emerald-500 text-white'
                          : 'bg-rose-600/30 border-rose-500 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-4xl">{optIdx === 0 ? '✓' : '✗'}</span>
                    <span className="text-2xl font-black">{opt.text}</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800/80">
                      {opt.isCorrect ? '✅ Doğru Cevap Olarak İşaretli' : 'Tıkla ve Doğru Yap'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 2. METİN YANITI (TYPE_ANSWER / SHORT_ANSWER) */}
            {(currentQ.type === 'TYPE_ANSWER' || currentQ.type === 'SHORT_ANSWER') && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Kabul Edilen Doğru Yanıt
                </div>
                <input
                  type="text"
                  value={currentQ.options[0]?.text || ''}
                  onChange={(e) => updateOptionText(0, e.target.value)}
                  placeholder="Örn: Ahmet Mithat Efendi"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-base font-bold rounded-2xl p-4 focus:outline-none focus:border-brand-500 shadow-inner"
                />
                <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300">
                  💡 Öğrenci bu yanıtı veya kabul edilen varyantları yazdığında sistem otomatik olarak doğru kabul eder (Büyük/küçük harf toleranslı).
                </div>
              </div>
            )}

            {/* 3. PUZZLE / SIRALAMA (ORDERING) */}
            {(currentQ.type === 'PUZZLE' || currentQ.type === 'ORDERING') && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Doğru Sıralamayı Belirleyin (Öğrencilere Karışık Olarak Gösterilir)
                  </span>
                  <button
                    onClick={handleAddOption}
                    className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adım Ekle
                  </button>
                </div>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg"
                    >
                      <span className="w-7 h-7 rounded-xl bg-brand-600/30 text-brand-300 font-black text-sm flex items-center justify-center shrink-0">
                        {optIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOptionText(optIdx, e.target.value)}
                        placeholder={`Adım ${optIdx + 1}`}
                        className="flex-1 bg-transparent text-white font-bold text-sm focus:outline-none"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          disabled={optIdx === 0}
                          onClick={() => moveOrderingOption(optIdx, 'UP')}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
                          title="Yukarı Taşı"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={optIdx === currentQ.options.length - 1}
                          onClick={() => moveOrderingOption(optIdx, 'DOWN')}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
                          title="Aşağı Taşı"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        {currentQ.options.length > 2 && (
                          <button
                            onClick={() => handleRemoveOption(optIdx)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SAYI CETVELİ (SLIDER) */}
            {currentQ.type === 'SLIDER' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Sayı Cetveli Parametreleri
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Minimum Değer</label>
                    <input
                      type="number"
                      value={currentQ.configJson?.min ?? 0}
                      onChange={(e) => {
                        const nextCfg = { ...currentQ.configJson, min: parseInt(e.target.value, 10) || 0 };
                        updateCurrentQuestion({ configJson: nextCfg });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Maksimum Değer</label>
                    <input
                      type="number"
                      value={currentQ.configJson?.max ?? 100}
                      onChange={(e) => {
                        const nextCfg = { ...currentQ.configJson, max: parseInt(e.target.value, 10) || 100 };
                        updateCurrentQuestion({ configJson: nextCfg });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1 font-bold">Doğru Hedef Değer</label>
                    <input
                      type="number"
                      value={currentQ.configJson?.correctValue ?? 50}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const nextCfg = { ...currentQ.configJson, correctValue: val };
                        updateCurrentQuestion({
                          configJson: nextCfg,
                          options: [{ text: String(val), isCorrect: true, color: '#10b981' }],
                        });
                      }}
                      className="w-full bg-emerald-950/40 border border-emerald-500 rounded-xl p-2.5 text-emerald-300 text-center font-black"
                    />
                  </div>
                </div>

                {/* Slider Önizleme */}
                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>{currentQ.configJson?.min ?? 0}</span>
                    <span className="text-emerald-400 font-bold">Doğru: {currentQ.configJson?.correctValue ?? 50}</span>
                    <span>{currentQ.configJson?.max ?? 100}</span>
                  </div>
                  <input
                    type="range"
                    min={currentQ.configJson?.min ?? 0}
                    max={currentQ.configJson?.max ?? 100}
                    value={currentQ.configJson?.correctValue ?? 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const nextCfg = { ...currentQ.configJson, correctValue: val };
                      updateCurrentQuestion({
                        configJson: nextCfg,
                        options: [{ text: String(val), isCorrect: true, color: '#10b981' }],
                      });
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 5. EŞLEŞTİRME (MATCHING) */}
            {currentQ.type === 'MATCHING' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Eşleşen Çiftler (Sol Öğe ve Karşılığı)
                  </span>
                  <button
                    onClick={handleAddOption}
                    className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Çift Ekle
                  </button>
                </div>

                <div className="space-y-3">
                  {currentQ.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 border border-slate-700"
                    >
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOptionText(optIdx, e.target.value)}
                        placeholder="Sol Kavram (Örn: Tanzimat)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                      />
                      <span className="text-brand-400 font-bold">⟷</span>
                      <input
                        type="text"
                        value={opt.matchTarget || ''}
                        onChange={(e) => updateOptionMatchTarget(optIdx, e.target.value)}
                        placeholder="Sağ Eşleşme (Örn: Şinasi)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs"
                      />
                      {currentQ.options.length > 2 && (
                        <button
                          onClick={() => handleRemoveOption(optIdx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ANKET, ÖLÇEK, NPS, KELİME BULUTU, AÇIK UÇLU */}
            {['POLL', 'SCALE', 'NPS_SCALE', 'WORD_CLOUD', 'OPEN_ENDED', 'BRAINSTORM'].includes(currentQ.type) && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-brand-400 uppercase">
                    Etkileşim & Oylama Seçenekleri (Puan: 0)
                  </div>
                  <button
                    onClick={handleAddOption}
                    className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Seçenek Ekle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 border border-slate-700"
                    >
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOptionText(optIdx, e.target.value)}
                        placeholder={`Seçenek ${optIdx + 1}`}
                        className="flex-1 bg-transparent text-white font-bold text-xs focus:outline-none"
                      />
                      {currentQ.options.length > 2 && (
                        <button
                          onClick={() => handleRemoveOption(optIdx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-xs text-purple-300">
                  📊 Bu soru etkileşim odaklıdır. Öğrencilerden fikir, katılım veya memnuniyet puanı toplanır.
                </div>
              </div>
            )}

            {/* 7. ÇOKTAN SEÇMELİ, ÇOKLU SEÇİM, GÖRSEL, SESLİ, VİDEOLU SORULAR */}
            {['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'IMAGE_QUESTION', 'AUDIO_QUESTION', 'VIDEO_QUESTION', 'PIN_ANSWER', 'DROP_PIN'].includes(currentQ.type) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-400">
                    {currentQ.allowMultiple
                      ? 'Çoklu Seçim (Birden fazla doğru şıkkı işaretleyebilirsiniz)'
                      : 'Şıkları Yazın ve Doğru Cevabı (✓) İşaretleyin'}
                  </span>
                  <button
                    onClick={handleAddOption}
                    className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Şık Ekle
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQ.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className="relative rounded-2xl p-4 transition border shadow-lg flex items-center justify-between"
                      style={{
                        backgroundColor: `${DEFAULT_COLORS[optIdx % DEFAULT_COLORS.length]}15`,
                        borderColor: opt.isCorrect ? DEFAULT_COLORS[optIdx % DEFAULT_COLORS.length] : '#334155',
                      }}
                    >
                      <div className="flex-1 mr-3">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(optIdx, e.target.value)}
                          placeholder={`Seçenek ${optIdx + 1}`}
                          className="w-full bg-transparent text-white font-bold text-sm focus:outline-none placeholder-slate-500"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleOptionCorrect(optIdx)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition ${
                            opt.isCorrect
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'border-slate-600 text-slate-500 hover:border-slate-400'
                          }`}
                          title={opt.isCorrect ? 'Doğru Cevap' : 'Doğru Olarak İşaretle'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        {currentQ.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Şıkkı Kaldır"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explanation Box */}
          <div className="w-full max-w-3xl bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Doğru Cevap Açıklaması (Öğrenciye gösterilecek pedagojik çözüm)
            </label>
            <input
              type="text"
              value={currentQ.explanation || ''}
              onChange={(e) => updateCurrentQuestion({ explanation: e.target.value })}
              placeholder="Örn: Bu kurala göre durum hikâyelerinde kesit esastır..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </main>

        {/* Right Panel: Settings (Time, Points, Type, Difficulty) */}
        <aside className="w-80 bg-slate-950/70 border-l border-slate-800 p-6 space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Soru Ayarları
            </h3>

            {/* Soru Türü Değiştirici */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-300">Soru Türü</label>
              <select
                value={currentQ.type}
                onChange={(e) => handleChangeCurrentQuestionType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                {ALL_QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Limit */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Süre Sınırı
              </label>
              <select
                value={currentQ.timeLimit}
                onChange={(e) => updateCurrentQuestion({ timeLimit: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="10">10 Saniye (Hızlı)</option>
                <option value="15">15 Saniye</option>
                <option value="20">20 Saniye (Standart)</option>
                <option value="30">30 Saniye</option>
                <option value="60">60 Saniye (Detaylı Soru)</option>
                <option value="120">2 Dakika</option>
              </select>
            </div>

            {/* Points */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Temel Puan
              </label>
              <select
                value={currentQ.points}
                onChange={(e) => updateCurrentQuestion({ points: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="0">0 Puan (Anket / Görüş)</option>
                <option value="500">500 Puan</option>
                <option value="800">800 Puan</option>
                <option value="1000">1000 Puan (Standart)</option>
                <option value="1200">1200 Puan</option>
                <option value="2000">2000 Puan (Çift Puan)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-300">Zorluk Seviyesi</label>
              <select
                value={currentQ.difficulty}
                onChange={(e) => updateCurrentQuestion({ difficulty: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="EASY">Kolay</option>
                <option value="MEDIUM">Orta</option>
                <option value="HARD">Zor (ÖSYM / YKS Düzeyi)</option>
              </select>
            </div>

            {/* Allow Multiple Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={currentQ.allowMultiple}
                  onChange={(e) => updateCurrentQuestion({ allowMultiple: e.target.checked })}
                  className="rounded border-slate-700 text-brand-600 focus:ring-0"
                />
                <span>Birden fazla doğru cevap seçilebilsin</span>
              </label>
            </div>
          </div>
        </aside>
      </div>

      {/* 20 SORU TÜRÜ SEÇİM MODALI */}
      {typeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-black text-white text-xl flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-400" />
                  Soru Türü Seçiniz (20 Tür)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Eklemek istediğiniz soru formatını seçin, editör ve seçenekler otomatik hazırlanacaktır.
                </p>
              </div>
              <button
                onClick={() => setTypeModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Kategori Başlığı Altında Türler */}
            {['Bilgi Testi', 'Görüş & Etkileşim', 'Gelişmiş & Medya'].map((cat) => (
              <div key={cat} className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-400 px-1">
                  {cat}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_QUESTION_TYPES.filter((t) => t.category === cat).map((typeItem) => (
                    <button
                      key={typeItem.value}
                      onClick={() => handleAddNewQuestionOfType(typeItem.value)}
                      className="p-4 rounded-2xl bg-slate-850 hover:bg-brand-600/20 border border-slate-750 hover:border-brand-500 text-left transition flex items-start gap-3 group shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-110 transition transform shrink-0">
                        {typeItem.icon}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-xs group-hover:text-brand-300">
                          {typeItem.label}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-tight">
                          {typeItem.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              AI ile Quize Soru Ekle
            </h3>
            <p className="text-xs text-slate-400">
              Konu veya metin girin, yapay zekâ quizinize 5 yeni soru eklesin.
            </p>
            <input
              type="text"
              placeholder="Örn: Hikâyenin anlatıcı bakış açıları..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"
              >
                İptal
              </button>
              <button
                disabled={aiLoading || !aiTopic.trim()}
                onClick={handleAiGenerate}
                className="px-4 py-1.5 text-xs rounded-lg bg-brand-600 text-white font-bold disabled:opacity-50 flex items-center gap-1.5"
              >
                {aiLoading ? 'Üretiliyor...' : 'Soruları Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel / CSV Modal */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              CSV / Excel Soruları Yapıştır
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Her satır: <code>Soru, DoğruSeçenek, Yanlış1, Yanlış2, Yanlış3</code> formatında olmalıdır.
            </p>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Ahmet Mithat hangi eseri yazdı?,Letaif-i Rivayat,Taaşşuk-ı Talat,Araba Sevdası,Cezmi"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setExcelModalOpen(false)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"
              >
                İptal
              </button>
              <button
                onClick={handleCsvImport}
                className="px-4 py-1.5 text-xs rounded-lg bg-emerald-600 text-white font-bold"
              >
                İçe Aktar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
