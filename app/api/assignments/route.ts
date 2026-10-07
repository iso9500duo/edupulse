import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (code) {
      const assignment = await prisma.assignment.findUnique({
        where: { code },
        include: {
          quiz: {
            include: {
              questions: {
                include: { options: true },
              },
            },
          },
          teacher: { select: { name: true } },
          class: { select: { name: true } },
          _count: { select: { attempts: true } },
        },
      });
      return NextResponse.json({ assignment });
    }

    const where: any = {};
    if (session && session.role === 'TEACHER') {
      where.teacherId = session.userId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        quiz: { select: { id: true, title: true, coverImage: true } },
        class: { select: { id: true, name: true } },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ödevler yüklenemedi.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const { quizId, title, classId, deadline, allowGuest = true } = await req.json();

    if (!quizId || !title) {
      return NextResponse.json({ error: 'Quiz ve ödev başlığı zorunludur.' }, { status: 400 });
    }

    const code = `HW-${Math.floor(10000 + Math.random() * 90000)}`;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        quizId,
        teacherId: session.userId,
        classId: classId || null,
        code,
        deadline: deadline ? new Date(deadline) : null,
        allowGuest: Boolean(allowGuest),
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ödev oluşturulamadı: ' + error.message }, { status: 500 });
  }
}
