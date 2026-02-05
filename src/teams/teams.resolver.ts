import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
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

  @Mutation(() => Team)
  async createTeam(
    @Args('createTeamInput') createTeamInput: CreateTeamInput,
  ): Promise<Team> {
    return this.teamsService.createTeam(createTeamInput);
  }
}
