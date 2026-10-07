'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Layers,
  Sparkles,
  RotateCw,
  Check,
  X,
  BrainCircuit,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function StudyPage() {
  const { playClick, playCorrect, playFanfare } = useSound();

  const [activeTab, setActiveTab] = useState<'FLASHCARDS' | 'LEARN' | 'TEST'>('FLASHCARDS');
  const [sets, setSets] = useState<any[]>([]);
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI Flashcards Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/flashcards')
      .then((res) => res.json())
      .then((data) => {
        setSets(data.flashcardSets || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeSet = sets[activeSetIdx];
  const activeCards = activeSet?.cards || [];
  const currentCard = activeCards[currentCardIdx];

  const handleFlip = () => {
    playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = (mastered = false) => {
    if (mastered) playCorrect();
    else playClick();

    setIsFlipped(false);
    if (currentCardIdx + 1 < activeCards.length) {
      setCurrentCardIdx((prev) => prev + 1);
    } else {
      playFanfare();
      alert('🎉 Tebrikler! Tüm kartları tamamladınız.');
      setCurrentCardIdx(0);
    }
  };

  const handleAiCreateCards = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    playClick();
    try {
      const res = await fetch('/api/ai/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FLASHCARDS',
          topic: aiTopic,
        }),
      });
      const data = await res.json();
      if (data.success && data.flashcards) {
        // Save set
        const saveRes = await fetch('/api/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${aiTopic} Flashcards`,
            cards: data.flashcards.map((f: any) => ({
              frontText: f.front,
              backText: f.back,
            })),
          }),
        });
        const savedData = await saveRes.json();
        if (savedData.set) {
          setSets([savedData.set, ...sets]);
          setActiveSetIdx(0);
          setCurrentCardIdx(0);
          setAiModalOpen(false);
          playCorrect();
        }
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-brand-400" />
            Bireysel Çalışma & Flashcards
          </h1>
          <p className="text-sm text-slate-400">
            Aralıklı tekrar (Spaced Repetition), ezber kartları ve sınav simülasyonu
          </p>
        </div>

        <button
          onClick={() => { playClick(); setAiModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold transition flex items-center gap-2"
        >
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          AI ile Kart Seti Üret
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => { playClick(); setActiveTab('FLASHCARDS'); }}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'FLASHCARDS' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🃏 Bilgi Kartları (Flashcards)
        </button>
        <button
          onClick={() => { playClick(); setActiveTab('LEARN'); }}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'LEARN' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🧠 Learn Mode (Akıllı Tekrar)
        </button>
        <button
          onClick={() => { playClick(); setActiveTab('TEST'); }}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'TEST' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          📝 Test Mode (Sınav Simülatörü)
        </button>
      </div>

      {/* Content */}
      {activeTab === 'FLASHCARDS' && (
        <div className="space-y-6">
          {/* Set Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sets.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => {
                  playClick();
                  setActiveSetIdx(idx);
                  setCurrentCardIdx(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition ${
                  activeSetIdx === idx
                    ? 'bg-slate-800 border-brand-500 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s.title} ({s.cards?.length || 0})
              </button>
            ))}
          </div>

          {/* Flashcard 3D Interactive Card */}
          {currentCard ? (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center text-xs text-slate-400 font-semibold">
                Kart {currentCardIdx + 1} / {activeCards.length}
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={handleFlip}
                className="w-full h-80 rounded-3xl bg-slate-900 border-2 border-slate-700/80 hover:border-brand-500/80 shadow-2xl p-8 flex flex-col justify-between items-center text-center cursor-pointer transition-all transform hover:scale-[1.02] select-none"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isFlipped ? 'CEVAP / AÇIKLAMA' : 'KAVRAM / SORU (Çevirmek için dokun)'}
                </div>

                <div className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                  {isFlipped ? currentCard.backText : currentCard.frontText}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Çevir</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleNextCard(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs border border-slate-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Tekrar Etmeliyim
                </button>
                <button
                  onClick={() => handleNextCard(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Öğrendim! (+15 XP)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-sm">
              Kayıtlı çalışma kartı seti bulunamadı. Yapay zekâ ile anında bir set üretebilirsiniz!
            </div>
          )}
        </div>
      )}

      {activeTab === 'LEARN' && (
        <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Aralıklı Tekrar Algoritması (Learn Mode)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            EduPulse Spaced-Repetition motoru, daha önce yanlış yaptığınız veya zorlandığınız soruları analiz ederek çalışma programınızı kişiselleştirir.
          </p>
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300">
            📊 Son aktiviteleriniz incelendi: <strong>Türk Dili ve Edebiyatı (Hikâye Bakış Açıları)</strong> konusunda 3 soruluk tekrar seansı hazırlandı.
          </div>
          <button
            onClick={() => { playCorrect(); alert('Akıllı seans başlatıldı!'); }}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Özel Tekrar Seansını Başlat
          </button>
        </div>
      )}

      {activeTab === 'TEST' && (
        <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Sınav Simülatörü (Test Mode)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Süre sınırlamalı, anlık sonuçsuz, gerçek sınav atmosferinde kendinizi deneyin. Sınav bittiğinde ayrıntılı başarı karneniz ve konu bazlı eksikleriniz raporlanır.
          </p>
          <button
            onClick={() => { playClick(); alert('20 Soruluk Deneme Sınavı Hazırlanıyor...'); }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Deneme Sınavını Başlat (20 Soru • 30 Dk)
          </button>
        </div>
      )}

      {/* AI Generate Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              AI ile Flashcard Seti Üret
            </h3>
            <p className="text-xs text-slate-400">
              Ders konusunu yazın, yapay zekâ sizin için ön-arka yüzlü bilgi kartları hazırlasın.
            </p>
            <input
              type="text"
              placeholder="Örn: Edebiyat Akımları ve Temsilcileri..."
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
                onClick={handleAiCreateCards}
                className="px-4 py-1.5 text-xs rounded-lg bg-brand-600 text-white font-bold disabled:opacity-50"
              >
                {aiLoading ? 'Üretiliyor...' : 'Kartları Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
