import { IsString, IsUUID, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';

@InputType()
export class ResultEntry {
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

@InputType()
export class CreateResultsBulkInput {
  @Field(() => ID)
  @IsUUID()
  tournamentId: string;

  @Field(() => [ResultEntry])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultEntry)
  results: ResultEntry[];
}
