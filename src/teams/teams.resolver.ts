import { Args, Mutation, Resolver, Query, ID } from '@nestjs/graphql';
import { Team } from './schemas/team.schema';
import { TeamsService } from './teams.service';
import { CreateTeamInput } from './dtos/create-team.input';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private teamsService: TeamsService) {}

  @Mutation(() => Team)
  async createTeam(
    @Args('createTeamInput') createTeamInput: CreateTeamInput,
  ): Promise<Team> {
    const team = await this.teamsService.createTeam(createTeamInput);
    return team;
  }

  @Mutation(() => [Team])
  async createTeams(
    @Args('createTeamInputs', { type: () => [CreateTeamInput] })
    createTeamInputs: CreateTeamInput[],
  ): Promise<Team[]> {
    try {
      const teams = await this.teamsService.createTeams(createTeamInputs);
      return teams;
    } catch (error) {
      throw new Error('Failed to create teams', { cause: error });
    }
  }

  @Query(() => [Team])
  async getAllTeams(): Promise<Team[]> {
    try {
      const teams = await this.teamsService.getAllTeams();
      return teams;
    } catch {
      throw new Error('Failed to fetch results');
    }
  }

  @Query(() => Team)
  async getTeamById(@Args('id', { type: () => ID }) id: string): Promise<Team> {
    try {
      const team = await this.teamsService.getTeamById(id);
      return team;
    } catch {
      throw new Error('Failed to fetch team');
    }
  }

  /**
   * Delete a team by its ID
   */
  @Mutation(() => Boolean)
  async deleteTeam(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    try {
      await this.teamsService.deleteTeamById(id);
      return true;
    } catch {
      throw new Error('Failed to delete team');
    }
  }
}
