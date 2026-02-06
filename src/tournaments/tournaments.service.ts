import { Inject, Injectable } from '@nestjs/common';
import { Tournament } from './schemas/tournament.schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { tournamentsTable } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { CreateTournamentInput } from './dtos/create-tournament.dto';

/**
 * The service for managing tournaments.
 * @constructor
 * @Injectableparam tournamentModel - The Mongoose model for the Tournament schema.
 */
@Injectable()
export class TournamentService {
  constructor(
    @Inject('DB_DEV')
    private drizzleDev: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Retrieves all tournaments from the database.
   *
   * @returns
   */
  async getAllTournaments(): Promise<Tournament[]> {
    const tournaments = await this.drizzleDev
      .select()
      .from(tournamentsTable)
      .orderBy(desc(tournamentsTable.startDate));
    return tournaments as Tournament[];
  }

  /**
   * Retrieves a tournament by their ID.
   *
   * @param id - The ID of the tournament to retrieve.
   * @throws Error if the tournament is not found.
   * @returns
   */
  async getTournamentById(id: string): Promise<Tournament> {
    const tournaments = await this.drizzleDev
      .select()
      .from(tournamentsTable)
      .where(eq(tournamentsTable.id, id))
      .limit(1);

    const tournament = tournaments[0];

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    return tournament as Tournament;
  }

  async createTournament(
    tournamentData: CreateTournamentInput,
  ): Promise<Tournament> {
    const result = await this.drizzleDev
      .insert(tournamentsTable)
      .values(tournamentData)
      .returning();

    return result[0] as Tournament;
  }
}
