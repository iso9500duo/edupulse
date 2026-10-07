const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Socket.io initialization
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // In-memory active game rooms for ultra-fast low-latency state synchronization
  const rooms = new Map();

  io.on('connection', (socket) => {
    // 1. Odaya Katılma (Host veya Oyuncu)
    socket.on('join_game', ({ pin, role, nickname, avatar, userId }) => {
      const roomKey = `game_${pin}`;
      socket.join(roomKey);

      if (!rooms.has(pin)) {
        rooms.set(pin, {
          pin,
          hostSocketId: role === 'host' ? socket.id : null,
          status: 'LOBBY',
          participants: [],
          currentQuestionIndex: 0,
          questionStartedAt: null,
          answers: {},
        });
      }

      const room = rooms.get(pin);

      if (role === 'host') {
        room.hostSocketId = socket.id;
        socket.emit('game_state_sync', room);
      } else {
        // Öğrenci katıldı
        let existing = room.participants.find((p) => p.nickname === nickname);
        if (!existing) {
          existing = {
            id: socket.id,
            nickname: nickname || `Oyuncu_${Math.floor(100 + Math.random() * 900)}`,
            avatar: avatar || 'fox',
            userId: userId || null,
            score: 0,
            streak: 0,
            rank: 1,
            isOnline: true,
          };
          room.participants.push(existing);
        } else {
          existing.id = socket.id;
          existing.isOnline = true;
        }

        io.to(roomKey).emit('player_joined', {
          participant: existing,
          totalPlayers: room.participants.length,
          participants: room.participants,
        });

        socket.emit('join_success', {
          participant: existing,
          gameState: room.status,
          currentQuestionIndex: room.currentQuestionIndex,
        });
      }
    });

    // 2. Oyunu Başlatma (Host)
    socket.on('start_game', ({ pin }) => {
      const room = rooms.get(pin);
      if (room) {
        room.status = 'QUESTION_ACTIVE';
        room.currentQuestionIndex = 0;
        room.questionStartedAt = Date.now();
        room.answers = {};

        io.to(`game_${pin}`).emit('game_started', {
          currentQuestionIndex: 0,
          questionStartedAt: room.questionStartedAt,
        });
      }
    });

    // 3. Sıradaki Soruya Geçiş (Host)
    socket.on('next_question', ({ pin, questionIndex }) => {
      const room = rooms.get(pin);
      if (room) {
        room.status = 'QUESTION_ACTIVE';
        room.currentQuestionIndex = questionIndex;
        room.questionStartedAt = Date.now();
        room.answers = {};

        io.to(`game_${pin}`).emit('question_changed', {
          questionIndex,
          questionStartedAt: room.questionStartedAt,
        });
      }
    });

    // 4. Öğrenci Cevap Gönderme
    socket.on('submit_answer', ({ pin, nickname, selectedOptionId, timeTakenMs, isCorrect, basePoints }) => {
      const room = rooms.get(pin);
      if (room) {
        const participant = room.participants.find((p) => p.nickname === nickname);
        if (participant) {
          // Puan ve hız bonusu hesabı
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
            timeTakenMs,
          };

          // Skorları yeniden sırala
          room.participants.sort((a, b) => b.score - a.score);
          room.participants.forEach((p, idx) => {
            p.rank = idx + 1;
          });

          // Cevap verene bildirim
          socket.emit('answer_processed', {
            isCorrect,
            pointsEarned,
            currentScore: participant.score,
            streak: participant.streak,
            rank: participant.rank,
          });

          // Host'a canlı cevap sayısı bildirimi
          io.to(`game_${pin}`).emit('answer_count_update', {
            answeredCount: Object.keys(room.answers).length,
            totalPlayers: room.participants.length,
            selectedOptionId,
          });
        }
      }
    });

    // 5. Soru Sonuçlarını Gösterme (Host)
    socket.on('show_question_results', ({ pin, correctOptionId }) => {
      const room = rooms.get(pin);
      if (room) {
        room.status = 'QUESTION_RESULT';
        io.to(`game_${pin}`).emit('question_results', {
          correctOptionId,
          answers: room.answers,
          participants: room.participants,
        });
      }
    });

    // 6. Lider Tablosunu Gösterme (Host)
    socket.on('show_leaderboard', ({ pin }) => {
      const room = rooms.get(pin);
      if (room) {
        room.status = 'LEADERBOARD';
        io.to(`game_${pin}`).emit('leaderboard_update', {
          leaderboard: room.participants.slice(0, 10),
        });
      }
    });

    // 7. Podyum / Final Ekranı (Host)
    socket.on('show_podium', ({ pin }) => {
      const room = rooms.get(pin);
      if (room) {
        room.status = 'PODIUM';
        const top3 = room.participants.slice(0, 3);
        io.to(`game_${pin}`).emit('podium_celebration', {
          winners: top3,
          allParticipants: room.participants,
        });
      }
    });

    // 8. Reaksiyon / Canlı Emojiler
    socket.on('send_reaction', ({ pin, emoji, nickname }) => {
      io.to(`game_${pin}`).emit('reaction_received', {
        id: Math.random().toString(),
        emoji,
        nickname,
        timestamp: Date.now(),
      });
    });

    // 9. Ayrılma / Disconnect
    socket.on('disconnect', () => {
      rooms.forEach((room, pin) => {
        const participant = room.participants.find((p) => p.id === socket.id);
        if (participant) {
          participant.isOnline = false;
          io.to(`game_${pin}`).emit('player_left', {
            nickname: participant.nickname,
            totalPlayers: room.participants.filter((p) => p.isOnline).length,
          });
        }
      });
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> 🚀 EduPulse hazır: http://${hostname}:${port}`);
    console.log(`> ⚡ Gerçek zamanlı WebSocket motoru aktif (Port: ${port})`);
  });
});
