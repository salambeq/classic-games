import { table, integer, text, index, sql } from 'sdk/db';

export const leaderboards = table('leaderboards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  userName: text('user_name').notNull(),
  gameId: text('game_id').notNull(),
  score: integer('score').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  userGameIdx: index('idx_user_game').on(t.userId, t.gameId),
  gameScoreIdx: index('idx_game_score').on(t.gameId, t.score),
}));
