import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'GLOBAL'; // GLOBAL, WEEKLY, SCHOOL

    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        streak: true,
        school: { select: { name: true } },
      },
      orderBy: { xp: 'desc' },
      take: 20,
    });

    const leaderboard = users.map((u, idx) => ({
      rank: idx + 1,
      ...u,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lider tablosu yüklenemedi: ' + error.message }, { status: 500 });
  }
}
