import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya yüklenmedi.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Clean filename
    const ext = path.extname(file.name);
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    await writeFile(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    // Record in media files if logged in
    if (session) {
      await prisma.mediaFile.create({
        data: {
          userId: session.userId,
          filename: file.name,
          url: publicUrl,
          sizeBytes: buffer.length,
          mimeType: file.type || 'application/octet-stream',
          category: file.type.startsWith('image/')
            ? 'IMAGE'
            : file.type.startsWith('video/')
            ? 'VIDEO'
            : file.type.startsWith('audio/')
            ? 'AUDIO'
            : 'PDF',
        },
      });
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Dosya yüklenirken hata oluştu: ' + error.message }, { status: 500 });
  }
}
