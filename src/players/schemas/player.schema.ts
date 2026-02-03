import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ObjectType() // GraphQL Object Type decorator
export class Player {
  @Field(() => ID) // GraphQL Field for the 'id' (MongoDB's _id)
  id: string;

  @Field()
  name: string;

  @Field()
  @IsOptional()
  pgaId: number;

  @Field()
  salary: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  avatarUrl: string;
}
