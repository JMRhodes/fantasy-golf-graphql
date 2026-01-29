import { Player } from './schemas/player.schema';
import { Resolver, Query, Args, Mutation, ID } from '@nestjs/graphql';
import { CreatePlayerInput } from './dtos/create-player.input';
import { PlayersService } from './players.service';
import { GraphQLError } from 'graphql/error';

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
    try {
      const player = await this.playersService.getPlayerById(id);
      return player;
    } catch {
      throw new GraphQLError('Player not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }
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

  /**
   * Creates multiple players in the database.
   * @param createPlayerData - Array of data for the new players
   * @returns
   */
  @Mutation(() => [Player])
  async createPlayersBulk(
    @Args({ name: 'createPlayerData', type: () => [CreatePlayerInput] })
    createPlayerData: CreatePlayerInput[],
  ): Promise<Player[]> {
    const players =
      await this.playersService.createPlayersBulk(createPlayerData);
    return players;
  }

  /**
   * Updates a player's PGA Tour ID
   * @param id - The ID of the player to update
   * @param pgaId - The PGA Tour ID to set
   * @returns The updated player
   */
  @Mutation(() => Player)
  async updatePlayerPgaId(
    @Args('id', { type: () => ID }) id: string,
    @Args('pgaId') pgaId: number,
  ): Promise<Player> {
    try {
      const player = await this.playersService.updatePlayerPgaId(id, pgaId);
      return player;
    } catch {
      throw new GraphQLError('Failed to update player PGA ID', {
        extensions: { code: 'UPDATE_FAILED' },
      });
    }
  }
}
