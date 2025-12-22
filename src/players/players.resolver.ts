import { Player } from './schemas/player.schema';
import { Resolver, Query, Args, Mutation, ID } from '@nestjs/graphql';
import { CreatePlayerInput } from './dtos/create-player.input';
import { PlayersService } from './players.service';

/**
 * Resolver for the Player entity
 * @description This resolver handles all the GraphQL queries and mutations for the Player entity
 */
@Resolver(() => Player)
export class PlayersResolver {
  constructor(private playersService: PlayersService) {}

  /**
   * Fetches all players from the database
   * @returns
   */
  @Query(() => [Player])
  async getAllPlayers(): Promise<Player[]> {
    try {
      const players = await this.playersService.getAllPlayers();
      return players;
    } catch {
      throw new Error('Failed to fetch players');
    }
  }

  /**
   * Fetches a single player by id
   * @param Args id
   * @returns
   */
  @Query(() => Player)
  async getPlayer(@Args('id', { type: () => ID }) id: string): Promise<Player> {
    const player = await this.playersService.getPlayerById(id);
    return player;
  }

  /**
   * Creates a new player in the database
   * @param createPlayerData - The data for the new player
   * @returns
   */
  @Mutation(() => Player)
  async createPlayer(
    @Args('createPlayerData') createPlayerData: CreatePlayerInput,
  ): Promise<Player> {
    const player = await this.playersService.createPlayer(createPlayerData);
    return player;
  }
}
