import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/service';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    // Allow users or demo users to test AI generation
    const body = await req.json();
    const {
      topic = 'Türk Dili ve Edebiyatı',
      gradeLevel = 10,
      subject = 'Türk Dili ve Edebiyatı',
      difficulty = 'MEDIUM',
      questionCount = 5,
      sourceText = '',
      documentType = 'TOPIC',
    } = body;

    const result = await AIService.generateQuiz({
      topic,
      gradeLevel: parseInt(gradeLevel, 10),
      subject,
      difficulty,
      questionCount: parseInt(questionCount, 10),
      sourceText,
      documentType,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('AI generation API error:', error);
    return NextResponse.json({ error: 'AI quiz üretimi sırasında hata oluştu: ' + error.message }, { status: 500 });
  }
}
