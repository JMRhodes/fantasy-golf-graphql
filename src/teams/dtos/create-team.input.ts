import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateTeamInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => ID)
  @IsUUID()
  ownerId: string;

  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  playerIds: string[];
}
