import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
    }

    if (session.role === 'TEACHER' || session.role === 'ADMIN') {
      const classes = await prisma.class.findMany({
        where: session.role === 'TEACHER' ? { teacherId: session.userId } : {},
        include: {
          members: {
            include: {
              student: {
                select: { id: true, name: true, email: true, xp: true, level: true },
              },
            },
          },
          assignments: {
            select: { id: true, title: true, code: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ classes });
    } else {
      // Student view: classes they belong to
      const memberships = await prisma.classMember.findMany({
        where: { studentId: session.userId },
        include: {
          class: {
            include: {
              teacher: { select: { name: true } },
              assignments: true,
            },
          },
        },
      });
      const classes = memberships.map((m) => m.class);
      return NextResponse.json({ classes });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Sınıflar getirilemedi: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapınız.' }, { status: 401 });
    }

    const { name, gradeLevel, joinCode } = await req.json();

    // If joining a class with code (for students)
    if (joinCode) {
      const targetClass = await prisma.class.findUnique({ where: { code: joinCode } });
      if (!targetClass) {
        return NextResponse.json({ error: 'Sınıf kodu bulunamadı.' }, { status: 404 });
      }

      const existing = await prisma.classMember.findUnique({
        where: {
          classId_studentId: {
            classId: targetClass.id,
            studentId: session.userId,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'Zaten bu sınıfa kayıtlısınız.' }, { status: 400 });
      }

      await prisma.classMember.create({
        data: {
          classId: targetClass.id,
          studentId: session.userId,
        },
      });

      return NextResponse.json({ success: true, message: `${targetClass.name} sınıfına başarıyla katıldınız!` });
    }

    // Creating a class (for teachers)
    if (session.role !== 'TEACHER' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sınıf oluşturma yetkiniz yok.' }, { status: 403 });
    }

    const code = `CLS-${name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newClass = await prisma.class.create({
      data: {
        name,
        gradeLevel: parseInt(gradeLevel, 10) || 10,
        code,
        teacherId: session.userId,
      },
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error: any) {
    return NextResponse.json({ error: 'Sınıf işlemi başarısız: ' + error.message }, { status: 500 });
  }
}
