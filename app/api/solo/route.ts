import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { quizId, mode, score, totalItems, correctItems } = await req.json();

    if (!session) {
      return NextResponse.json({ success: true, message: 'Misafir oturumu tamamlandı.' });
    }

    const xpEarned = Math.round((correctItems / (totalItems || 1)) * 150) + 30;

    await prisma.studySession.create({
      data: {
        userId: session.userId,
        quizId,
        mode: mode || 'CLASSIC_SOLO',
        score: parseInt(score, 10) || 0,
        totalItems: parseInt(totalItems, 10) || 0,
        correctItems: parseInt(correctItems, 10) || 0,
        xpEarned,
      },
    });

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        xp: { increment: xpEarned },
      },
    });

    await prisma.xpTransaction.create({
      data: {
        userId: session.userId,
        amount: xpEarned,
        reason: `SOLO_${mode || 'STUDY'}`,
      },
    });

    return NextResponse.json({ success: true, xpEarned });
  } catch (error: any) {
    return NextResponse.json({ error: 'Solo kayıt hatası: ' + error.message }, { status: 500 });
  }
}
