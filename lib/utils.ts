import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePin(length = 6): string {
  const digits = '0123456789';
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return pin;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getDifficultyColor(diff: string) {
  switch (diff?.toUpperCase()) {
    case 'EASY':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'HARD':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    default:
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }
}

export function getQuestionTypeLabel(type: string) {
  const map: Record<string, string> = {
    MULTIPLE_CHOICE: 'Çoktan Seçmeli (Quiz)',
    TRUE_FALSE: 'Doğru / Yanlış',
    TYPE_ANSWER: 'Metin Yanıtı',
    PUZZLE: 'Sıralama / Puzzle',
    SLIDER: 'Sayı Cetveli (Slider)',
    PIN_ANSWER: 'Nokta İşaretleme',
    DROP_PIN: 'Görsel Üzeri Pin',
    POLL: 'Anket / Oylama',
    SCALE: 'Derecelendirme Ölçeği',
    NPS_SCALE: 'NPS Memnuniyet',
    WORD_CLOUD: 'Kelime Bulutu',
    OPEN_ENDED: 'Açık Uçlu',
    BRAINSTORM: 'Beyin Fırtınası',
    IMAGE_QUESTION: 'Görsel Soru',
    AUDIO_QUESTION: 'Sesli Soru',
    VIDEO_QUESTION: 'Videolu Soru',
    MATCHING: 'Eşleştirme',
    ORDERING: 'Adım Sıralama',
    SHORT_ANSWER: 'Kısa Cevap',
    MULTIPLE_SELECT: 'Çoklu Seçim',
  };
  return map[type] || type;
}
