import { Player } from './schemas/player.schema';
import { Resolver, Query, Args, Mutation, ID } from '@nestjs/graphql';
import { CreatePlayerInput } from './dtos/create-player.input';
import { PlayersService } from './players.service';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private playersService: PlayersService) {}

  @Query(() => [Player])
  async getAllPlayers(): Promise<Player[]> {
    try {
      const players = await this.playersService.getAllPlayers();
      return players;
    } catch {
      throw new Error('Failed to fetch players');
    }
  }

  @Query(() => Player)
  async getPlayer(@Args('id', { type: () => ID }) id: string): Promise<Player> {
    const player = await this.playersService.getPlayerById(id);
    return player;
  }

  @Mutation(() => Player)
  async createPlayer(
    @Args('createPlayerData') createPlayerData: CreatePlayerInput,
  ): Promise<Player> {
    const player = await this.playersService.createPlayer(createPlayerData);
    return player;
  }
}
