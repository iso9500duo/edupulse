import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Lütfen önce giriş yapınız.' }, { status: 401 });
    }

    const { plan = 'PRO' } = await req.json();

    if (!['FREE', 'PRO', 'SCHOOL', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Geçersiz abonelik planı.' }, { status: 400 });
    }

    // 1 Month from now
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { plan },
    });

    // Record subscription
    await prisma.subscription.create({
      data: {
        userId: session.userId,
        plan,
        status: 'ACTIVE',
        currentPeriodEnd,
        stripeCustomerId: `cus_mock_${session.userId.substring(0, 8)}`,
        stripeSubscriptionId: `sub_mock_${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${plan} aboneliğiniz başarıyla etkinleştirildi!`,
      plan: updatedUser.plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Abonelik işlemi başarısız: ' + error.message }, { status: 500 });
  }
}
