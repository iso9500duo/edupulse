import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generatePin } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let hostId = session?.userId;
    if (!hostId) {
      const defaultHost = await prisma.user.findFirst({
        where: { role: 'TEACHER' },
      }) || await prisma.user.findFirst();
      hostId = defaultHost?.id || 'demo-host-id';
    }

    const { quizId, mode = 'CLASSIC', profanityFilter = true, randomNicknames = false } = await req.json();

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID gereklidir.' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz bulunamadı.' }, { status: 404 });
    }

    // Generate unique 6-digit PIN
    let pin = generatePin();
    let existingSession = await prisma.gameSession.findUnique({ where: { pin } });
    while (existingSession) {
      pin = generatePin();
      existingSession = await prisma.gameSession.findUnique({ where: { pin } });
    }

    const gameSession = await prisma.gameSession.create({
      data: {
        pin,
        quizId: quiz.id,
        hostId,
        mode,
        status: 'LOBBY',
        profanityFilter,
        randomNicknames,
      },
    });

    // Register into serverlessGameRooms for fast cross-lambda and socket access
    const globalGameState = globalThis as unknown as {
      serverlessGameRooms?: Map<string, any>;
    };
    if (!globalGameState.serverlessGameRooms) {
      globalGameState.serverlessGameRooms = new Map();
    }
    globalGameState.serverlessGameRooms.set(pin, {
      pin,
      status: 'LOBBY',
      quiz,
      hostId,
      participants: [],
      currentQuestionIndex: 0,
      questionStartedAt: null,
      answers: {},
      reactions: [],
      updatedAt: Date.now(),
    });

    // Increment play count
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { playCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      pin: gameSession.pin,
      sessionId: gameSession.id,
      quiz,
    });
  } catch (error: any) {
    console.error('Game create error:', error);
    return NextResponse.json({ error: 'Oyun başlatılırken hata oluştu: ' + error.message }, { status: 500 });
  }
}
