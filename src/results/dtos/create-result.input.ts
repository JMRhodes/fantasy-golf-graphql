import { IsString, IsUUID, IsInt, Min } from 'class-validator';
import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateResultInput {
  @Field(() => ID)
  @IsUUID()
  tournamentId: string;

  @Field(() => ID)
  @IsUUID()
  playerId: string;

  @Field(() => String)
  @IsString()
  position: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  points: number;
}
