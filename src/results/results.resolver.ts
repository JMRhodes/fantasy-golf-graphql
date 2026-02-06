import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Result } from './schemas/result.schema';
import { ResultsService } from './results.service';
import { CreateResultInput } from './dtos/create-result.input';
import { CreateResultsBulkInput } from './dtos/create-results-bulk.input';

@Resolver(() => Result)
export class ResultsResolver {
  constructor(private resultsService: ResultsService) {}

  @Query(() => [Result])
  async getAllResults(): Promise<Result[]> {
    return this.resultsService.getAllResults();
  }

  @Query(() => Result, { nullable: true })
  async getResultById(@Args('id') id: string): Promise<Result | null> {
    return this.resultsService.getResultById(id);
  }

  @Query(() => [Result])
  async getResultsByTournamentId(
    @Args('tournamentId') tournamentId: string,
  ): Promise<Result[]> {
    return this.resultsService.getResultsByTournamentId(tournamentId);
  }

  @Query(() => [Result])
  async getResultsByPlayerId(
    @Args('playerId') playerId: string,
  ): Promise<Result[]> {
    return this.resultsService.getResultsByPlayerId(playerId);
  }

  @Mutation(() => Result)
  async createResult(
    @Args('createResultInput') createResultInput: CreateResultInput,
  ): Promise<Result> {
    return this.resultsService.createResult(createResultInput);
  }

  @Mutation(() => [Result])
  async createResultsBulk(
    @Args('createResultsBulkInput')
    createResultsBulkInput: CreateResultsBulkInput,
  ): Promise<Result[]> {
    return this.resultsService.createResultsBulk(createResultsBulkInput);
  }
}
