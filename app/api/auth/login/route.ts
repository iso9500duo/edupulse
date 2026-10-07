import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, demoRole } = await req.json();

    let user;

    // Fast Demo Login Handler
    if (demoRole) {
      const demoEmail =
        demoRole === 'TEACHER'
          ? 'ogretmen@edupulse.com'
          : demoRole === 'ADMIN'
          ? 'admin@edupulse.com'
          : 'ogrenci@edupulse.com';

      user = await prisma.user.findUnique({
        where: { email: demoEmail },
        include: { profile: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'Demo kullanıcısı bulunamadı.' }, { status: 404 });
      }
    } else {
      if (!email || !password) {
        return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
      }

      user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
      }
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
      plan: user.plan,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        plan: user.plan,
      },
    });

    response.cookies.set({
      name: 'edupulse_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Giriş yapılırken sunucu hatası oluştu.' }, { status: 500 });
  }
}
