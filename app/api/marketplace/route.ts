import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const items = await prisma.marketplaceItem.findMany({
      where: { status: 'APPROVED' },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        quiz: {
          select: {
            id: true,
            title: true,
            subject: { select: { name: true } },
            _count: { select: { questions: true } },
          },
        },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: 'Marketplace verileri yüklenemedi: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    const { action, itemId, quizId, title, description, price } = await req.json();

    if (action === 'BUY') {
      const item = await prisma.marketplaceItem.findUnique({ where: { id: itemId } });
      if (!item) {
        return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
      }

      await prisma.purchase.create({
        data: {
          userId: session.userId,
          itemId: item.id,
          amount: item.price,
        },
      });

      await prisma.marketplaceItem.update({
        where: { id: item.id },
        data: { salesCount: { increment: 1 } },
      });

      return NextResponse.json({ success: true, message: 'İçerik paketi başarıyla satın alındı ve kütüphanenize eklendi!' });
    }

    // Sell / Publish item to marketplace
    if (!title || !quizId) {
      return NextResponse.json({ error: 'Başlık ve Quiz seçimi zorunludur.' }, { status: 400 });
    }

    const newItem = await prisma.marketplaceItem.create({
      data: {
        creatorId: session.userId,
        quizId,
        title,
        description: description || '',
        price: parseFloat(price) || 0,
        status: 'APPROVED',
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json({ error: 'Marketplace işlemi başarısız: ' + error.message }, { status: 500 });
  }
}
