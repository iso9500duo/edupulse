import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, role: true, avatar: true },
        },
        subject: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
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

    return NextResponse.json({ quiz });
  } catch (error: any) {
    console.error('Get quiz error:', error);
    return NextResponse.json({ error: 'Quiz yüklenirken hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const { id } = params;

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz bulunamadı.' }, { status: 404 });
    }

    if (quiz.creatorId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu quizi silme yetkiniz yok.' }, { status: 403 });
    }

    await prisma.quiz.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Quiz başarıyla silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Quiz silinirken hata oluştu: ' + error.message }, { status: 500 });
  }
}
