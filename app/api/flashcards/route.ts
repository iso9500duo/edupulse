import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const flashcardSets = await prisma.flashcardSet.findMany({
      include: {
        creator: { select: { id: true, name: true } },
        cards: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ flashcardSets });
  } catch (error: any) {
    return NextResponse.json({ error: 'Flashcard setleri yüklenemedi: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const { title, cards = [] } = await req.json();

    const set = await prisma.flashcardSet.create({
      data: {
        title: title || 'Yeni Çalışma Kartı Seti',
        creatorId: session.userId,
        cards: {
          create: cards.map((c: any) => ({
            frontText: c.frontText || c.front || '',
            backText: c.backText || c.back || '',
          })),
        },
      },
      include: { cards: true },
    });

    return NextResponse.json({ success: true, set });
  } catch (error: any) {
    return NextResponse.json({ error: 'Flashcard seti oluşturulamadı: ' + error.message }, { status: 500 });
  }
}
