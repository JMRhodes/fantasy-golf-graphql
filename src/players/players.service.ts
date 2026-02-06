import { Inject, Injectable } from '@nestjs/common';
import { Player } from './schemas/player.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, sql, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { playersTable, resultsTable } from '../db/schema';
import { CreatePlayerInput } from './dtos/create-player.input';
/**
 * The service for managing players.
 * @constructor
 * @Injectableparam playerModel - The Mongoose model for the Player schema.
 */
@Injectable()
export class PlayersService {
  constructor(
    @Inject('DB_DEV')
    private drizzleDev: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Retrieves all players from the database, sorted by total points.
   *
   * @returns
   */
  async getAllPlayers(): Promise<Player[]> {
    const players = await this.drizzleDev
      .select({
        id: playersTable.id,
        name: playersTable.name,
        pgaId: playersTable.pgaId,
        salary: playersTable.salary,
        avatarUrl: playersTable.avatarUrl,
        totalPoints: sql<number>`COALESCE(SUM(${resultsTable.points}), 0)`.as(
          'totalPoints',
        ),
        totalWins:
          sql<number>`COALESCE(SUM(CASE WHEN ${resultsTable.position} = '1' THEN 1 ELSE 0 END), 0)`.as(
            'totalWins',
          ),
      })
      .from(playersTable)
      .leftJoin(resultsTable, eq(playersTable.id, resultsTable.playerId))
      .groupBy(playersTable.id)
      .orderBy(desc(sql`"totalPoints"`));

    return players as Player[];
  }

  async getPlayerTotalPoints(playerId: string): Promise<number> {
    const results = await this.drizzleDev
      .select()
      .from(resultsTable)
      .where(eq(resultsTable.playerId, playerId));

    if (results.length > 0) {
      return results.reduce((sum, result) => sum + result.points, 0);
    }

    return 0;
  }

  async createPlayer(playerData: CreatePlayerInput): Promise<Player> {
    const result = await this.drizzleDev
      .insert(playersTable)
      .values(playerData)
      .returning();

    return result[0] as Player;
  }
}
