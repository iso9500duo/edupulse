import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const { quizTitle, rows = [] } = await req.json();

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'İçe aktarılacak satır bulunamadı.' }, { status: 400 });
    }

    const validQuestions: any[] = [];
    const errors: { rowNumber: number; reason: string }[] = [];

    rows.forEach((row: any, idx: number) => {
      const rowNum = idx + 1;
      const questionText = row.question || row.Soru || row.soru;
      const optA = row.optionA || row.A || row.SeçenekA;
      const optB = row.optionB || row.B || row.SeçenekB;
      const optC = row.optionC || row.C || row.SeçenekC;
      const optD = row.optionD || row.D || row.SeçenekD;
      const correctAns = (row.correctAnswer || row.DoğruCevap || row.dogru || 'A').toUpperCase().trim();
      const time = parseInt(row.time || row.sure || 20, 10);
      const points = parseInt(row.points || row.puan || 1000, 10);
      const explanation = row.explanation || row.aciklama || '';

      if (!questionText) {
        errors.push({ rowNumber: rowNum, reason: 'Soru metni boş.' });
        return;
      }
      if (!optA || !optB) {
        errors.push({ rowNumber: rowNum, reason: 'En az iki seçenek (A ve B) zorunludur.' });
        return;
      }

      const options = [
        { text: String(optA), isCorrect: correctAns === 'A' || correctAns === '1' || correctAns === optA, color: '#ef4444' },
        { text: String(optB), isCorrect: correctAns === 'B' || correctAns === '2' || correctAns === optB, color: '#3b82f6' },
      ];
      if (optC) options.push({ text: String(optC), isCorrect: correctAns === 'C' || correctAns === '3' || correctAns === optC, color: '#f59e0b' });
      if (optD) options.push({ text: String(optD), isCorrect: correctAns === 'D' || correctAns === '4' || correctAns === optD, color: '#10b981' });

      // Check if at least one correct option exists
      if (!options.some((o) => o.isCorrect)) {
        options[0].isCorrect = true; // default to A
      }

      validQuestions.push({
        title: questionText,
        type: 'MULTIPLE_CHOICE',
        explanation,
        timeLimit: time,
        points,
        difficulty: row.difficulty || 'MEDIUM',
        options,
      });
    });

    if (validQuestions.length === 0) {
      return NextResponse.json({
        error: 'Geçerli hiçbir soru aktarılamadı.',
        errors,
      }, { status: 400 });
    }

    // Optionally create a new quiz directly if quizTitle is provided
    let createdQuiz = null;
    if (quizTitle) {
      createdQuiz = await prisma.quiz.create({
        data: {
          title: quizTitle,
          description: `Excel/CSV üzerinden aktarılan ${validQuestions.length} soru.`,
          creatorId: session.userId,
          questions: {
            create: validQuestions.map((q, qIdx) => ({
              orderIndex: qIdx,
              type: q.type,
              title: q.title,
              explanation: q.explanation,
              timeLimit: q.timeLimit,
              points: q.points,
              difficulty: q.difficulty,
              options: {
                create: q.options.map((opt: any, optIdx: number) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  orderIndex: optIdx,
                  color: opt.color,
                })),
              },
            })),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      importedCount: validQuestions.length,
      questions: validQuestions,
      errors,
      createdQuiz,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'İçe aktarma hatası: ' + error.message }, { status: 500 });
  }
}
