import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { pin: string } }
) {
  try {
    const { pin } = params;

    // Check memory store first
    const globalGameState = globalThis as unknown as {
      serverlessGameRooms?: Map<string, any>;
    };
    const memRoom = globalGameState.serverlessGameRooms?.get(pin);
    if (memRoom && memRoom.quiz) {
      return NextResponse.json({
        success: true,
        pin: memRoom.pin,
        status: memRoom.status,
        mode: memRoom.mode || 'CLASSIC',
        quizTitle: memRoom.quiz.title,
        quiz: memRoom.quiz,
        questionCount: memRoom.quiz.questions?.length || 0,
        hostName: 'Öğretmen',
        profanityFilter: true,
        randomNicknames: false,
      });
    }

    const session = await prisma.gameSession.findUnique({
      where: { pin },
      include: {
        quiz: {
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
        },
        host: {
          select: { name: true },
        },
      },
    });

    if (!session) {
      // Check if any active room in global state
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş oyun PIN kodu. Lütfen 6 haneli kodu kontrol ediniz.' }, { status: 404 });
    }

    // Cache in memRoom
    if (!globalGameState.serverlessGameRooms) {
      globalGameState.serverlessGameRooms = new Map();
    }
    globalGameState.serverlessGameRooms.set(pin, {
      pin: session.pin,
      status: session.status,
      quiz: session.quiz,
      hostId: session.hostId,
      participants: [],
      currentQuestionIndex: 0,
      questionStartedAt: null,
      answers: {},
      reactions: [],
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      pin: session.pin,
      status: session.status,
      mode: session.mode,
      quizTitle: session.quiz.title,
      quiz: session.quiz,
      questionCount: session.quiz.questions.length,
      hostName: session.host?.name || 'Öğretmen',
      profanityFilter: session.profanityFilter,
      randomNicknames: session.randomNicknames,
    });
  } catch (error: any) {
    console.error('Fetch game error:', error);
    return NextResponse.json({ error: 'Oyun bilgisi alınamadı.' }, { status: 500 });
  }
}
