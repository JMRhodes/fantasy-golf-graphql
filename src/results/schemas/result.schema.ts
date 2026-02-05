import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../../players/schemas/player.schema';
import { Tournament } from '../../tournaments/schemas/tournament.schema';

@ObjectType()
export class Result {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  tournamentId: string;

  @Field(() => ID)
  playerId: string;

  @Field()
  position: string;

  @Field(() => Int)
  points: number;

  @Field(() => Player, { nullable: true })
  player?: Player;

  @Field(() => Tournament, { nullable: true })
  tournament?: Tournament;
}
