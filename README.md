# ⚡ EduPulse — Yeni Nesil Gerçek Zamanlı Eğitim & Canlı Yarışma Platformu

EduPulse; modern, ölçeklenebilir, mobil uyumlu ve gerçek zamanlı çalışan kapsamlı bir eğitim ve bilgi yarışması platformudur. 

Canlı sınıf yarışmaları, tek başına solo modlar, MEB müfredatına tam uyumlu soru bankası, AI destekli quiz ve story üretimi, kurslar, ödevler, ayrıntılı raporlama, oyunlaştırma ve premium üyelik altyapısını tek bir çatı altında sunar.

---

## 🚀 Öne Çıkan Özellikler

1. **Gerçek Zamanlı Canlı Oyun Motoru (WebSocket / Socket.io)**:
   - Benzersiz 6 haneli PIN ve QR kod ile katılım
   - Canlı lobi, anlık oyuncu senkronizasyonu
   - Süre bazlı hız bonusu ve seri (streak) bonus çarpanları
   - Lider tablosu ve finalde 1., 2. ve 3. için interaktif Podyum kutlaması
   - Web Audio API tabanlı gecikmesiz ses efektleri (Doğru, Yanlış, Sayaç, Fanfare)
   - Öğrencilerin ekrandan fırlattığı gerçek zamanlı yüzen tepki emojileri (❤️, 🔥, 🎉, 👏, 🧠)

2. **20 İnteraktif Soru Türü Desteği**:
   - Çoktan Seçmeli (Quiz), Doğru/Yanlış, Metin Yanıtı, Sıralama / Puzzle
   - Sayı Cetveli (Slider), Nokta İşaretleme (Pin), Anket / Oylama (Poll)
   - NPS Ölçeği, Kelime Bulutu (Word Cloud), Açık Uçlu, Beyin Fırtınası
   - Görselli Soru, Sesli Soru, Videolu Soru, Eşleştirme, Çoklu Seçim vb.

3. **Yapay Zekâ (AI) Quiz & İçerik Üreticisi**:
   - Google Gemini ve OpenAI API soyutlama katmanı
   - API anahtarı girilmediğinde bile çalışan akıllı MEB müfredat motoru
   - Konudan, metinden ve ders başlığından saniyeler içinde quiz üretimi
   - Soru zorlaştırma, kolaylaştırma ve çeldirici iyileştirme araçları
   - Flashcard ve microlearning story üretimi

4. **Kişisel Çalışma & Solo Modları**:
   - **Classic Solo**: Zaman kısıtlamalı bireysel test
   - **Chill Mode**: Sakin, süresiz rahat çalışma modu
   - **Treasure Mode**: Doğru cevaplarla sandık ve elmas açma
   - **Tower Mode**: Her doğru cevapta gökdelen katı inşa etme
   - **Flashcards**: 3D çevrilebilir hafıza kartları
   - **Learn Mode**: Aralıklı tekrar (Spaced Repetition) algoritması
   - **Test Mode**: Süreli sınav simülatörü

5. **Kurs & Microlearning Story Sistemi**:
   - Bölümler, video/metin dersleri ve ara quizlerle modüler kurslar
   - Mobil öncelikli, Instagram/TikTok story tarzı mikro öğrenme kartları

6. **Sınıf Yönetimi & Zaman Ayarlı Ödevler**:
   - Sınıf oluşturma (9/A, 10/B vb.) ve sınıf kodu (`CLS-10A`) ile öğrenci kaydı
   - Son teslim tarihli (deadline), misafir veya kayıtlı öğrenci ödevleri
   - Kazanılan puanların öğrenci profiline ve XP sistemine işlenmesi

7. **Soru Bankası & Excel / CSV Toplu Aktarım**:
   - MEB lise müfredatına göre kategorize edilmiş sorular
   - Standart formatta (`question, optionA, optionB, optionC, optionD, correctAnswer, time, points...`) CSV içe aktarma
   - Satır bazında doğrulama ve kullanıcıya anında hata bildirimi

8. **Ayrıntılı Raporlama & Analitik**:
   - Sınıf başarı ortalamaları, soru bazında zorluk indeksleri
   - Öğrenci karne geçmişi
   - Tek tıkla CSV ve PDF / Yazdırılabilir rapor dışa aktarma

9. **Premium Abonelik & İçerik Pazaryeri (Marketplace)**:
   - `FREE`, `PRO`, `SCHOOL`, `ENTERPRISE` plan mimarisi
   - Öğretmenlerin kendi soru paketlerini satışa sunabildiği mağaza sistemi

---

## 🛠️ Teknoloji Mimarisi

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Next.js API Route Handlers, Node.js HTTP Server
- **Veritabanı**: Prisma ORM (SQLite yerel geliştirme, PostgreSQL prodüksiyon hazır)
- **Gerçek Zamanlı**: Socket.io (WebSocket + Polling fallback)
- **Ses Motoru**: Web Audio API Synthesizer (Harici ses dosyası gerektirmez)
- **Kimlik Doğrulama**: Bcryptjs şifreleme + JWT çerez oturumu

---

## 📦 Kurulum ve Çalıştırma

### 1. Gereksinimler
- Node.js v18 veya üzeri
- npm v9 veya üzeri

### 2. Proje Kurulumu
```bash
# Bağımlılıkları yükleyin
npm install

# Veritabanını hazırlayın
npx prisma generate
npx prisma db push

# Demo verilerini yükleyin
npm run prisma:seed
```

### 3. Uygulamayı Başlatın
```bash
# Geliştirme sunucusunu (Next.js + Socket.io) başlatın
npm run dev
```

Uygulama hazır olduğunda tarayıcınızdan **`http://localhost:3000`** adresine gidin.

---

## 🔑 Demo Hesaplar (Şifre: `Password123!`)

Uygulamanın üst menüsündeki **"Hızlı Rol"** açılır menüsünden tek bir tıkla giriş yapabilir veya aşağıdaki hesapları kullanabilirsiniz:

| Rol | E-Posta | Şifre | Açıklama |
|---|---|---|---|
| 👩‍🏫 **Öğretmen** | `ogretmen@edupulse.com` | `Password123!` | Quiz, sınıf ve ödev yöneticisi |
| 👨‍🎓 **Öğrenci** | `ogrenci@edupulse.com` | `Password123!` | Canlı yarışma, ödev ve solo çalışma |
| 👑 **Admin** | `admin@edupulse.com` | `Password123!` | Sistem metrikleri ve moderasyon |

---

## 🧪 Testleri Çalıştırma

Tüm temel fonksiyonları (Kimlik doğrulama, Quiz oluşturma, Soru doğrulama, Canlı oyun, Skorlama, Lider tablosu, Ödevler, Yetkiler, Abonelik) test etmek için:

```bash
npm test
```

---

## 📁 PostgreSQL ile Prodüksiyon Dağıtımı

Uygulamayı prodüksiyon ortamında PostgreSQL ile çalıştırmak için:
1. `.env` dosyasındaki `DATABASE_URL` satırını PostgreSQL bağlantı dizgisi ile güncelleyin:
   ```env
   DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/edupulse?schema=public"
   ```
2. `prisma/schema.prisma` dosyasındaki `provider = "sqlite"` ifadesini `provider = "postgresql"` olarak değiştirin.
3. `npx prisma db push` komutunu çalıştırın.
