import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'STUDENT' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tüm alanların doldurulması zorunludur.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role.toUpperCase(),
        plan: 'FREE',
        profile: {
          create: {
            title: role === 'TEACHER' ? 'Öğretmen' : 'Öğrenci',
            language: 'tr',
          },
        },
      },
    });

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
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Kayıt olurken bir hata oluştu.' }, { status: 500 });
  }
}
