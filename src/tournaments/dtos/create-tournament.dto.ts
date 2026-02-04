import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(['UPCOMING', 'IN-PROGRESS', 'COMPLETED'])
  status?: 'UPCOMING' | 'IN-PROGRESS' | 'COMPLETED';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;
}
