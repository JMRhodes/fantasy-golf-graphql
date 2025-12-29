import { Tournament } from './schemas/tournament.schema';
import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { TournamentService } from './tournaments.service';
import { CreateTournamentInput } from './dtos/create-tournament.dto';

/**
 * Resolver for the Tournament entity
 * @description This resolver handles all the GraphQL queries and mutations for the Tournament entity
 */
@Resolver(() => Tournament)
export class TournamentResolver {
  constructor(private tournamentService: TournamentService) {}
  /**
   * Fetches all tournaments from the database
   * @returns
   */
  @Query(() => [Tournament])
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      const tournaments = await this.tournamentService.getAllTournaments();
      return tournaments;
    } catch {
      throw new Error('Failed to fetch tournaments');
    }
  }

  /**
   * Fetches a single tournament by id
   * @param Args id
   * @returns
   */
  @Query(() => Tournament)
  async getTournament(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Tournament> {
    const tournament = await this.tournamentService.getTournamentById(id);
    return tournament;
  }

  /**
   * Creates a new tournament in the database
   * @param createTournamentData - The data for the new tournament
   * @returns
   */
  @Mutation(() => Tournament)
  async createTournament(
    @Args('createTournamentData') createTournamentData: CreateTournamentInput,
  ): Promise<Tournament> {
    const tournament =
      await this.tournamentService.createTournament(createTournamentData);
    return tournament;
  }
}
