import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTeamInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID)
  ownerId: string;
}
