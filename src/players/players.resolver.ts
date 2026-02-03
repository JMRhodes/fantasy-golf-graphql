import { Player } from './schemas/player.schema';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { CreatePlayerInput } from './dtos/create-player.input';

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
    } catch (error) {
      throw new Error('Failed to fetch players', { cause: error });
    }
  }

  @ResolveField('totalPoints', () => Number)
  resolveTotalPoints(@Parent() player: Player): number {
    // Placeholder logic for resolving total points
    return 0;
  }

  @Mutation(() => Player)
  async createPlayer(
    @Args('createPlayerInput') createPlayerInput: CreatePlayerInput,
  ): Promise<Player> {
    try {
      const newPlayer =
        await this.playersService.createPlayer(createPlayerInput);
      return newPlayer;
    } catch (error) {
      throw new Error('Failed to create player', { cause: error });
    }
  }

  @Mutation(() => [Player])
  async createPlayersBulk(
    @Args({ name: 'createPlayerInputs', type: () => [CreatePlayerInput] })
    createPlayerInputs: CreatePlayerInput[],
  ): Promise<Player[]> {
    try {
      const createdPlayers: Player[] = [];
      for (const input of createPlayerInputs) {
        const newPlayer = await this.playersService.createPlayer(input);
        createdPlayers.push(newPlayer);
      }
      return createdPlayers;
    } catch (error) {
      throw new Error('Failed to create players in bulk', { cause: error });
    }
  }
}
