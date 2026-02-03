import { Inject, Injectable } from '@nestjs/common';
import { Player } from './schemas/player.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { playersTable } from '../db/schema';
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
   * Retrieves all players from the database.
   *
   * @returns
   */
  async getAllPlayers(): Promise<Player[]> {
    const players = await this.drizzleDev.select().from(playersTable);
    return players as Player[];
  }

  async createPlayer(playerData: CreatePlayerInput): Promise<Player> {
    const result = await this.drizzleDev
      .insert(playersTable)
      .values(playerData)
      .returning();

    return result[0] as Player;
  }
}
