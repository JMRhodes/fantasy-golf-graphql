import { IsString, IsInt, MinLength } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class createPlayerDto {
  @Field(() => String)
  @IsString()
  @MinLength(3)
  name: string;

  @Field(() => Int)
  @IsInt()
  pgaId: number;

  @Field(() => Int)
  @IsInt()
  salary: number;
}
