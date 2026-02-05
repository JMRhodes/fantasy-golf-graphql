import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Result } from '../../results/schemas/result.schema';

export type TournamentStatusEnum = 'UPCOMING' | 'IN-PROGRESS' | 'COMPLETED';

@ObjectType() // GraphQL Object Type decorator
export class Tournament {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  @IsOptional()
  description: string;

  @Field()
  status: TournamentStatusEnum;

  @Field({ nullable: true })
  @IsOptional()
  avatarUrl?: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => [Result], { nullable: true })
  results?: Result[];
}
