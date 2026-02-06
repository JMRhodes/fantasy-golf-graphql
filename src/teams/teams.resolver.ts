import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Team } from './schemas/team.schema';
import { TeamsService } from './teams.service';
import { CreateTeamInput } from './dtos/create-team.input';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private teamsService: TeamsService) {}

  @Query(() => [Team])
  async getAllTeams(): Promise<Team[]> {
    return this.teamsService.getAllTeams();
  }

  @Query(() => Team, { nullable: true })
  async getTeamById(@Args('id') id: string): Promise<Team | null> {
    return this.teamsService.getTeamById(id);
  }

  @Query(() => [Team])
  async getTeamsByOwnerId(@Args('ownerId') ownerId: string): Promise<Team[]> {
    return this.teamsService.getTeamsByOwnerId(ownerId);
  }

  /**
   * Leaderboard query - returns teams sorted by total points (highest first)
   * with computed totalPoints and rank fields
   */
  @Query(() => [Team], {
    description: 'Get leaderboard with teams ranked by total points',
  })
  async leaderboard(): Promise<Team[]> {
    return this.teamsService.getLeaderboard();
  }

  @Mutation(() => Team)
  async createTeam(
    @Args('createTeamInput') createTeamInput: CreateTeamInput,
  ): Promise<Team> {
    return this.teamsService.createTeam(createTeamInput);
  }

  /**
   * Field resolver for totalPoints
   * Returns pre-computed value from service, or calculates on-the-fly for other queries
   */
  @ResolveField(() => Number, { nullable: true })
  totalPoints(@Parent() team: Team): number {
    // If already computed (from leaderboard query), return it
    if (team.totalPoints !== undefined) {
      return team.totalPoints;
    }
    // Otherwise calculate it (for individual team queries)
    return this.teamsService.calculateTeamTotalPoints(team);
  }

  /**
   * Field resolver for rank
   * Returns pre-computed rank from leaderboard query, or null for other queries
   */
  @ResolveField(() => Number, { nullable: true })
  rank(@Parent() team: Team): number | null {
    // Rank is only computed in leaderboard query context
    return team.rank ?? null;
  }
}
