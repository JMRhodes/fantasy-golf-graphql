import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Owner {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}
