import { randomInt } from 'node:crypto';
import { Player } from './models/player.model';
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { createPlayerDto } from './dtos/create-player.dto';

@Resolver(() => Player)
export class PlayersResolver {
  allPlayers: Player[] = [
    {
      id: 1,
      name: 'John Doe',
      pgaId: 12345,
      salary: 100000,
      creationDate: new Date(),
    },
    {
      id: 2,
      name: 'Jane Doe',
      pgaId: 12346,
      salary: 90000,
      creationDate: new Date(),
    },
  ];

  @Query(() => [Player])
  getAllPlayers() {
    return this.allPlayers;
  }

  @Query(() => Player)
  getPlayer(@Args('id', { type: () => Int }) id: number) {
    return {
      id,
      name: 'John Doe',
      pgaId: 12345,
      salary: 100000,
      creationDate: new Date(),
    };
  }

  @Mutation(() => Player)
  createPlayer(@Args('createPlayer') { name, pgaId, salary }: createPlayerDto) {
    console.log('createPlayerDto', { name, pgaId, salary });
    const player: Player = {
      id: randomInt(1, 1000),
      name,
      pgaId,
      salary,
      creationDate: new Date(),
    };

    return player;
  }
}
