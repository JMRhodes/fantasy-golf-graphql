import { Args, Mutation, Resolver } from '@nestjs/graphql';
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
}
