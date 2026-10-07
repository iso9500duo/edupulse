const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 EduPulse veritabanı tohumlama başlatılıyor...');

  // 1. Şifre hashleme
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

  // 2. Okul oluşturma
  const school = await prisma.school.upsert({
    where: { code: 'SCH-IST-001' },
    update: {},
    create: {
      name: 'İstanbul Anadolu Lisesi',
      city: 'İstanbul',
      type: 'Lise',
      code: 'SCH-IST-001',
    },
  });

  // 3. Kullanıcılar (Öğretmen, Öğrenci, Admin)
  const teacher = await prisma.user.upsert({
    where: { email: 'ogretmen@edupulse.com' },
    update: {},
    create: {
      email: 'ogretmen@edupulse.com',
      passwordHash: defaultPasswordHash,
      name: 'Ayşe Yılmaz (Öğretmen)',
      role: 'TEACHER',
      avatar: 'teacher-1',
      bio: 'Türk Dili ve Edebiyatı Öğretmeni | 10 Yıllık Deneyim',
      schoolId: school.id,
      plan: 'PRO',
      xp: 4500,
      level: 8,
      streak: 12,
      isVerified: true,
      profile: {
        create: {
          title: 'Türk Dili ve Edebiyatı Öğretmeni',
          city: 'İstanbul',
          preferredSubject: 'Türk Dili ve Edebiyatı',
          soundEnabled: true,
          language: 'tr',
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'ogrenci@edupulse.com' },
    update: {},
    create: {
      email: 'ogrenci@edupulse.com',
      passwordHash: defaultPasswordHash,
      name: 'Emre Demir (Öğrenci)',
      role: 'STUDENT',
      avatar: 'student-1',
      bio: '10/A Sınıfı Öğrencisi | Bilgi Yarışması Tutkunu',
      schoolId: school.id,
      plan: 'FREE',
      xp: 1850,
      level: 4,
      streak: 5,
      isVerified: true,
      profile: {
        create: {
          title: '10. Sınıf Öğrencisi',
          city: 'İstanbul',
          preferredSubject: 'Matematik',
          soundEnabled: true,
          language: 'tr',
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edupulse.com' },
    update: {},
    create: {
      email: 'admin@edupulse.com',
      passwordHash: defaultPasswordHash,
      name: 'Sistem Yöneticisi',
      role: 'ADMIN',
      avatar: 'admin-shield',
      bio: 'EduPulse Platform Yöneticisi',
      plan: 'ENTERPRISE',
      xp: 9999,
      level: 20,
      streak: 30,
      isVerified: true,
      profile: {
        create: {
          title: 'Baş Sistem Mimarı',
          city: 'Ankara',
          soundEnabled: true,
          language: 'tr',
        },
      },
    },
  });

  // 4. Rozetler (Badges)
  const badges = [
    { code: 'FIRST_QUIZ', name: 'İlk Adım', description: 'İlk quizini başarıyla tamamladın!', icon: '🎯', xpBonus: 100 },
    { code: 'STREAK_5', name: 'Alev Serisi', description: '5 gün kesintisiz çalışma serisi yakaladın!', icon: '🔥', xpBonus: 250 },
    { code: 'PERFECT_SCORE', name: 'Kusursuz Zihin', description: 'Bir yarışmada tüm soruları doğru cevapladın!', icon: '⭐', xpBonus: 500 },
    { code: 'SPEED_DEMON', name: 'Işık Hızı', description: 'Soruyu 3 saniyenin altında doğru yanıtladın!', icon: '⚡', xpBonus: 300 },
    { code: 'MASTER_CREATOR', name: 'Usta Üretici', description: 'İlk özgün quiz içeriğini yayınladın!', icon: '🏆', xpBonus: 400 },
  ];

  for (const b of badges) {
    const badge = await prisma.badge.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
    // Öğrenciye ilk iki rozeti ver
    if (['FIRST_QUIZ', 'STREAK_5'].includes(b.code)) {
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId: student.id,
            badgeId: badge.id,
          },
        },
        update: {},
        create: {
          userId: student.id,
          badgeId: badge.id,
        },
      });
    }
  }

  // 5. Kategoriler ve Dersler
  const categoriesData = [
    {
      name: 'Dil ve Edebiyat',
      slug: 'dil-ve-edebiyat',
      icon: 'BookOpen',
      subjects: ['Türk Dili ve Edebiyatı', 'Yabancı Dil (İngilizce)', 'Dilbilgisi'],
    },
    {
      name: 'Matematik & Mantık',
      slug: 'matematik-mantik',
      icon: 'Calculator',
      subjects: ['Matematik', 'Geometri', 'Mantık'],
    },
    {
      name: 'Fen Bilimleri',
      slug: 'fen-bilimleri',
      icon: 'Atom',
      subjects: ['Fizik', 'Kimya', 'Biyoloji'],
    },
    {
      name: 'Sosyal Bilimler',
      slug: 'sosyal-bilimler',
      icon: 'Globe',
      subjects: ['Tarih', 'Coğrafya', 'Felsefe'],
    },
    {
      name: 'Bilişim & Teknoloji',
      slug: 'bilisim-teknoloji',
      icon: 'Cpu',
      subjects: ['Bilgisayar Bilimi', 'Yapay Zekâ', 'Robotik'],
    },
    {
      name: 'Genel Kültür & Sanat',
      slug: 'genel-kultur',
      icon: 'Sparkles',
      subjects: ['Genel Kültür', 'Görsel Sanatlar', 'Müzik'],
    },
  ];

  const createdSubjects = {};

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });

    for (const subName of cat.subjects) {
      const subSlug = subName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const subject = await prisma.subject.upsert({
        where: { name: subName },
        update: {},
        create: {
          name: subName,
          slug: subSlug,
          categoryId: category.id,
        },
      });
      createdSubjects[subName] = subject;
    }
  }

  // 6. Sınıf Oluşturma
  const class10A = await prisma.class.upsert({
    where: { code: 'CLS-10A' },
    update: {},
    create: {
      name: '10/A Sınıfı',
      gradeLevel: 10,
      code: 'CLS-10A',
      teacherId: teacher.id,
      schoolId: school.id,
      members: {
        create: [
          { studentId: student.id }
        ]
      }
    },
  });

  // 7. Örnek Quizler ve 20 Soru Türünü Kapsayan Zengin Sorular
  const quizEdebiyat = await prisma.quiz.create({
    data: {
      title: '10. Sınıf Türk Dili ve Edebiyatı: Hikâyenin Yapı Unsurları',
      description: 'Olay, kişi, zaman, mekân, anlatıcı türleri ve bakış açılarını kapsayan interaktif yarışma.',
      creatorId: teacher.id,
      subjectId: createdSubjects['Türk Dili ve Edebiyatı']?.id,
      gradeLevel: 10,
      difficulty: 'MEDIUM',
      visibility: 'PUBLIC',
      isPremium: false,
      playCount: 142,
      rating: 4.9,
      questions: {
        create: [
          {
            orderIndex: 0,
            type: 'MULTIPLE_CHOICE',
            title: 'Anlatıcının kahramanların aklından geçenleri, geçmişlerini ve geleceklerini bildiği bakış açısı hangisidir?',
            explanation: 'İlahi (Hâkim) bakış açısında anlatıcı her şeye vakıftır ve iç dünyaları okur.',
            timeLimit: 20,
            points: 1000,
            difficulty: 'MEDIUM',
            options: {
              create: [
                { text: 'Kahraman Bakış Açısı', isCorrect: false, orderIndex: 0, color: '#ef4444' },
                { text: 'İlahi (Hâkim) Bakış Açısı', isCorrect: true, orderIndex: 1, color: '#3b82f6' },
                { text: 'Gözlemci Bakış Açısı', isCorrect: false, orderIndex: 2, color: '#f59e0b' },
                { text: 'Çoğulcu Bakış Açısı', isCorrect: false, orderIndex: 3, color: '#10b981' },
              ],
            },
          },
          {
            orderIndex: 1,
            type: 'TRUE_FALSE',
            title: 'Durum (Çehov tarzı) hikâyelerinde serim, düğüm ve çözüm planı klasik olay hikâyelerine göre daha belirgindir.',
            explanation: 'Yanlış! Durum hikâyelerinde merak unsuru ve klasik serim-düğüm-çözüm planı geri plandadır; hayatın bir kesiti verilir.',
            timeLimit: 15,
            points: 800,
            difficulty: 'EASY',
            options: {
              create: [
                { text: 'Doğru', isCorrect: false, orderIndex: 0, color: '#10b981' },
                { text: 'Yanlış', isCorrect: true, orderIndex: 1, color: '#ef4444' },
              ],
            },
          },
          {
            orderIndex: 2,
            type: 'TYPE_ANSWER',
            title: 'Türk edebiyatında ilk yerli hikâye örneği kabul edilen "Letaif-i Rivayat" eserinin yazarı kimdir?',
            explanation: 'Ahmet Mithat Efendi 1870 yılında Letaif-i Rivayat serisini yayımlamıştır.',
            timeLimit: 30,
            points: 1200,
            difficulty: 'HARD',
            configJson: JSON.stringify({ acceptedAnswers: ['Ahmet Mithat', 'Ahmet Mithat Efendi', 'ahmet mithat efendi'] }),
            options: {
              create: [
                { text: 'Ahmet Mithat Efendi', isCorrect: true, orderIndex: 0 },
              ],
            },
          },
          {
            orderIndex: 3,
            type: 'PUZZLE',
            title: 'Klasik bir olay hikâyesinin bölümlerini başlangıçtan sona doğru sıralayınız.',
            explanation: 'Sıralama: Serim (Giriş) -> Düğüm (Gelişme) -> Çözüm (Sonuç)',
            timeLimit: 25,
            points: 1100,
            configJson: JSON.stringify({ correctOrder: ['Serim', 'Düğüm', 'Çözüm'] }),
            options: {
              create: [
                { text: 'Düğüm (Gelişme)', isCorrect: true, orderIndex: 1 },
                { text: 'Serim (Giriş)', isCorrect: true, orderIndex: 0 },
                { text: 'Çözüm (Sonuç)', isCorrect: true, orderIndex: 2 },
              ],
            },
          },
          {
            orderIndex: 4,
            type: 'POLL',
            title: 'Derslerinizde durum (kesit) hikâyelerini mi yoksa merak uyandıran olay hikâyelerini mi okumayı daha çok seviyorsunuz?',
            explanation: 'Bu bir etkileşim sorusudur, doğru/yanlış cevap aranmaz.',
            timeLimit: 15,
            points: 0,
            options: {
              create: [
                { text: 'Maupassant Tarzı Olay Hikâyesi', isCorrect: true, orderIndex: 0, color: '#3b82f6' },
                { text: 'Çehov Tarzı Durum Hikâyesi', isCorrect: true, orderIndex: 1, color: '#8b5cf6' },
                { text: 'Modern / Postmodern Anlatılar', isCorrect: true, orderIndex: 2, color: '#10b981' },
              ],
            },
          },
          {
            orderIndex: 5,
            type: 'MULTIPLE_SELECT',
            title: 'Aşağıdakilerden hangileri hikâyenin temel yapı unsurlarındandır? (Birden fazla seçiniz)',
            explanation: 'Olay örgüsü, Kişiler, Mekân ve Zaman hikâyenin 4 ana yapı unsurudur.',
            timeLimit: 20,
            points: 1000,
            allowMultiple: true,
            options: {
              create: [
                { text: 'Olay Örgüsü', isCorrect: true, orderIndex: 0, color: '#ef4444' },
                { text: 'Kişi / Şahıs Kadrosu', isCorrect: true, orderIndex: 1, color: '#3b82f6' },
                { text: 'Redif ve Uyak Düzeni', isCorrect: false, orderIndex: 2, color: '#f59e0b' },
                { text: 'Mekân ve Zaman', isCorrect: true, orderIndex: 3, color: '#10b981' },
              ],
            },
          },
        ],
      },
    },
  });

  const quizMatematik = await prisma.quiz.create({
    data: {
      title: 'Matematik: Fonksiyonlar ve Grafik Okuma',
      description: 'Birebir, örten, doğrusal fonksiyonlar ve grafik analizi üzerine test.',
      creatorId: teacher.id,
      subjectId: createdSubjects['Matematik']?.id,
      gradeLevel: 10,
      difficulty: 'HARD',
      visibility: 'PUBLIC',
      isPremium: true,
      playCount: 98,
      rating: 4.8,
      questions: {
        create: [
          {
            orderIndex: 0,
            type: 'MULTIPLE_CHOICE',
            title: 'f(x) = 3x - 5 olduğuna göre f(4) kaçtır?',
            explanation: 'f(4) = 3*(4) - 5 = 12 - 5 = 7',
            timeLimit: 15,
            points: 1000,
            options: {
              create: [
                { text: '7', isCorrect: true, orderIndex: 0, color: '#ef4444' },
                { text: '9', isCorrect: false, orderIndex: 1, color: '#3b82f6' },
                { text: '12', isCorrect: false, orderIndex: 2, color: '#f59e0b' },
                { text: '5', isCorrect: false, orderIndex: 3, color: '#10b981' },
              ],
            },
          },
          {
            orderIndex: 1,
            type: 'SLIDER',
            title: 'f(x) = x² + 2 fonksiyonu için x = 3 iken f(x) değerini cetvelde işaretleyiniz.',
            explanation: 'f(3) = 3² + 2 = 9 + 2 = 11',
            timeLimit: 20,
            points: 1000,
            configJson: JSON.stringify({ min: 0, max: 20, correctValue: 11, tolerance: 0 }),
            options: {
              create: [
                { text: '11', isCorrect: true, orderIndex: 0 },
              ],
            },
          },
          {
            orderIndex: 2,
            type: 'TRUE_FALSE',
            title: 'Bir bağıntının fonksiyon olabilmesi için tanım kümesindeki her elemanın değer kümesinde yalnız bir karşılığı olmalıdır.',
            explanation: 'Doğru! Fonksiyon tanımının temel şartıdır.',
            timeLimit: 15,
            points: 800,
            options: {
              create: [
                { text: 'Doğru', isCorrect: true, orderIndex: 0, color: '#10b981' },
                { text: 'Yanlış', isCorrect: false, orderIndex: 1, color: '#ef4444' },
              ],
            },
          },
        ],
      },
    },
  });

  const quizTarih = await prisma.quiz.create({
    data: {
      title: 'Tarih: Kurtuluş Savaşı ve Milli Mücadele Dönemi',
      description: 'Amasya Genelgesi, kongreler, TBMM açılışı ve cepheler bilgi yarışması.',
      creatorId: teacher.id,
      subjectId: createdSubjects['Tarih']?.id,
      gradeLevel: 11,
      difficulty: 'MEDIUM',
      visibility: 'PUBLIC',
      playCount: 215,
      rating: 5.0,
      questions: {
        create: [
          {
            orderIndex: 0,
            type: 'MULTIPLE_CHOICE',
            title: '"Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır." ilkesi ilk nerede ilan edilmiştir?',
            explanation: 'Amasya Genelgesi (22 Haziran 1919) Milli Mücadelenin gerekçesini, amacını ve yöntemini belirten belgedir.',
            timeLimit: 20,
            points: 1000,
            options: {
              create: [
                { text: 'Havza Genelgesi', isCorrect: false, orderIndex: 0, color: '#ef4444' },
                { text: 'Amasya Genelgesi', isCorrect: true, orderIndex: 1, color: '#3b82f6' },
                { text: 'Erzurum Kongresi', isCorrect: false, orderIndex: 2, color: '#f59e0b' },
                { text: 'Sivas Kongresi', isCorrect: false, orderIndex: 3, color: '#10b981' },
              ],
            },
          },
          {
            orderIndex: 1,
            type: 'WORD_CLOUD',
            title: 'Milli Mücadele denince aklınıza gelen ilk üç kelimeyi yazın.',
            explanation: 'Öğrenci yanıtlarından dinamik bir kelime bulutu oluşturulur.',
            timeLimit: 20,
            points: 0,
            options: {
              create: [
                { text: 'Bağımsızlık', isCorrect: true, orderIndex: 0 },
                { text: 'Vatan', isCorrect: true, orderIndex: 1 },
                { text: 'Atatürk', isCorrect: true, orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // 8. Ödev (Assignment) Oluşturma
  await prisma.assignment.upsert({
    where: { code: 'HW-10A-TDE' },
    update: {},
    create: {
      title: 'Haftalık Ödev: Hikâye Yapı Unsurları Testi',
      quizId: quizEdebiyat.id,
      teacherId: teacher.id,
      classId: class10A.id,
      code: 'HW-10A-TDE',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      allowGuest: true,
      status: 'ACTIVE',
    },
  });

  // 9. Kurs (Course) Oluşturma
  const courseEdebiyat = await prisma.course.create({
    data: {
      title: '10. Sınıf Hikâye ve Edebi Metinler Kursu',
      description: 'Hikâye türünün doğuşundan günümüze, yapı unsurları ve anlatım tekniklerinin eksiksiz rehberi.',
      creatorId: teacher.id,
      isPremium: false,
      price: 0,
      modules: {
        create: [
          {
            orderIndex: 0,
            title: 'Bölüm 1: Hikâye Nedir ve Tarihsel Gelişimi',
            type: 'LESSON',
            content: 'Hikâye; olmuş ya da olabilecek olayları kişi, zaman ve mekân bağlamında anlatan kısa edebi türdür. Türk edebiyatında destan, masal ve halk hikâyelerinden modern hikâyeye geçiş Tanzimat Dönemi ile başlamıştır.',
          },
          {
            orderIndex: 1,
            title: 'Bölüm 2: Hikâyenin Yapı Unsurları (Olay, Kişi, Zaman, Mekân)',
            type: 'LESSON',
            content: 'Her hikâye dört temel direk üzerine kurulur: 1. Olay Örgüsü, 2. Şahıs Kadrosu (Karakter & Tip), 3. Zaman (Kozmik ve Psikolojik), 4. Mekân (Açık ve Kapalı Mekânlar).',
          },
          {
            orderIndex: 2,
            title: 'Bölüm 3: İnteraktif Değerlendirme Quizi',
            type: 'QUIZ',
            quizId: quizEdebiyat.id,
          },
        ],
      },
    },
  });

  // 10. Flashcard Seti
  await prisma.flashcardSet.create({
    data: {
      title: 'Edebiyat Terimleri ve Akımlar Flashcards',
      creatorId: teacher.id,
      cards: {
        create: [
          { frontText: 'Klasisizm Akımının Temel İlkesi', backText: 'Akıl ve sağduyu egemenliği, soylu dil ve kuralcılık.' },
          { frontText: 'Romantizm Akımının Öncüsü Kimdir?', backText: 'Victor Hugo (Cromwell önsözü ile kuralları belirledi).' },
          { frontText: 'Realizmde En Önemli Yöntem Nedir?', backText: 'Gözlem ve belgelere dayalı nesnel gerçekçilik.' },
          { frontText: 'Maupassant Tarzı Hikâye Nedir?', backText: 'Olay hikâyesidir. Serim, düğüm, çözüm planı ve şaşırtıcı son vardır.' },
          { frontText: 'Çehov Tarzı Hikâye Nedir?', backText: 'Durum hikâyesidir. Günlük yaşamın bir kesiti anlatılır, merak unsuru azdır.' },
        ],
      },
    },
  });

  // 11. Microlearning Story
  await prisma.story.create({
    data: {
      title: '3 Dakikada Anlatıcı Bakış Açıları',
      creatorId: teacher.id,
      isPublished: true,
      blocks: {
        create: [
          {
            orderIndex: 0,
            type: 'TEXT',
            title: 'Anlatıcı Nedir?',
            content: 'Edebi metinlerde olayı okuyucuya aktaran kurmaca sestir. Yazarın kendisi değil, onun kurguladığı bir figürdür.',
          },
          {
            orderIndex: 1,
            type: 'TEXT',
            title: '1. İlahi (Tanrısal / Hâkim) Bakış Açısı',
            content: 'Kahramanların iç dünyasını, gizli niyetlerini, geçmişlerini ve geleceklerini her şeyi bilen anlatıcı türüdür. Üçüncü tekil kişi (o) ağzıyla yazılır.',
          },
          {
            orderIndex: 2,
            type: 'TEXT',
            title: '2. Kahraman Bakış Açısı',
            content: 'Olayları bizzat yaşayan ya da şahit olan karakterin dilinden anlatılır. Birinci tekil kişi (ben) ağzı kullanılır.',
          },
          {
            orderIndex: 3,
            type: 'QUIZ',
            title: 'Hızlı Kontrol',
            questionJson: JSON.stringify({
              question: '"Odaya girdiğinde kalbinin heyecanla çarptığını sadece kendisi değil, yıllar sonra başına gelecekleri bilen kaderi de hissediyordu." Hangi bakış açısıdır?',
              options: ['Kahraman', 'İlahi (Hâkim)', 'Gözlemci'],
              correct: 1,
            }),
          },
        ],
      },
    },
  });

  // 12. Marketplace Item
  await prisma.marketplaceItem.create({
    data: {
      creatorId: teacher.id,
      quizId: quizMatematik.id,
      title: '10. Sınıf Fonksiyonlar VIP Soru Paketi',
      description: 'ÖSYM ve okul sınavlarına hazırlık için 30 özgün soru ve video açıklamalar.',
      price: 29.99,
      salesCount: 14,
      status: 'APPROVED',
    },
  });

  console.log('✅ Tohumlama başarıyla tamamlandı!');
  console.log(`
  ═══════════════════════════════════════════════════════════
  Örnek Giriş Hesapları (Şifre: Password123!):
  👩‍🏫 Öğretmen:  ogretmen@edupulse.com
  👨‍🎓 Öğrenci:   ogrenci@edupulse.com
  👑 Admin:     admin@edupulse.com
  ═══════════════════════════════════════════════════════════
  `);
}

main()
  .catch((e) => {
    console.error('Tohumlama hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
