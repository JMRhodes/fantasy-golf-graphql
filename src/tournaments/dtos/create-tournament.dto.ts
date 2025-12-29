import { IsString, MinLength, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTournamentInput {
  @Field(() => String)
  @IsString()
  @MinLength(3)
  name: string;

  @Field(() => String, { nullable: true, defaultValue: '' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  description?: string;

  @Field(() => String)
  @IsString()
  status: string;

  @Field(() => Date)
  start_date: Date;

  @Field(() => Date)
  end_date: Date;
}
