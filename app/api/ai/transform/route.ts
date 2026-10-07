import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai/service';

export async function POST(req: NextRequest) {
  try {
    const { action, questions, topic } = await req.json();

    if (action === 'FLASHCARDS') {
      const flashcards = await AIService.generateFlashcards(topic || 'Ders Konusu', 5);
      return NextResponse.json({ success: true, flashcards });
    }

    if (action === 'STORY') {
      const storyBlocks = await AIService.generateStory(topic || 'Ders Konusu');
      return NextResponse.json({ success: true, storyBlocks });
    }

    if (['MAKE_HARDER', 'MAKE_EASIER', 'IMPROVE_DISTRACTORS'].includes(action)) {
      const transformed = await AIService.transformQuestions(questions || [], action);
      return NextResponse.json({ success: true, questions: transformed });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'İşlem başarısız: ' + error.message }, { status: 500 });
  }
}
