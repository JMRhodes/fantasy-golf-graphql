import { InputType, Field, ID } from '@nestjs/graphql';
import {
  MinLength,
  MaxLength,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

@InputType()
export class PlayerInput {
  @Field(() => ID, { nullable: true })
  @ValidateIf((player: PlayerInput) => !player.name)
  playerId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @ValidateIf((player: PlayerInput) => !player.playerId)
  name?: string;
}
