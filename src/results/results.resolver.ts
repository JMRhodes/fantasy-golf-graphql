import { Result } from './schemas/result.schema';
import { Resolver, Query } from '@nestjs/graphql';
import { ResultService } from './results.service';
import { GraphQLError } from 'graphql';

/**
 * Resolver for the Result entity
 * @description This resolver handles all the GraphQL queries and mutations for the Result entity
 */
@Resolver(() => Result)
export class ResultResolver {
  constructor(private resultService: ResultService) {}
  /**
   * Fetches all results from the database
   * @returns
   */
  @Query(() => [Result])
  async getAllResults(): Promise<Result[]> {
    try {
      const results = await this.resultService.getAllResults();
      return results;
    } catch {
      throw new GraphQLError('Failed to fetch results');
    }
  }

  // /**
  //  * Fetches a collection of results by tournament id
  //  * @param Args id - The id of the tournament to retrieve results for
  //  * @returns
  //  */
  // @Query(() => [Result])
  // async getResultByTournamentId(
  //   @Args('id', { type: () => ID }) id: string,
  // ): Promise<Result[]> {
  //   try {
  //     const results = await this.resultService.getResultsByTournamentId(id);
  //     return results;
  //   } catch {
  //     throw new Error('Failed to fetch results for the tournament');
  //   }
  // }
}
