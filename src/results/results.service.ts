import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import { resultsTable } from '../db/schema';
import { Result } from './schemas/result.schema';
import { CreateResultInput } from './dtos/create-result.input';
import { CreateResultsBulkInput } from './dtos/create-results-bulk.input';

@Injectable()
export class ResultsService {
  constructor(
    @Inject('DB_DEV')
    private drizzleDev: PostgresJsDatabase<typeof schema>,
  ) {}

  async getAllResults(): Promise<Result[]> {
    const results = await this.drizzleDev.query.resultsTable.findMany({
      with: {
        player: true,
        tournament: true,
      },
    });
    return results as Result[];
  }

  async getResultById(id: string): Promise<Result | null> {
    const result = await this.drizzleDev.query.resultsTable.findFirst({
      where: eq(resultsTable.id, id),
      with: {
        player: true,
        tournament: true,
      },
    });
    return (result as Result) || null;
  }

  async getResultsByTournamentId(tournamentId: string): Promise<Result[]> {
    const results = await this.drizzleDev.query.resultsTable.findMany({
      where: eq(resultsTable.tournamentId, tournamentId),
      with: {
        player: true,
      },
      orderBy: desc(resultsTable.points),
    });
    return results as Result[];
  }

  async getResultsByPlayerId(playerId: string): Promise<Result[]> {
    const results = await this.drizzleDev.query.resultsTable.findMany({
      where: eq(resultsTable.playerId, playerId),
      with: {
        tournament: true,
      },
    });
    return results as Result[];
  }

  async createResult(resultData: CreateResultInput): Promise<Result> {
    const [newResult] = await this.drizzleDev
      .insert(resultsTable)
      .values(resultData)
      .returning();

    return this.getResultById(newResult.id) as Promise<Result>;
  }

  async createResultsBulk(input: CreateResultsBulkInput): Promise<Result[]> {
    const { tournamentId, results } = input;

    const values = results.map((r) => ({
      tournamentId,
      playerId: r.playerId,
      position: r.position,
      points: r.points,
    }));

    await this.drizzleDev.insert(resultsTable).values(values);

    return this.getResultsByTournamentId(tournamentId);
  }
}
