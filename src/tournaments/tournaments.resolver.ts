import { Tournament } from './schemas/tournament.schema';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TournamentService } from './tournaments.service';
import { CreateTournamentInput } from './dtos/create-tournament.dto';
import { Result } from '../results/schemas/result.schema';
import { ResultsService } from '../results/results.service';

/**
 * Resolver for the Tournament entity
 * @description This resolver handles all the GraphQL queries and mutations for the Tournament entity
 */
@Resolver(() => Tournament)
export class TournamentResolver {
  constructor(
    private tournamentService: TournamentService,
    private resultsService: ResultsService,
  ) {}

  /**
   * Fetches all tournaments from the database
   * @returns
   */
  @Query(() => [Tournament])
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      const tournaments = await this.tournamentService.getAllTournaments();
      return tournaments;
    } catch (error) {
      throw new Error('Failed to fetch tournaments', { cause: error });
    }
  }

  @Query(() => Tournament)
  async getTournamentById(@Args('id') id: string): Promise<Tournament> {
    try {
      const tournament = await this.tournamentService.getTournamentById(id);
      return tournament;
    } catch (error) {
      throw new Error('Failed to fetch tournament by ID', { cause: error });
    }
  }

  @ResolveField('results', () => [Result])
  async results(@Parent() tournament: Tournament): Promise<Result[]> {
    return this.resultsService.getResultsByTournamentId(tournament.id);
  }

  /**
   * Creates a new tournament
   *
   * @param createTournamentInput
   * @returns
   */
  @Mutation(() => Tournament)
  async createTournament(
    @Args('createTournamentInput') createTournamentInput: CreateTournamentInput,
  ): Promise<Tournament> {
    try {
      // Implementation for creating a tournament goes here
      const tournament = await this.tournamentService.createTournament(
        createTournamentInput,
      );
      return tournament;
    } catch (error) {
      throw new Error('Failed to create tournament', { cause: error });
    }
  }
}
