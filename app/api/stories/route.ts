import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      include: {
        creator: { select: { id: true, name: true } },
        blocks: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ stories });
  } catch (error: any) {
    return NextResponse.json({ error: 'Hikâyeler yüklenemedi: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const { title, blocks = [] } = await req.json();

    const story = await prisma.story.create({
      data: {
        title: title || 'Yeni Microlearning Hikâyesi',
        creatorId: session.userId,
        blocks: {
          create: blocks.map((b: any, idx: number) => ({
            orderIndex: idx,
            type: b.type || 'TEXT',
            title: b.title || '',
            content: b.content || '',
            questionJson: b.questionJson ? JSON.stringify(b.questionJson) : null,
          })),
        },
      },
      include: { blocks: true },
    });

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    return NextResponse.json({ error: 'Hikâye oluşturulamadı: ' + error.message }, { status: 500 });
  }
}
