import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const assignment = await prisma.assignment.findUnique({
      where: { code },
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
        teacher: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Ödev bulunamadı veya kodu geçersiz.' }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ödev yüklenemedi: ' + error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const session = await getCurrentUser();
    const { studentName, score, correctCount, totalQuestions, durationSeconds } = await req.json();

    const assignment = await prisma.assignment.findUnique({ where: { code } });
    if (!assignment) {
      return NextResponse.json({ error: 'Ödev bulunamadı.' }, { status: 404 });
    }

    const attempt = await prisma.assignmentAttempt.create({
      data: {
        assignmentId: assignment.id,
        studentId: session?.userId || null,
        studentName: session?.name || studentName || 'Misafir Öğrenci',
        score: parseInt(score, 10) || 0,
        correctCount: parseInt(correctCount, 10) || 0,
        totalQuestions: parseInt(totalQuestions, 10) || 0,
        durationSeconds: parseInt(durationSeconds, 10) || 0,
        completedAt: new Date(),
      },
    });

    // Award XP if logged in
    if (session?.userId) {
      const earnedXp = Math.round((correctCount / (totalQuestions || 1)) * 200) + 50;
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          xp: { increment: earnedXp },
        },
      });
      await prisma.xpTransaction.create({
        data: {
          userId: session.userId,
          amount: earnedXp,
          reason: 'ASSIGNMENT_DONE',
        },
      });
    }

    return NextResponse.json({ success: true, attempt });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ödev gönderimi başarısız: ' + error.message }, { status: 500 });
  }
}
