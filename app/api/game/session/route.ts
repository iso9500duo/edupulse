import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Serverless-compatible real-time game state store
const globalGameState = globalThis as unknown as {
  serverlessGameRooms: Map<string, any>;
};

if (!globalGameState.serverlessGameRooms) {
  globalGameState.serverlessGameRooms = new Map();
}

const rooms = globalGameState.serverlessGameRooms;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get('pin');

  if (!pin) {
    return NextResponse.json({ error: 'PIN zorunludur' }, { status: 400 });
  }

  let room = rooms.get(pin);
  if (!room) {
    // Try to restore from database
    const dbSession = await prisma.gameSession.findUnique({
      where: { pin },
      include: {
        quiz: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!dbSession) {
      return NextResponse.json({ error: 'Oyun bulunamadı' }, { status: 404 });
    }

    room = {
      pin,
      status: dbSession.status,
      participants: [],
      currentQuestionIndex: 0,
      questionStartedAt: Date.now(),
      answers: {},
      reactions: [],
      quiz: dbSession.quiz,
    };
    rooms.set(pin, room);
  }

  return NextResponse.json({ room });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin, data } = body;

    if (!pin) {
      return NextResponse.json({ error: 'PIN zorunludur' }, { status: 400 });
    }

    let room = rooms.get(pin);
    if (!room) {
      // Initialize room
      room = {
        pin,
        status: 'LOBBY',
        participants: [],
        currentQuestionIndex: 0,
        questionStartedAt: null,
        answers: {},
        reactions: [],
      };
      rooms.set(pin, room);
    }

    if (action === 'JOIN') {
      const { nickname, avatar, userId } = data;
      let existing = room.participants.find((p: any) => p.nickname === nickname);
      if (!existing) {
        existing = {
          nickname,
          avatar: avatar || '🦊',
          userId: userId || null,
          score: 0,
          streak: 0,
          rank: 1,
        };
        room.participants.push(existing);
      }
      return NextResponse.json({ success: true, participant: existing, room });
    }

    if (action === 'START_GAME') {
      room.status = 'QUESTION_ACTIVE';
      room.currentQuestionIndex = 0;
      room.questionStartedAt = Date.now();
      room.answers = {};
      return NextResponse.json({ success: true, room });
    }

    if (action === 'NEXT_QUESTION') {
      room.status = 'QUESTION_ACTIVE';
      room.currentQuestionIndex = data.questionIndex;
      room.questionStartedAt = Date.now();
      room.answers = {};
      return NextResponse.json({ success: true, room });
    }

    if (action === 'SUBMIT_ANSWER') {
      const { nickname, selectedOptionId, isCorrect, timeTakenMs, basePoints } = data;
      const participant = room.participants.find((p: any) => p.nickname === nickname);
      if (participant) {
        let pointsEarned = 0;
        if (isCorrect) {
          participant.streak += 1;
          const streakBonus = Math.min(participant.streak * 50, 250);
          const speedFactor = Math.max(0.2, (20000 - Math.min(timeTakenMs, 20000)) / 20000);
          pointsEarned = Math.round((basePoints || 1000) * speedFactor) + streakBonus;
          participant.score += pointsEarned;
        } else {
          participant.streak = 0;
        }

        room.answers[nickname] = {
          selectedOptionId,
          isCorrect,
          pointsEarned,
        };

        // Recalculate ranks
        room.participants.sort((a: any, b: any) => b.score - a.score);
        room.participants.forEach((p: any, idx: number) => {
          p.rank = idx + 1;
        });

        return NextResponse.json({
          success: true,
          pointsEarned,
          currentScore: participant.score,
          streak: participant.streak,
          rank: participant.rank,
        });
      }
    }

    if (action === 'SHOW_RESULTS') {
      room.status = 'QUESTION_RESULT';
      return NextResponse.json({ success: true, room });
    }

    if (action === 'SHOW_LEADERBOARD') {
      room.status = 'LEADERBOARD';
      return NextResponse.json({ success: true, room });
    }

    if (action === 'SHOW_PODIUM') {
      room.status = 'PODIUM';
      return NextResponse.json({ success: true, room });
    }

    if (action === 'REACTION') {
      const newReaction = {
        id: Math.random().toString(),
        emoji: data.emoji,
        nickname: data.nickname,
      };
      room.reactions = [...(room.reactions || []).slice(-15), newReaction];
      return NextResponse.json({ success: true, reaction: newReaction });
    }

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
