import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@ObjectType() // GraphQL Object Type decorator
export class Player {
  @Field(() => ID)
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

  @Field({ defaultValue: 0 })
  @IsOptional()
  totalPoints?: number;

  @Field({ defaultValue: 0 })
  @IsOptional()
  totalWins?: number;
}
