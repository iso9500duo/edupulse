import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        creator: { select: { id: true, name: true, role: true } },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            quiz: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    return NextResponse.json({ error: 'Kurslar yüklenemedi: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Kurs oluşturma yetkiniz yok.' }, { status: 403 });
    }

    const { title, description, isPremium = false, price = 0, modules = [] } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Kurs başlığı zorunludur.' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        creatorId: session.userId,
        isPremium: Boolean(isPremium),
        price: parseFloat(price) || 0,
        modules: {
          create: modules.map((m: any, idx: number) => ({
            orderIndex: idx,
            title: m.title || `Bölüm ${idx + 1}`,
            type: m.type || 'LESSON',
            content: m.content || '',
            quizId: m.quizId || null,
          })),
        },
      },
      include: { modules: true },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: 'Kurs oluşturulamadı: ' + error.message }, { status: 500 });
  }
}
