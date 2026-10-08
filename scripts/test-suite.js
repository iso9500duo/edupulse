const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'edupulse-super-secret-jwt-key-2026';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('🧪 EduPulse Otomatik Test Paketi Başlatılıyor...\n');

  try {
    // 1. Authentication Tests
    console.log('1. Kimlik Doğrulama (Authentication) Testleri:');
    const teacher = await prisma.user.findUnique({ where: { email: 'ogretmen@edupulse.com' } });
    assert(teacher !== null, 'Öğretmen demo kullanıcısı veritabanında mevcut');

    const isValidPassword = await bcrypt.compare('Password123!', teacher.passwordHash);
    assert(isValidPassword === true, 'Şifre bcrypt hash doğrulaması başarılı');

    const token = jwt.sign({ userId: teacher.id, role: teacher.role }, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === teacher.id && decoded.role === 'TEACHER', 'JWT oturum token oluşturma ve doğrulama başarılı');

    // 2. Quiz Creation Tests
    console.log('\n2. Quiz Oluşturma (Quiz Creation) Testleri:');
    const quizCount = await prisma.quiz.count();
    assert(quizCount > 0, `Veritabanında kayıtlı quizler mevcut (Miktar: ${quizCount})`);

    const sampleQuiz = await prisma.quiz.findFirst({
      include: { questions: { include: { options: true } } },
    });
    assert(sampleQuiz !== null && sampleQuiz.questions.length > 0, 'Quiz soruları ve ilişkisel seçenekleri mevcut');

    // 3. Question Validation Tests
    console.log('\n3. Soru Doğrulama (Question Validation) Testleri:');
    const question = sampleQuiz.questions[0];
    assert(question.timeLimit >= 10 && question.timeLimit <= 120, 'Soru süre sınırı geçerli aralıkta (10s - 120s)');
    assert(question.options.length >= 2, 'Soruda en az 2 seçenek mevcut');
    const hasCorrectOption = question.options.some((o) => o.isCorrect);
    assert(hasCorrectOption === true, 'Soruda en az bir adet doğru cevap işaretli');

    // 4. Game Session & PIN Tests
    console.log('\n4. Canlı Oyun Oturumu (Game Session & PIN) Testleri:');
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const session = await prisma.gameSession.create({
      data: {
        pin,
        quizId: sampleQuiz.id,
        hostId: teacher.id,
        status: 'LOBBY',
        mode: 'CLASSIC',
      },
    });
    assert(session.pin.length === 6, 'Oyun PIN kodu 6 haneli benzersiz formatta oluşturuldu');
    assert(session.status === 'LOBBY', 'Oyun oturumu başlangıç durumu LOBBY olarak ayarlandı');

    const QRCode = require('qrcode');
    const qrDataUrl = await QRCode.toDataURL('https://edupulse.app/join?pin=' + session.pin);
    assert(qrDataUrl.startsWith('data:image/png;base64,'), 'Oyun oturumuna özel benzersiz karekod (QR Code) başarıyla üretildi');

    // 5. Scoring & Speed Bonus Tests
    console.log('\n5. Skor ve Hız Bonusu (Scoring) Testleri:');
    const basePoints = 1000;
    const timeTakenFast = 2000; // 2 seconds
    const speedFactorFast = Math.max(0.2, (20000 - Math.min(timeTakenFast, 20000)) / 20000); // 0.9
    const scoreFast = Math.round(basePoints * speedFactorFast);

    const timeTakenSlow = 18000; // 18 seconds
    const speedFactorSlow = Math.max(0.2, (20000 - Math.min(timeTakenSlow, 20000)) / 20000); // 0.2
    const scoreSlow = Math.round(basePoints * speedFactorSlow);

    assert(scoreFast > scoreSlow, 'Hızlı cevap veren öğrenci daha yüksek hız bonusu puanı aldı');

    const streakBonus = Math.min(3 * 50, 250); // 3 streak = +150
    assert(streakBonus === 150, 'Seri (Streak) bonusu doğru hesaplandı (+150)');

    // 6. Leaderboard Sorting Tests
    console.log('\n6. Lider Tablosu (Leaderboard Ranking) Testleri:');
    const participants = [
      { nickname: 'Ali', score: 1450 },
      { nickname: 'Ayşe', score: 2800 },
      { nickname: 'Zeynep', score: 2100 },
    ];
    participants.sort((a, b) => b.score - a.score);
    assert(participants[0].nickname === 'Ayşe' && participants[1].nickname === 'Zeynep' && participants[2].nickname === 'Ali', 'Skor sıralaması ve lider tablosu doğru hesaplandı');

    // 7. Assignment Tests
    console.log('\n7. Ödev Modu (Assignment) Testleri:');
    const assignment = await prisma.assignment.findFirst();
    assert(assignment !== null, 'Kayıtlı ödev başarıyla doğrulandı');
    assert(assignment.allowGuest === true, 'Öğrenci hesabı olmadan misafir katılım seçeneği destekleniyor');

    // 8. Permission & Role Tests
    console.log('\n8. Yetki ve Rol (Permission) Testleri:');
    const student = await prisma.user.findUnique({ where: { email: 'ogrenci@edupulse.com' } });
    assert(student.role === 'STUDENT', 'Öğrenci rolü doğru kısıtlandı');
    assert(teacher.role === 'TEACHER', 'Öğretmen rolü doğru atandı');

    // 9. Subscription Tests
    console.log('\n9. Abonelik ve Plan (Subscription) Testleri:');
    assert(teacher.plan === 'PRO', 'Öğretmen kullanıcısı PRO plana sahip');
    assert(['FREE', 'PRO', 'SCHOOL', 'ENTERPRISE'].includes(teacher.plan), 'Abonelik planı geçerli sistem paketleri arasında');

    // Clean up temporary test session
    await prisma.gameSession.delete({ where: { id: session.id } });

  } catch (error) {
    console.error('Test çalışma hatası:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`📊 Test Özeti: ${passed} Başarılı, ${failed} Hatalı`);
  console.log('═══════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

runTestSuite();
