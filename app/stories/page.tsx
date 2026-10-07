'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BrainCircuit,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';

export default function StoriesPage() {
  const { playClick, playCorrect, playFanfare } = useSound();
  const [stories, setStories] = useState<any[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // AI Story Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/stories')
      .then((res) => res.json())
      .then((data) => setStories(data.stories || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeStory = stories[activeStoryIdx];
  const blocks = activeStory?.blocks || [];
  const currentBlock = blocks[currentBlockIdx];

  const handleNextBlock = () => {
    playClick();
    if (currentBlockIdx + 1 < blocks.length) {
      setCurrentBlockIdx((prev) => prev + 1);
    } else {
      playFanfare();
      alert('🎉 Harika! Bu microlearning hikâyesini tamamladınız (+50 XP)');
      setCurrentBlockIdx(0);
    }
  };

  const handlePrevBlock = () => {
    playClick();
    if (currentBlockIdx > 0) {
      setCurrentBlockIdx((prev) => prev - 1);
    }
  };

  const handleAiCreateStory = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    playClick();
    try {
      const res = await fetch('/api/ai/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STORY', topic: aiTopic }),
      });
      const data = await res.json();
      if (data.success && data.storyBlocks) {
        const saveRes = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `3 Dakikada ${aiTopic}`,
            blocks: data.storyBlocks,
          }),
        });
        const savedData = await saveRes.json();
        if (savedData.story) {
          setStories([savedData.story, ...stories]);
          setActiveStoryIdx(0);
          setCurrentBlockIdx(0);
          setAiModalOpen(false);
          playCorrect();
        }
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-pink-400" />
            Microlearning Stories (Mikro Öğrenme)
          </h1>
          <p className="text-sm text-slate-400">
            Mobil öncelikli, 1 dakikalık hap bilgiler ve hızlı etkileşim hikâyeleri
          </p>
        </div>

        <button
          onClick={() => { playClick(); setAiModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-pink-600/20 text-pink-300 border border-pink-500/30 hover:bg-pink-600/30 text-xs font-bold transition flex items-center gap-2"
        >
          <BrainCircuit className="w-4 h-4 text-pink-400" />
          AI ile Story Üret
        </button>
      </div>

      {/* Story Selectors */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {stories.map((st, idx) => (
          <button
            key={st.id || idx}
            onClick={() => {
              playClick();
              setActiveStoryIdx(idx);
              setCurrentBlockIdx(0);
            }}
            className={`p-3 rounded-2xl border text-left shrink-0 w-44 transition ${
              activeStoryIdx === idx
                ? 'bg-slate-800 border-pink-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-[10px] font-bold text-pink-400 uppercase">Hikâye #{idx + 1}</div>
            <div className="text-xs font-bold truncate mt-1">{st.title}</div>
            <div className="text-[10px] text-slate-500 mt-1">{st.blocks?.length || 0} Segment</div>
          </button>
        ))}
      </div>

      {/* Mobile-First Phone Frame Container */}
      {currentBlock ? (
        <div className="max-w-sm mx-auto w-full aspect-[9/16] bg-slate-900 border-4 border-slate-700 rounded-[2.5rem] shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Top Progress Segment Bars */}
          <div className="flex gap-1.5 pt-2">
            {blocks.map((_: any, bIdx: number) => (
              <div key={bIdx} className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-pink-500 transition-all duration-300 ${
                    bIdx <= currentBlockIdx ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Story Card Content */}
          <div className="my-auto space-y-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {currentBlock.type}
            </span>

            <h2 className="text-2xl font-black text-white leading-snug">
              {currentBlock.title || 'Mikro Ders'}
            </h2>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-sm text-slate-200 leading-relaxed shadow-lg">
              {currentBlock.content}
            </div>

            {currentBlock.type === 'QUIZ' && (
              <div className="p-4 bg-pink-950/40 border border-pink-800/40 rounded-2xl text-xs text-pink-300 space-y-2">
                <div className="font-bold">Hızlı Kontrol Sorusu:</div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => { playCorrect(); alert('Doğru cevap! 🎉'); }}
                    className="w-full py-2 bg-slate-800 hover:bg-emerald-600 rounded-xl font-bold transition text-xs"
                  >
                    A) İlahi (Hâkim) Anlatıcı
                  </button>
                  <button
                    onClick={() => { playClick(); alert('Tekrar dene!'); }}
                    className="w-full py-2 bg-slate-800 hover:bg-rose-600 rounded-xl font-bold transition text-xs"
                  >
                    B) Kahraman Anlatıcı
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pb-2">
            <button
              onClick={handlePrevBlock}
              disabled={currentBlockIdx === 0}
              className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-[10px] text-slate-500 font-bold">
              {currentBlockIdx + 1} / {blocks.length}
            </div>
            <button
              onClick={handleNextBlock}
              className="p-3 rounded-full bg-pink-600 text-white shadow-lg shadow-pink-600/40 hover:bg-pink-500"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">Hikâye bulunamadı.</div>
      )}

      {/* AI Story Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-pink-400" />
              AI ile Microlearning Story Üret
            </h3>
            <p className="text-xs text-slate-400">
              Konu girin, yapay zekâ 1 dakikalık hap bilgi hikâyesi oluştursun.
            </p>
            <input
              type="text"
              placeholder="Örn: Newton Hareket Yasaları veya Cümle Türleri..."
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
                onClick={handleAiCreateStory}
                className="px-4 py-1.5 text-xs rounded-lg bg-pink-600 text-white font-bold disabled:opacity-50"
              >
                {aiLoading ? 'Üretiliyor...' : 'Hikâye Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
