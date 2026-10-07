'use client';

import React, { useState } from 'react';
import { Crown, Check, Zap, Sparkles, Shield, Building2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSound } from '@/components/SoundProvider';

export default function PremiumPage() {
  const { user, refreshUser } = useAuth();
  const { playClick, playFanfare } = useSound();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    playClick();
    setUpgrading(planKey);

    try {
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.success) {
        playFanfare();
        alert(`🎉 Tebrikler! ${planKey} planınız başarıyla etkinleştirildi.`);
        await refreshUser();
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert('İşlem başarısız: ' + err.message);
    } finally {
      setUpgrading(null);
    }
  };

  const PLANS = [
    {
      key: 'FREE',
      name: 'Ücretsiz Başlangıç',
      price: '₺0',
      period: 'ömür boyu',
      desc: 'Bireysel öğrenciler ve basit quizler için',
      features: [
        'Canlı oyunda 20 katılımcı limiti',
        'Temel 4 soru tipi',
        'Günde 5 AI soru üretimi',
        'Klasik solo ve flashcards',
        'Topluluk quizlerine erişim',
      ],
      btnText: 'Mevcut Plan',
      isPopular: false,
    },
    {
      key: 'PRO',
      name: 'Öğretmen PRO',
      price: '₺99',
      period: '/ ay',
      desc: 'Aktif ders anlatan ve ödev veren öğretmenler için',
      features: [
        'Canlı oyunda 100 katılımcı limiti',
        '20 farklı soru tipinin tamamı',
        'Sınırsız AI ile soru & story üretimi',
        'PDF, Excel ve CSV aktarım & indirme',
        'Özel sınıf temaları ve sesler',
        'Ayrıntılı kazanım ve öğrenci analitiği',
      ],
      btnText: 'PRO\'ya Yükselt',
      isPopular: true,
    },
    {
      key: 'SCHOOL',
      name: 'Okul & Zümre',
      price: '₺499',
      period: '/ ay',
      desc: 'Okullar, dershaneler ve zümre öğretmenleri için',
      features: [
        'Canlı oyunda 500 katılımcı limiti',
        'Ortak Öğretmen Çalışma Alanı (Workspace)',
        'Okul içi ortak soru bankası ve arşiv',
        'Sınıf ve şube karşılaştırmalı karne',
        'Okul logosu ve kurumsal renkler',
        'Öncelikli öğretmen teknik desteği',
      ],
      btnText: 'Okul Planına Geç',
      isPopular: false,
    },
    {
      key: 'ENTERPRISE',
      name: 'Kurumsal & İlçe MEM',
      price: '₺1,499',
      period: '/ ay',
      desc: 'Büyük eğitim kurumları ve zincir okullar için',
      features: [
        'Sınırsız eş zamanlı katılımcı',
        'MEB e-Okul / LMS entegrasyon API',
        'Özel bulut sunucu & 99.9% uptime SLA',
        'Tüm öğretmenlere sınırsız AI ve depolama',
        'Özel eğitim koçu ve hesap yöneticisi',
      ],
      btnText: 'Kurumsal İletişim',
      isPopular: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold">
          <Crown className="w-3.5 h-3.5" /> EduPulse Premium Üyelik
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Sınıfınızı ve Eğitiminizi{' '}
          <span className="bg-gradient-to-r from-amber-400 to-brand-400 bg-clip-text text-transparent">
            Zirveye Taşıyın
          </span>
        </h1>
        <p className="text-sm text-slate-300">
          Daha yüksek katılımcı limitleri, sınırsız yapay zekâ, Excel aktarımı ve ayrıntılı kazanım analizleriyle derslerinizi dönüştürün.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.key;
          return (
            <div
              key={plan.key}
              className={`rounded-3xl p-6 flex flex-col justify-between border transition relative shadow-2xl ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-slate-900 to-brand-950/40 border-brand-500 ring-2 ring-brand-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-[10px] font-black uppercase text-white tracking-widest shadow">
                  EN ÇOK TERCİH EDİLEN
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-white text-lg">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  disabled={isCurrent || upgrading === plan.key}
                  onClick={() => handleSubscribe(plan.key)}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                      : plan.isPopular
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrent ? 'Aktif Planınız' : upgrading === plan.key ? 'Etkinleştiriliyor...' : plan.btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
