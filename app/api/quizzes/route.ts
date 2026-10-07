import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const gradeLevel = searchParams.get('grade');
    const isPremium = searchParams.get('isPremium');
    const creatorId = searchParams.get('creatorId');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (subject) {
      where.subject = { name: subject };
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    if (gradeLevel) {
      where.gradeLevel = parseInt(gradeLevel, 10);
    }

    if (isPremium !== null && isPremium !== undefined && isPremium !== '') {
      where.isPremium = isPremium === 'true';
    }

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, role: true, avatar: true },
        },
        subject: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ quizzes });
  } catch (error: any) {
    console.error('Fetch quizzes error:', error);
    return NextResponse.json({ error: 'Quizler getirilirken hata oluştu.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      subjectId,
      gradeLevel = 10,
      difficulty = 'MEDIUM',
      visibility = 'PUBLIC',
      isPremium = false,
      theme = 'modern-indigo',
      questions = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Quiz başlığı zorunludur.' }, { status: 400 });
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        description,
        creatorId: session.userId,
        subjectId: subjectId || null,
        gradeLevel: parseInt(gradeLevel, 10) || 10,
        difficulty,
        visibility,
        isPremium: Boolean(isPremium),
        theme,
        questions: {
          create: questions.map((q: any, qIdx: number) => ({
            orderIndex: qIdx,
            type: q.type || 'MULTIPLE_CHOICE',
            title: q.title || `Soru ${qIdx + 1}`,
            explanation: q.explanation || '',
            mediaUrl: q.mediaUrl || null,
            mediaType: q.mediaType || null,
            timeLimit: parseInt(q.timeLimit, 10) || 20,
            points: parseInt(q.points, 10) || 1000,
            allowMultiple: Boolean(q.allowMultiple),
            difficulty: q.difficulty || difficulty,
            configJson: q.configJson ? JSON.stringify(q.configJson) : null,
            options: {
              create: (q.options || []).map((opt: any, optIdx: number) => ({
                text: typeof opt === 'string' ? opt : opt.text,
                isCorrect: Boolean(opt.isCorrect),
                orderIndex: optIdx,
                color: opt.color || null,
                matchTarget: opt.matchTarget || null,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return NextResponse.json({ success: true, quiz: newQuiz });
  } catch (error: any) {
    console.error('Create quiz error:', error);
    return NextResponse.json({ error: 'Quiz oluşturulurken bir hata oluştu: ' + error.message }, { status: 500 });
  }
}
