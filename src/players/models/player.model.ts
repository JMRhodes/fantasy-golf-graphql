import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'player' })
export class Player {
  @Field((type) => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  pgaId: number;

  @Field()
  salary: number;

  @Field()
  creationDate: Date;
}
