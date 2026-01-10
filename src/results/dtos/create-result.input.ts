import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateResultInput {
  @Field(() => ID)
  @IsString()
  player: string;

  @Field({ nullable: true })
  @IsString()
  position: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  points?: number | null;
}
