import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateTelegramInitData } from '../src/tma/telegram-auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';

app.use(cors());
app.use(express.json());

interface ScoreRecord {
  userId: number;
  userName: string;
  gameId: string;
  score: number;
  timestamp: number;
}

// In-memory хранилище лучших счетов (для продакшена может быть SQLite/Postgres/D1)
const leaderboard: ScoreRecord[] = [];

// Middleware проверки подписи Telegram Mini App
const requireTelegramAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const initData = req.header('X-Telegram-Init-Data') || req.body?.initData;

  if (!initData) {
    res.status(401).json({ error: 'Missing Telegram initData' });
    return;
  }

  if (!botToken) {
    // В dev-режиме без токена логируем предупреждение
    console.warn('BOT_TOKEN not configured on server');
    (req as any).telegramUser = { id: 123456, first_name: 'Player' };
    next();
    return;
  }

  const result = await validateTelegramInitData(initData, botToken);
  if (!result.valid || !result.user) {
    res.status(401).json({ error: result.error || 'Invalid signature or expired auth_date' });
    return;
  }

  (req as any).telegramUser = result.user;
  next();
};

// GET /api/leaderboard - получение топа по игре
app.get('/api/leaderboard', (req, res) => {
  const { gameId } = req.query;
  let records = leaderboard;
  if (gameId) {
    records = records.filter(r => r.gameId === gameId);
  }

  const sorted = [...records]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  res.json({ leaderboard: sorted });
});

// POST /api/score - сохранение нового рекорда с обязательной авторизацией
app.post('/api/score', requireTelegramAuth, (req, res) => {
  const user = (req as any).telegramUser;
  const { gameId, score } = req.body;

  if (!gameId || typeof score !== 'number') {
    res.status(400).json({ error: 'Invalid gameId or score' });
    return;
  }

  const existingIdx = leaderboard.findIndex(
    r => r.userId === user.id && r.gameId === gameId
  );

  const userName = user.username 
    ? `@${user.username}` 
    : user.first_name || 'Anonymous';

  if (existingIdx >= 0) {
    if (score > leaderboard[existingIdx].score) {
      leaderboard[existingIdx].score = score;
      leaderboard[existingIdx].timestamp = Date.now();
    }
  } else {
    leaderboard.push({
      userId: user.id,
      userName,
      gameId,
      score,
      timestamp: Date.now()
    });
  }

  res.json({ success: true, userHighScore: score });
});

app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'retro-arcade-server' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 API сервер ретро-игр запущен на http://localhost:${port}`);
  });
}

export default app;
