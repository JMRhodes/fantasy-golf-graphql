import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Owner } from '../../owners/schemas/owner.schema';
import { Player } from '../../players/schemas/player.schema';

@ObjectType()
export class Team {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => ID)
  ownerId: string;

  @Field(() => Owner, { nullable: true })
  owner?: Owner;

  @Field(() => [Player], { nullable: true })
  players?: Player[];
}
