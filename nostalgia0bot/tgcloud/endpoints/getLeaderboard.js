import { db } from 'sdk';
import { eq, desc } from 'sdk/db';
import { leaderboards } from '../schema.js';

export default async function (input) {
  const { gameId } = input || {};
  let query = db.select().from(leaderboards);

  if (gameId) {
    query = query.where(eq(leaderboards.gameId, gameId));
  }

  const list = await query
    .orderBy(desc(leaderboards.score))
    .limit(30)
    .all();

  return { leaderboard: list };
}
