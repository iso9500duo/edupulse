'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Crown,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSound } from '@/components/SoundProvider';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { playClick, playFanfare } = useSound();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketplace')
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (itemId: string) => {
    playClick();
    setBuyingId(itemId);
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BUY', itemId }),
      });
      const data = await res.json();
      if (data.success) {
        playFanfare();
        alert('🎉 ' + data.message);
        // Refresh items
        const r = await fetch('/api/marketplace');
        const d = await r.json();
        setItems(d.items || []);
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert('İşlem hatası: ' + err.message);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-pink-400" />
            İçerik Pazaryeri & Soru Paketleri
          </h1>
          <p className="text-sm text-slate-400">
            Uzman öğretmenler tarafından hazırlanan doğrulanmış premium quiz ve ders paketleri
          </p>
        </div>

        {user?.role === 'TEACHER' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Toplam Geliriniz: <strong className="text-white">₺420.00</strong></span>
          </div>
        )}
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
          Pazaryerinde henüz ürün bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition p-6 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                    {item.quiz?.subject?.name || 'Müfredat Paketi'}
                  </span>
                  <div className="text-base font-black text-emerald-400">₺{item.price.toFixed(2)}</div>
                </div>

                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="text-[11px] text-slate-500">
                  Satıcı: <strong className="text-slate-300">{item.creator?.name}</strong> • {item.salesCount} Satış
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  disabled={buyingId === item.id}
                  onClick={() => handleBuy(item.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {buyingId === item.id ? 'Satın Alınıyor...' : 'Satın Al & Kütüphaneye Ekle'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
