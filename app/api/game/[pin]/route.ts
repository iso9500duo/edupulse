import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { pin: string } }
) {
  try {
    const { pin } = params;

    const session = await prisma.gameSession.findUnique({
      where: { pin },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            theme: true,
            questions: {
              select: { id: true, title: true, type: true, timeLimit: true, points: true },
            },
          },
        },
        host: {
          select: { name: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş oyun PIN kodu.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pin: session.pin,
      status: session.status,
      mode: session.mode,
      quizTitle: session.quiz.title,
      questionCount: session.quiz.questions.length,
      hostName: session.host.name,
      profanityFilter: session.profanityFilter,
      randomNicknames: session.randomNicknames,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Oyun bilgisi alınamadı.' }, { status: 500 });
  }
}
