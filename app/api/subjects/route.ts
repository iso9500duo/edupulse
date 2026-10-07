import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subjects: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: 'Müfredat bilgileri alınamadı.' }, { status: 500 });
  }
}
