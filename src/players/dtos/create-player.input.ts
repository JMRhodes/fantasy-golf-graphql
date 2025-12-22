import { IsString, IsInt, MinLength, IsOptional } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreatePlayerInput {
  @Field(() => String)
  @IsString()
  @MinLength(3)
  name: string;

  @Field(() => Int)
  @IsInt()
  @IsOptional()
  pgaId?: number | null;

  @Field(() => Int)
  @IsInt()
  salary: number;
}
