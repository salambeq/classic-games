import { db, EndpointError } from 'sdk';
import { eq, and } from 'sdk/db';
import { leaderboards } from '../schema.js';

export default async function (input, ctx) {
  const user = ctx.initData?.user;
  if (!user) {
    throw new EndpointError('Unauthorized', { code: 'UNAUTHORIZED' });
  }

  const { gameId, score } = input || {};
  if (!gameId || typeof score !== 'number') {
    throw new EndpointError('Invalid parameters', { code: 'BAD_REQUEST' });
  }

  const userName = user.username ? `@${user.username}` : user.first_name || 'Player';

  const existing = await db
    .select()
    .from(leaderboards)
    .where(and(eq(leaderboards.userId, user.id), eq(leaderboards.gameId, gameId)))
    .get();

  if (existing) {
    if (score > existing.score) {
      await db
        .update(leaderboards)
        .set({ score, userName })
        .where(eq(leaderboards.id, existing.id))
        .run();
    }
  } else {
    await db
      .insert(leaderboards)
      .values({
        userId: user.id,
        userName,
        gameId,
        score
      })
      .run();
  }

  return { ok: true, score };
}
